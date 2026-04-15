const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profilePic: user.profilePic || '',
  nfcTagId: user.nfcTagId || '',
  emergencyContacts: user.emergencyContacts || [],
  lastKnownLocation: user.lastKnownLocation || null,
  createdAt: user.createdAt,
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, emergencyContacts = [] } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, error: 'name, email, password, and phone are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      emergencyContacts: emergencyContacts,
    });

    const token = signToken(user);
    return res.status(201).json({ success: true, data: { token, user: sanitizeUser(user) } });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({ success: true, data: { token, user: sanitizeUser(user) } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load user' });
  }
});

module.exports = router;
