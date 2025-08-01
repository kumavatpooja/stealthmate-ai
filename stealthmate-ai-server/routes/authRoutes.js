const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const { sendOTP } = require('../utils/emailUtils');
const { generateToken } = require('../utils/jwtUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Register new user
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
      plan: {
        name: 'Free',
        dailyLimit: 3,
        usedToday: 0,
        expiresAt: null,
      },
      usageCount: 0,
    });

    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({ message: 'User registered successfully', token, user: newUser });
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ✅ Send OTP
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

// ✅ Verify OTP
router.post('/login/verify', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("❌ OTP Verify Error:", err.message);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
});

// ✅ Google Login – JWT Flow
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
        plan: {
          name: 'Free',
          dailyLimit: 3,
          usedToday: 0,
          expiresAt: null,
        },
      });
      await user.save();
    }

    const token = generateToken(user);
    res.json({ token, user });

  } catch (error) {
    console.error('❌ Google Token Error:', error.message);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// ✅ Google OAuth Redirect Flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user._id,
        email: req.user.email,
        name: req.user.name, // ✅ Add name for frontend
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/google-success?token=${token}`);
  }
);

module.exports = router;
