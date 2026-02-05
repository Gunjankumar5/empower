const express = require("express");
const auth = require("../middlewares/auth");
const User = require("../models/user");

const router = express.Router();

// Get user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add emergency contact
router.post("/contacts", auth, async (req, res) => {
  const { contact } = req.body;
  try {
    const user = await User.findById(req.user);
    user.emergencyContacts.push(contact);
    await user.save();
    res.json({ message: "Contact added", contacts: user.emergencyContacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
