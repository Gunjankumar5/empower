const express = require('express');
const router = express.Router();
const User = require('../../models/user');
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

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emergencyContacts: user.emergencyContacts || [],
        emergencyMessage: user.emergencyMessage,
        autoLocationSharing: user.autoLocationSharing,
        pushNotifications: user.pushNotifications,
        nfcDevices: user.nfcDevices || [],
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update user profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const {
      name,
      phone,
      emergencyMessage,
      autoLocationSharing,
      pushNotifications,
      shakeToAlert,
      stealthMode,
      voiceActivation,
      voiceCode,
      darkMode,
      autoCheckIn,
      batteryAlertThreshold,
      helpNetwork,
      shareAnonymous,
      settingsPin,
      disguiseMode,
      disguiseIcon,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (emergencyMessage !== undefined) updateData.emergencyMessage = emergencyMessage;
    if (autoLocationSharing !== undefined) updateData.autoLocationSharing = autoLocationSharing;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
    if (shakeToAlert !== undefined) updateData.shakeToAlert = shakeToAlert;
    if (stealthMode !== undefined) updateData.stealthMode = stealthMode;
    if (voiceActivation !== undefined) updateData.voiceActivation = voiceActivation;
    if (voiceCode !== undefined) updateData.voiceCode = voiceCode;
    if (darkMode !== undefined) updateData.darkMode = darkMode;
    if (autoCheckIn !== undefined) updateData.autoCheckIn = autoCheckIn;
    if (batteryAlertThreshold !== undefined) updateData.batteryAlertThreshold = batteryAlertThreshold;
    if (helpNetwork !== undefined) updateData.helpNetwork = helpNetwork;
    if (shareAnonymous !== undefined) updateData.shareAnonymous = shareAnonymous;
    if (settingsPin !== undefined) updateData.settingsPin = settingsPin;
    if (disguiseMode !== undefined) updateData.disguiseMode = disguiseMode;
    if (disguiseIcon !== undefined) updateData.disguiseIcon = disguiseIcon;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emergencyMessage: user.emergencyMessage,
        autoLocationSharing: user.autoLocationSharing,
        pushNotifications: user.pushNotifications,
        shakeToAlert: user.shakeToAlert,
        stealthMode: user.stealthMode,
        voiceActivation: user.voiceActivation,
        voiceCode: user.voiceCode,
        darkMode: user.darkMode,
        autoCheckIn: user.autoCheckIn,
        batteryAlertThreshold: user.batteryAlertThreshold,
        helpNetwork: user.helpNetwork,
        shareAnonymous: user.shareAnonymous,
        disguiseMode: user.disguiseMode,
        safetyScore: user.safetyScore,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Get emergency contacts
router.get('/contacts', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('emergencyContacts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      contacts: user.emergencyContacts || [],
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Failed to fetch contacts', error: error.message });
  }
});

// Add emergency contact
router.post('/contacts', verifyToken, async (req, res) => {
  try {
    const { name, relation, phone } = req.body;

    if (!name || !relation || !phone) {
      return res.status(400).json({ message: 'Name, relation, and phone are required' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newContact = {
      id: Date.now().toString(),
      name,
      relation,
      phone,
    };

    user.emergencyContacts.push(newContact);
    await user.save();

    res.status(201).json({
      message: 'Contact added successfully',
      contact: newContact,
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ message: 'Failed to add contact', error: error.message });
  }
});

// Delete emergency contact
router.delete('/contacts/:id', verifyToken, async (req, res) => {
  try {
    const contactId = req.params.id;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const initialLength = user.emergencyContacts.length;
    user.emergencyContacts = user.emergencyContacts.filter(
      (contact) => contact.id !== contactId
    );

    if (user.emergencyContacts.length === initialLength) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await user.save();

    res.json({
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Failed to delete contact', error: error.message });
  }
});

// Manage safe zones
router.post('/safezones', verifyToken, async (req, res) => {
  try {
    const { name, lat, lng, radius, notifyOnExit, notifyOnEnter } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newZone = {
      id: Date.now().toString(),
      name,
      lat,
      lng,
      radius: radius || 100,
      notifyOnExit: notifyOnExit !== false,
      notifyOnEnter: notifyOnEnter || false,
    };

    user.safeZones.push(newZone);
    await user.save();

    res.status(201).json({
      message: 'Safe zone added',
      zone: newZone,
    });
  } catch (error) {
    console.error('Add safe zone error:', error);
    res.status(500).json({ message: 'Failed to add safe zone' });
  }
});

// Delete safe zone
router.delete('/safezones/:id', verifyToken, async (req, res) => {
  try {
    const zoneId = req.params.id;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.safeZones = user.safeZones.filter((zone) => zone.id !== zoneId);
    await user.save();

    res.json({ message: 'Safe zone deleted' });
  } catch (error) {
    console.error('Delete safe zone error:', error);
    res.status(500).json({ message: 'Failed to delete safe zone' });
  }
});

// Get safety score and stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('safetyScore totalAlerts totalCheckIns emergencyContacts safeZones');
    const Incident = require('../../models/incident');
    
    const recentIncidents = await Incident.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      safetyScore: user.safetyScore || 0,
      totalAlerts: user.totalAlerts || 0,
      totalCheckIns: user.totalCheckIns || 0,
      contactsCount: user.emergencyContacts.length || 0,
      safeZonesCount: user.safeZones.length || 0,
      recentIncidents: recentIncidents.map(inc => ({
        id: inc._id,
        type: inc.alertType,
        status: inc.status,
        date: inc.createdAt,
      })),
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;