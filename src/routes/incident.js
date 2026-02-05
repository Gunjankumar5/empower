const express = require('express');
const router = express.Router();
const Incident = require('../../models/incident');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Create SOS incident
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { message, location, alertType, alertLevel, batteryLevel, networkStatus } = req.body;

    const incident = new Incident({
      user: req.userId,
      message: message || 'Emergency SOS Alert!',
      location: location || {},
      alertType: alertType || 'manual',
      alertLevel: alertLevel || 'urgent',
      status: 'pending',
      batteryLevel,
      networkStatus,
      locationTrail: location ? [{ ...location, timestamp: new Date() }] : [],
    });

    await incident.save();

    // Update user stats
    const User = require('../../models/user');
    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalAlerts: 1, safetyScore: -5 },
    });

    // Emit realtime event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new_sos', {
        id: incident._id,
        userId: req.userId,
        message: incident.message,
        location: incident.location,
        alertType: incident.alertType,
        alertLevel: incident.alertLevel,
        timestamp: incident.createdAt,
      });
    }

    res.status(201).json({
      message: 'SOS alert created successfully',
      incident: {
        id: incident._id,
        message: incident.message,
        location: incident.location,
        alertType: incident.alertType,
        alertLevel: incident.alertLevel,
        status: incident.status,
        createdAt: incident.createdAt,
      },
    });
  } catch (error) {
    console.error('Create SOS error:', error);
    res.status(500).json({ message: 'Failed to create SOS alert', error: error.message });
  }
});

// Get incident history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const incidents = await Incident.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      incidents: incidents.map(inc => ({
        id: inc._id,
        message: inc.message,
        location: inc.location,
        status: inc.status,
        createdAt: inc.createdAt,
        updatedAt: inc.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ message: 'Failed to fetch incidents', error: error.message });
  }
});

// Get specific incident
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const incident = await Incident.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({
      incident: {
        id: incident._id,
        message: incident.message,
        location: incident.location,
        status: incident.status,
        metadata: incident.metadata,
        createdAt: incident.createdAt,
        updatedAt: incident.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ message: 'Failed to fetch incident', error: error.message });
  }
});

// Update incident status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    if (!['pending', 'acknowledged', 'resolved', 'false_alarm'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updateData = { status };
    if (status === 'resolved' || status === 'false_alarm') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.userId;
      if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    }

    const incident = await Incident.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({
      message: 'Incident status updated',
      incident: {
        id: incident._id,
        status: incident.status,
        updatedAt: incident.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ message: 'Failed to update incident', error: error.message });
  }
});

// Update location trail (for live tracking)
router.post('/:id/location', verifyToken, async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    const incident = await Incident.findOneAndUpdate(
      { _id: req.params.id, user: req.userId, status: 'pending' },
      {
        $push: {
          locationTrail: {
            lat,
            lng,
            timestamp: new Date(),
          },
        },
        $set: {
          'location.lat': lat,
          'location.lng': lng,
          'location.address': address,
        },
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found or already resolved' });
    }

    // Emit realtime location update
    const io = req.app.get('io');
    if (io) {
      io.emit('location_update', {
        incidentId: incident._id,
        userId: req.userId,
        location: { lat, lng, address },
        timestamp: new Date(),
      });
    }

    res.json({ message: 'Location updated', locationTrail: incident.locationTrail });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

// Contact acknowledgment
router.post('/:id/acknowledge', verifyToken, async (req, res) => {
  try {
    const { contactId, contactName, location, eta } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          contactResponses: {
            contactId,
            contactName,
            acknowledged: true,
            acknowledgedAt: new Date(),
            location,
            eta,
          },
        },
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Emit realtime acknowledgment
    const io = req.app.get('io');
    if (io) {
      io.emit('contact_acknowledged', {
        incidentId: incident._id,
        contactName,
        eta,
      });
    }

    res.json({ message: 'Acknowledgment recorded', contactResponses: incident.contactResponses });
  } catch (error) {
    console.error('Acknowledge error:', error);
    res.status(500).json({ message: 'Failed to record acknowledgment' });
  }
});

module.exports = router;
