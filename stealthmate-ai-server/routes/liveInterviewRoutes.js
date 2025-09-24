// stealthmate-ai-server/routes/liveInterviewRoutes.js
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
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // 📝 Always fetch the latest uploaded resume
    const resume = await Resume.findOne({ user: req.userId }).sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(400).json({ message: 'Resume data missing. Please upload first.' });
    }

    // 🤖 Generate AI answer using resume
    const answer = await generateAnswer(question, resume);

    // 💾 Save in InterviewLog
    const log = new InterviewLog({
      user: req.userId,
      question,
      answer,
      source: 'live'
    });
    await log.save();

    res.json({ answer });
  } catch (err) {
    console.error('❌ Live Interview Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📜 GET: User's live interview history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const logs = await InterviewLog.find({ user: req.userId, source: 'live' }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error('❌ Fetching history error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
