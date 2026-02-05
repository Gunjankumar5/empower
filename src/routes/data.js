const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');

// Serve contacts dataset (sample)
router.get('/contacts', (req, res) => {
  const p = path.join(dataDir, 'contacts.json');
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'contacts dataset missing' });
  const raw = fs.readFileSync(p);
  return res.json(JSON.parse(raw));
});

// Serve queries dataset (sample file)
router.get('/queries', (req, res) => {
  const p = path.join(dataDir, 'queries.json');
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'queries dataset missing' });
  const raw = fs.readFileSync(p);
  return res.json(JSON.parse(raw));
});

// Serve sample credentials (DO NOT USE IN PRODUCTION)
router.get('/credentials', (req, res) => {
  const p = path.join(dataDir, 'credentials.json');
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'credentials dataset missing' });
  const raw = fs.readFileSync(p);
  return res.json(JSON.parse(raw));
});

module.exports = router;
