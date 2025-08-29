//stealthmate-ai-server\routes\adminRoutes.js//

const express = require('express'); 
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/authMiddleware');

// ⚠️ Admin Middleware — checks login and email
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('email');
    if (!user || user.email.toLowerCase() !== 'poojakumavat232@gmail.com') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📍 GET All Users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-otp -__v -password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// 📍 GET Payment Logs
router.get('/payments', authMiddleware, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

module.exports = router;
