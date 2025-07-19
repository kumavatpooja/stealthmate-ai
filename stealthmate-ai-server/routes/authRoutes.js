const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const { sendOTP, sendResetPasswordEmail } = require('../utils/emailUtils');
const { generateToken } = require('../utils/jwtUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Email OTP Login
router.post('/login/email', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, otp });
  } else {
    user.otp = otp;
  }

  await user.save();
  await sendOTP(email, otp);
  res.json({ message: 'OTP sent to email' });
});

// ✅ OTP Verify
router.post('/login/verify', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp) {
    return res.status(401).json({ message: 'Invalid OTP' });
  }

  user.isVerified = true;
  user.otp = null;
  await user.save();

  const token = generateToken(user);
  res.json({ token, user });
});

// ✅ Google Login (JWT method)
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
        plan: { name: 'Free' },
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

// ✅ Google OAuth via Passport
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.redirect(`http://localhost:5173/google-success?token=${token}`);
  }
);

// ✅ Email + Password Registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(409).json({ message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    isVerified: true,
    authProvider: 'email',
    plan: { name: 'Free' }
  });

  await newUser.save();
  const token = generateToken(newUser);
  res.json({ token, user: newUser });
});

// ✅ Email + Password Login
router.post('/login/password', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user);
  res.json({ token, user });
});

// ✅ Forgot Password (Send reset link)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Email not found' });

  const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

  await sendResetPasswordEmail(email, resetToken);
  res.json({ message: 'Password reset link sent to email' });
});

// ✅ Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
