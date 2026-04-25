const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/user');
const { createAndNotifyAlert } = require('../services/alertService');

const router = express.Router();

const sendSuccess = (res, data, status = 200) => res.status(status).json({ success: true, data });
const sendError = (res, error, status = 400) => res.status(status).json({ success: false, error });

router.post('/scan', async (req, res) => {
  try {
    const tagId = String(req.body.tagId || '').trim();
    if (!tagId) {
      return sendError(res, 'tagId is required', 400);
    }

    const user = await User.findOne({ nfcTagId: tagId });
    if (!user) {
      return sendError(res, 'No user is linked to this NFC tag', 404);
    }

    const location = user.lastKnownLocation || {};
    const resolvedLat = location.lat ?? null;
    const resolvedLng = location.lng ?? null;

    const alert = await createAndNotifyAlert({ user, lat: resolvedLat, lng: resolvedLng, type: 'nfc' });
    return sendSuccess(res, {
      userId: user._id,
      alert,
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

