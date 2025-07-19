const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const authMiddleware = require('../middleware/authMiddleware');

// ✉️ POST a new support message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim().length < 5) {
      return res.status(400).json({ message: 'Message must be at least 5 characters' });
    }

    const newMsg = new SupportMessage({
      user: req.userId,
      message,
    });

    await newMsg.save();
    res.status(201).json({ message: 'Support message sent successfully' });
  } catch (err) {
    console.error('❌ Support Message Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🧾 (Optional) Admin view - get all messages
router.get('/all', authMiddleware, async (req, res) => {
  try {
    // Use admin check if needed
    const messages = await SupportMessage.find().populate('user', 'email').sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
