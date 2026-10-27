const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register a user
router.post('/register', async (req, res) => {
  try {
    const { username, email, rollNumber, casualLeave = 10, medicalLeave = 10 } = req.body;
    if (!username?.trim() || !email?.trim() || !rollNumber?.trim()) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if ([casualLeave, medicalLeave].some(n => !Number.isInteger(Number(n)) || Number(n) < 0)) {
      return res.status(400).json({ message: 'Leave balances must be non-negative whole numbers.' });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(409).json({ message: 'A user with this email already exists.' });

    const user = await User.create({
      username: username.trim(), email: email.toLowerCase().trim(), rollNumber: rollNumber.trim(),
      casualLeave: Number(casualLeave), medicalLeave: Number(medicalLeave)
    });
    res.status(201).json({ message: 'User created successfully. You can now log in.' , userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error while registering user.' });
  }
});

// Simple email-based login, matching the lab manual's flow
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found. Please register first.' });
    res.json({ message: 'Login successful', userId: user._id, username: user.username,
      rollNumber: user.rollNumber, casualLeave: user.casualLeave, medicalLeave: user.medicalLeave });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
});

// Get current leave balance
router.get('/leave-balance/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ casualLeave: user.casualLeave, medicalLeave: user.medicalLeave });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch leave balance.' });
  }
});

// Apply for leave: deduct requested days from the selected balance
router.post('/apply-leave/:id', async (req, res) => {
  try {
    const { type } = req.body;
    const days = Number(req.body.days);
    if (!Number.isInteger(days) || days <= 0) {
      return res.status(400).json({ message: 'Enter a valid positive number of days.' });
    }
    if (!['casual', 'medical'].includes(type)) {
      return res.status(400).json({ message: 'Invalid leave type.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const field = type === 'casual' ? 'casualLeave' : 'medicalLeave';
    if (days > user[field]) {
      return res.status(400).json({ message: `Insufficient ${type} leave balance.` });
    }
    user[field] -= days;
    await user.save();
    res.json({ message: 'Leave application recorded successfully.',
      casualLeave: user.casualLeave, medicalLeave: user.medicalLeave });
  } catch (error) {
    console.error('Leave application error:', error);
    res.status(500).json({ message: 'Server error while applying for leave.' });
  }
});

module.exports = router;
