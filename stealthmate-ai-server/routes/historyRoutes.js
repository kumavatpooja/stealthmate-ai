const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const InterviewLog = require('../models/InterviewLog');

// GET /api/history/my
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const logs = await InterviewLog.find({
      user: req.user.id,
      source: 'live', // ✅ Only live interviews
    })
      .sort({ createdAt: -1 }) // Latest first
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(logs);
  } catch (err) {
    console.error('Error fetching interview history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




