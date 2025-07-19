const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkPlanMiddleware = require('../middleware/checkPlanMiddleware');
const Resume = require('../models/Resume');
const InterviewLog = require('../models/InterviewLog');
const { generateAnswer } = require('../utils/openaiUtils');

// 🧠 POST: Ask a live question and get answer
router.post('/ask', authMiddleware, checkPlanMiddleware, async (req, res) => {
  try {
    const { question } = req.body;

    // ❗ Validate input
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // ✅ Get user resume (latest one)
    const resume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please upload first.' });
    }

    // ✅ Generate answer using OpenAI
    const answer = await generateAnswer(question, resume);

    // ✅ Save to interview log
    const log = new InterviewLog({
      user: req.user.id,
      question,
      answer,
      source: 'live',
    });
    await log.save();

    // ✅ Return answer
    res.json({ answer });
  } catch (err) {
    console.error('❌ /api/live/ask Error:', err);
    res.status(500).json({ message: 'Failed to generate answer', error: err.message });
  }
});

module.exports = router;
