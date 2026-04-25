const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/user');
const Alert = require('../models/Alert');
const { createAndNotifyAlert, reverseGeocode } = require('../services/alertService');

const router = express.Router();

const sendSuccess = (res, data, status = 200) => res.status(status).json({ success: true, data });
const sendError = (res, error, status = 400) => res.status(status).json({ success: false, error });

router.post('/trigger', auth, async (req, res) => {
  try {
    const { lat, lng, type = 'sos' } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const resolvedLat = lat ?? user.lastKnownLocation?.lat ?? null;
    const resolvedLng = lng ?? user.lastKnownLocation?.lng ?? null;

    const alert = await createAndNotifyAlert({ user, lat: resolvedLat, lng: resolvedLng, type });
    return sendSuccess(res, alert, 201);
  } catch (error) {
    console.error('Trigger alert error:', error);
    return sendError(res, error.message || 'Failed to trigger alert', 500);
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ timestamp: -1, createdAt: -1 });
    return sendSuccess(
      res,
      alerts.map((alert) => ({
        id: alert._id,
        userId: alert.userId,
        location: alert.location,
        timestamp: alert.timestamp,
        type: alert.type,
        notifiedContacts: alert.notifiedContacts,
        resolved: alert.resolved,
        resolvedAt: alert.resolvedAt,
      }))
    );
  } catch (error) {
    console.error('History error:', error);
    return sendError(res, 'Failed to load alert history', 500);
  }
});

router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return sendError(res, 'Alert not found', 404);
    }

    return sendSuccess(res, {
      id: alert._id,
      resolved: alert.resolved,
      resolvedAt: alert.resolvedAt,
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    return sendError(res, 'Failed to resolve alert', 500);
  }
});

router.get('/reverse-geocode', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const address = await reverseGeocode(lat, lng);
    return sendSuccess(res, { address });
  } catch (error) {
    return sendError(res, 'Failed to reverse geocode location', 500);
  }
});

// Get single alert by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, userId: req.user.id });
    if (!alert) {
      return sendError(res, 'Alert not found', 404);
    }

    return sendSuccess(res, {
      id: alert._id,
      userId: alert.userId,
      location: alert.location,
      timestamp: alert.timestamp,
      type: alert.type,
      notifiedContacts: alert.notifiedContacts,
      resolved: alert.resolved,
      resolvedAt: alert.resolvedAt,
      locationTrail: alert.locationTrail || [],
    });
  } catch (error) {
    console.error('Get alert error:', error);
    return sendError(res, 'Failed to load alert', 500);
  }
});

// Real-time location streaming during active alerts
router.post('/:id/location', auth, async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;

    // Validate location data
    if (lat === undefined || lat === null || lng === undefined || lng === null) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    // Verify alert exists and belongs to user
    const alert = await Alert.findOne({ _id: req.params.id, userId: req.user.id });
    if (!alert) {
      return sendError(res, 'Alert not found', 404);
    }

    // Don't accept location updates for resolved alerts
    if (alert.resolved) {
      return sendError(res, 'Cannot update location for resolved alert', 400);
    }

    // Add location to trail
    alert.locationTrail.push({
      lat: Number(lat),
      lng: Number(lng),
      accuracy: accuracy ? Number(accuracy) : null,
      timestamp: new Date(),
    });

    // Keep only last 1000 location points per alert (memory management)
    if (alert.locationTrail.length > 1000) {
      alert.locationTrail = alert.locationTrail.slice(-1000);
    }

    // Update alert's current location
    alert.location = {
      lat: Number(lat),
      lng: Number(lng),
      address: alert.location.address || '', // Keep existing address
    };

    await alert.save();

    return sendSuccess(res, {
      message: 'Location updated',
      trailLength: alert.locationTrail.length,
    });
  } catch (error) {
    console.error('Location update error:', error);
    return sendError(res, error.message || 'Failed to update location', 500);
  }
});

module.exports = router;