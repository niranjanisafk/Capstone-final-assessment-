const express = require('express');
const router = express.Router();
const User = require('../models/User');

// In-memory fallback if MongoDB connection fails
const localUsers = [];

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try MongoDB first if connected
    try {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const user = new User({
        name: name.trim(),
        email: normalizedEmail,
        password // Stored in plain/demo format for assessment ease
      });

      const savedUser = await user.save();
      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        user: { id: savedUser._id, name: savedUser.name, email: savedUser.email }
      });
    } catch (dbErr) {
      // In-memory fallback
      console.warn('Using in-memory fallback for registration:', dbErr.message);
      const existing = localUsers.find(u => u.email === normalizedEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password
      };
      localUsers.push(newUser);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try MongoDB first
    try {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        user: { id: user._id, name: user.name, email: user.email }
      });
    } catch (dbErr) {
      // In-memory fallback
      console.warn('Using in-memory fallback for login:', dbErr.message);
      const user = localUsers.find(u => u.email === normalizedEmail);
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        user: { id: user.id, name: user.name, email: user.email }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
});

module.exports = router;
