const express = require("express");
const auth = require("../middlewares/auth");
const Incident = require("../models/incident");
const sendNotification = require("../services/notifications");

const router = express.Router();

// NFC Trigger (simulate emergency)
router.post("/trigger", auth, async (req, res) => {
  const { location } = req.body;

  try {
    const incident = new Incident({ user: req.user, location });
    await incident.save();

    // Notify emergency contacts
    await sendNotification(req.user, location);

    res.json({ message: "Emergency triggered", incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
