const express = require('express');
const router = express.Router();
const CheckIn = require('../../models/checkIn');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Schedule check-in
router.post('/schedule', verifyToken, async (req, res) => {
  try {
    const { scheduledTime, notes } = req.body;

    const checkIn = new CheckIn({
      user: req.userId,
      scheduledTime: new Date(scheduledTime),
      notes,
      status: 'pending',
    });

    await checkIn.save();

    res.status(201).json({
      message: 'Check-in scheduled',
      checkIn: {
        id: checkIn._id,
        scheduledTime: checkIn.scheduledTime,
        status: checkIn.status,
      },
    });
  } catch (error) {
    console.error('Schedule check-in error:', error);
    res.status(500).json({ message: 'Failed to schedule check-in' });
  }
});

// Complete check-in
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const { location } = req.body;

    const checkIn = await CheckIn.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        checkInTime: new Date(),
        status: 'completed',
        location,
      },
      { new: true }
    );

    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalCheckIns: 1, safetyScore: 5 },
    });

    res.json({
      message: 'Check-in completed',
      checkIn,
    });
  } catch (error) {
    console.error('Complete check-in error:', error);
    res.status(500).json({ message: 'Failed to complete check-in' });
  }
});

// Get check-ins
router.get('/list', verifyToken, async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ user: req.userId })
      .sort({ scheduledTime: -1 })
      .limit(50);

    res.json({ checkIns });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ message: 'Failed to fetch check-ins' });
  }
});

// Delete check-in
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const checkIn = await CheckIn.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    res.json({ message: 'Check-in deleted' });
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(500).json({ message: 'Failed to delete check-in' });
  }
});

module.exports = router;
