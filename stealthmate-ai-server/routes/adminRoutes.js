
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/authMiddleware');

// ⚠️ Simple Admin Middleware (you can improve later)
const adminOnly = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (user.email !== 'poojakumavat232@gmail.com') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// 📍 GET All Users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
    const users = await User.find().select('-otp -__v -password');

  res.json(users);
});

// 📍 GET Payment Logs
router.get('/payments', authMiddleware, adminOnly, async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

module.exports = router;


