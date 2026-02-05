const express = require("express");
const router = express.Router();
const Emergency = require("../models/Emergency");

// Create a single SOS (mobile online)
router.post("/sos", async (req, res) => {
  try {
    const { userId, lat, lng, address, message, source = "online", metadata } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const emergency = await Emergency.create({
      userId,
      location: lat && lng ? { lat, lng, address } : undefined,
      message,
      source,
      metadata,
    });

    // emit realtime event
    const io = req.app.get("io");
    if (io) io.emit("new_sos", emergency); // broadcast

    return res.status(201).json(emergency);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Batch sync: receive array of offline SOS events
router.post("/batch", async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : req.body.events;
    if (!events || !events.length) return res.status(400).json({ error: "No events provided" });

    const docs = events.map((e) => ({
      userId: e.userId,
      location: e.lat && e.lng ? { lat: e.lat, lng: e.lng, address: e.address } : undefined,
      message: e.message,
      source: e.source || "offline",
      timestamp: e.timestamp ? new Date(e.timestamp) : undefined,
      metadata: e.metadata,
    }));

    const created = await Emergency.insertMany(docs, { ordered: false });

    // emit realtime for each created
    const io = req.app.get("io");
    if (io) created.forEach((doc) => io.emit("new_sos", doc));

    return res.status(201).json({ createdCount: created.length, created });
  } catch (err) {
    console.error(err);
    // partial success handling
    return res.status(500).json({ error: "Failed to process batch", details: err.message });
  }
});

// Get recent emergencies
router.get("/latest", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const list = await Emergency.find().sort({ createdAt: -1 }).limit(limit).lean();
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get single emergency
router.get("/:id", async (req, res) => {
  try {
    const doc = await Emergency.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Update status (acknowledge/resolve)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "acknowledged", "resolved"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const updated = await Emergency.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });

    // notify user-specific room
    const io = req.app.get("io");
    if (io) io.to(`user_${updated.userId}`).emit("sos_status_update", updated);

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;