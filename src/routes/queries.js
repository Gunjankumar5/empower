const express = require('express');
const router = express.Router();
const Query = require('../models/Query');

// Log a user query / question
router.post('/', async (req, res) => {
  try {
    const { userId, question, details, metadata } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });

    const q = await Query.create({ userId, question, details, metadata });
    return res.status(201).json(q);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get recent queries
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const list = await Query.find().sort({ createdAt: -1 }).limit(limit).lean();
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
