const express = require('express');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = express.Router();

const sendSuccess = (res, data, status = 200) => res.status(status).json({ success: true, data });
const sendError = (res, error, status = 400) => res.status(status).json({ success: false, error });

const serializeProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profilePic: user.profilePic || '',
  nfcTagId: user.nfcTagId || '',
  emergencyContacts: user.emergencyContacts || [],
  lastKnownLocation: user.lastKnownLocation || null,
  createdAt: user.createdAt,
});

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, serializeProfile(user));
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 'Failed to load profile', 500);
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const { name, phone, profilePic } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profilePic !== undefined) user.profilePic = profilePic;

    await user.save();
    return sendSuccess(res, serializeProfile(user));
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Failed to update profile', 500);
  }
});

router.post('/nfc', auth, async (req, res) => {
  try {
    const tagId = String(req.body.tagId || '').trim();
    if (!tagId) {
      return sendError(res, 'tagId is required', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.nfcTagId = tagId;
    await user.save();

    return sendSuccess(res, { nfcTagId: user.nfcTagId });
  } catch (error) {
    console.error('Register NFC error:', error);
    return sendError(res, 'Failed to register NFC tag', 500);
  }
});

// Safe Zones Management Endpoints

// GET /api/profile/safe-zones - Retrieve all safe zones for the user
router.get('/safe-zones', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      zones: (user.safe_zones || []).map((zone) => ({
        id: zone.id,
        name: zone.name,
        lat: zone.lat,
        lng: zone.lng,
        radius: zone.radius,
        createdAt: zone.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get safe zones error:', error);
    return sendError(res, 'Failed to load safe zones', 500);
  }
});

// POST /api/profile/safe-zones - Create a new safe zone
router.post('/safe-zones', auth, async (req, res) => {
  try {
    const { name, lat, lng, radius } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return sendError(res, 'Zone name is required', 400);
    }

    if (lat === undefined || lat === null || typeof lat !== 'number') {
      return sendError(res, 'Valid latitude is required', 400);
    }

    if (lng === undefined || lng === null || typeof lng !== 'number') {
      return sendError(res, 'Valid longitude is required', 400);
    }

    if (!radius || typeof radius !== 'number' || radius < 100 || radius > 50000) {
      return sendError(res, 'Radius must be between 100 and 50000 meters', 400);
    }

    // Validate latitude and longitude ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return sendError(res, 'Invalid latitude/longitude values', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Initialize safe_zones array if not exists
    if (!user.safe_zones) {
      user.safe_zones = [];
    }

    // Check for duplicate zone names
    const duplicateName = user.safe_zones.some(
      (zone) => zone.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicateName) {
      return sendError(res, 'Zone with this name already exists', 400);
    }

    // Check limit (max 10 safe zones per user)
    if (user.safe_zones.length >= 10) {
      return sendError(res, 'Maximum 10 safe zones allowed', 400);
    }

    // Create new zone
    const newZone = {
      name: name.trim(),
      lat: Number(lat),
      lng: Number(lng),
      radius: Number(radius),
      createdAt: new Date(),
    };

    user.safe_zones.push(newZone);
    await user.save();

    return sendSuccess(
      res,
      {
        zone: {
          id: user.safe_zones[user.safe_zones.length - 1].id,
          name: newZone.name,
          lat: newZone.lat,
          lng: newZone.lng,
          radius: newZone.radius,
          createdAt: newZone.createdAt,
        },
      },
      201
    );
  } catch (error) {
    console.error('Create safe zone error:', error);
    return sendError(res, error.message || 'Failed to create safe zone', 500);
  }
});

// DELETE /api/profile/safe-zones/:zoneId - Delete a safe zone
router.delete('/safe-zones/:zoneId', auth, async (req, res) => {
  try {
    const { zoneId } = req.params;

    if (!zoneId) {
      return sendError(res, 'Zone ID is required', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Find and remove the zone
    const initialLength = user.safe_zones?.length || 0;
    user.safe_zones = (user.safe_zones || []).filter((zone) => zone.id !== zoneId);

    if (user.safe_zones.length === initialLength) {
      return sendError(res, 'Zone not found', 404);
    }

    await user.save();

    return sendSuccess(res, {
      message: 'Zone deleted successfully',
      zones: (user.safe_zones || []).map((zone) => ({
        id: zone.id,
        name: zone.name,
        lat: zone.lat,
        lng: zone.lng,
        radius: zone.radius,
        createdAt: zone.createdAt,
      })),
    });
  } catch (error) {
    console.error('Delete safe zone error:', error);
    return sendError(res, 'Failed to delete safe zone', 500);
  }
});

module.exports = router;