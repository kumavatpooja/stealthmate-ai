
//stealthmate-ai-server\routes\authRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const { sendOTP } = require('../utils/emailUtils');
const { generateToken } = require('../utils/jwtUtils');
const authMiddleware = require('../middleware/authMiddleware');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ----------------- REGISTER -----------------
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({
      name,
      email,
      isVerified: true,
      authProvider: 'email',
      role: email === "poojakumavat232@gmail.com" ? "admin" : "user",
      plan: { name: 'Free', dailyLimit: 3, usedToday: 0, expiresAt: null },
      usageCount: 0,
    });
    await newUser.save();

    const token = await generateToken(newUser._id);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ----------------- SEND OTP -----------------
router.post('/login/email', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not registered. Please register first.' });
    }

    user.otp = otp;
    await user.save();

    console.log(`📩 OTP for ${email}: ${otp}`);
    await sendOTP(email, otp);

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error("❌ OTP Send Error:", err.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// ----------------- VERIFY OTP -----------------
router.post('/login/verify', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = null;

    // 🔑 Ensure admin role
    if (email === "poojakumavat232@gmail.com") {
      user.role = "admin";
    }

    await user.save();

    const token = await generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("❌ OTP Verify Error:", err.message);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
});

// ----------------- GOOGLE TOKEN LOGIN -----------------
router.post('/login/google-token', async (req, res) => {
  const { token: googleToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        picture,
        isVerified: true,
        authProvider: 'google',
        role: email === "poojakumavat232@gmail.com" ? "admin" : "user",
        plan: { name: 'Free', dailyLimit: 3, usedToday: 0, expiresAt: null },
      });
      await user.save();
    } else {
      if (email === "poojakumavat232@gmail.com" && user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }
    }

    const token = await generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('❌ Google Token Error:', error.message);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// ----------------- CHECK LOGIN STATUS -----------------
router.get('/check-login-status', async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) return res.status(400).json({ message: "Email required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ loggedIn: false });

    const token = await generateToken(user._id);
    return res.status(200).json({
      loggedIn: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('❌ Login Status Check Error:', err.message);
    res.status(500).json({ message: "Error checking login status" });
  }
});

// ----------------- /me ENDPOINT -----------------
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // ✅ Always fetch fresh from DB
    const user = await User.findById(req.userId).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,   // ✅ trust DB, not token
    });
  } catch (err) {
    console.error("❌ Error in /auth/me:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;
