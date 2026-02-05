const express = require('express');
const router = express.Router();
const SafetyReport = require('../../models/safetyReport');
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

// Submit safety report
router.post('/report', verifyToken, async (req, res) => {
  try {
    const { location, reportType, severity, description, timeOfDay, anonymous } = req.body;

    const report = new SafetyReport({
      location,
      reportType,
      severity: severity || 'medium',
      description,
      timeOfDay,
      anonymous: anonymous !== false,
      reportedBy: anonymous ? null : req.userId,
    });

    await report.save();

    res.status(201).json({
      message: 'Safety report submitted',
      report: {
        id: report._id,
        location: report.location,
        reportType: report.reportType,
        severity: report.severity,
      },
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

// Get nearby safety reports
router.post('/nearby', verifyToken, async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.body; // radius in meters

    // Simple radius query (for production, use geospatial indexing)
    const reports = await SafetyReport.find({
      'location.lat': {
        $gte: lat - (radius / 111320),
        $lte: lat + (radius / 111320),
      },
      'location.lng': {
        $gte: lng - (radius / (111320 * Math.cos(lat * Math.PI / 180))),
        $lte: lng + (radius / (111320 * Math.cos(lat * Math.PI / 180))),
      },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ reports });
  } catch (error) {
    console.error('Get nearby reports error:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Get safety heatmap data
router.post('/heatmap', verifyToken, async (req, res) => {
  try {
    const { bounds } = req.body; // { north, south, east, west }

    const reports = await SafetyReport.aggregate([
      {
        $match: {
          'location.lat': { $gte: bounds.south, $lte: bounds.north },
          'location.lng': { $gte: bounds.west, $lte: bounds.east },
          createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            lat: { $round: ['$location.lat', 3] },
            lng: { $round: ['$location.lng', 3] },
          },
          count: { $sum: 1 },
          avgSeverity: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$severity', 'low'] }, then: 1 },
                  { case: { $eq: ['$severity', 'medium'] }, then: 2 },
                  { case: { $eq: ['$severity', 'high'] }, then: 3 },
                  { case: { $eq: ['$severity', 'critical'] }, then: 4 },
                ],
                default: 2,
              },
            },
          },
        },
      },
    ]);

    res.json({ heatmap: reports });
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ message: 'Failed to fetch heatmap' });
  }
});

// Vote on report
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'

    const update = vote === 'up' ? { $inc: { upvotes: 1 } } : { $inc: { downvotes: 1 } };

    const report = await SafetyReport.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Vote recorded', upvotes: report.upvotes, downvotes: report.downvotes });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Failed to record vote' });
  }
});

module.exports = router;
