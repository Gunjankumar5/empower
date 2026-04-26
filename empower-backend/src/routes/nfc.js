const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/user');
const { createAndNotifyAlert } = require('../services/alertService');

const router = express.Router();

const sendSuccess = (res, data, status = 200) => res.status(status).json({ success: true, data });
const sendError = (res, error, status = 400) => res.status(status).json({ success: false, error });

router.post('/scan', async (req, res) => {
  try {
    const rawTagId = req.body.tagId ?? req.body.tag ?? '';
    const { lat, lng } = req.body;
    const tagId = String(rawTagId).trim();

    if (!tagId) {
      return sendError(res, 'tagId is required', 400);
    }

    const user = await User.findOne({ nfcTagId: tagId });
    if (!user) {
      return sendError(res, 'NFC tag not registered to any user', 404);
    }

    // Use provided location or fall back to user's last known location
    let resolvedLat = lat;
    let resolvedLng = lng;
    let locationSource = 'device';
    let locationWarning = '';

    if (resolvedLat == null || resolvedLng == null) {
      const location = user.lastKnownLocation || {};
      if (location.lat != null && location.lng != null) {
        resolvedLat = location.lat;
        resolvedLng = location.lng;
        locationSource = 'profile';
      } else {
        locationSource = 'unavailable';
        locationWarning = 'No live GPS location was available, so the SOS was sent without coordinates.';
      }
    }

    // Create and send alert
    const alert = await createAndNotifyAlert({
      user,
      lat: resolvedLat,
      lng: resolvedLng,
      type: 'nfc',
    });

    // Count notified contacts (those with status: sent or skipped)
    const contactsNotified = (alert.notifiedContacts || []).filter(
      (c) => c.status === 'sent' || c.status === 'skipped'
    ).length;

    return sendSuccess(res, {
      userId: user._id,
      contactsNotified,
      alert,
      locationSource,
      locationWarning,
    }, 201);
  } catch (error) {
    console.error('NFC scan error:', error);
    return sendError(res, 'Failed to process NFC scan', 500);
  }
});

router.post('/register', auth, async (req, res) => {
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
    console.error('NFC register error:', error);
    return sendError(res, 'Failed to register NFC tag', 500);
  }
});

module.exports = router;

