const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

const router = express.Router();

// Keep a lightweight route for quick API sanity checks.
router.get('/', (req, res) => {
  res.send('NFC route working!');
});

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

router.post('/register', verifyToken, async (req, res) => {
  try {
    const deviceId = String(req.body?.deviceId || '').trim();

    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!Array.isArray(user.nfcDevices)) {
      user.nfcDevices = [];
    }

    if (!user.nfcDevices.includes(deviceId)) {
      user.nfcDevices.push(deviceId);
      await user.save();
    }

    return res.status(201).json({
      message: 'NFC device registered successfully',
      deviceId,
      nfcDevices: user.nfcDevices,
    });
  } catch (error) {
    console.error('NFC register error:', error);
    return res.status(500).json({ message: 'Failed to register NFC device' });
  }
});

module.exports = router;

