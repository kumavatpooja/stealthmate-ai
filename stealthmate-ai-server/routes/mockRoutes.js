const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const checkMockLimit = require("../middleware/mockLimitMiddleware");
const generateMockInterview = require("../utils/mockInterviewUtils");
const Resume = require("../models/Resume");
const authMiddleware = require('../middleware/authMiddleware');
const {generateMockFeedback } = require('../utils/mockInterviewUtils');




router.post("/generate", authenticateUser, checkMockLimit, async (req, res) => {
  try {
    const resumeData = await Resume.findOne({ user: req.user.id });

    if (!resumeData) {
      return res.status(400).json({ message: "Resume not found" });
    }

    const mockQA = await generateMockInterview(resumeData.text);
    res.status(200).json({ mock: mockQA });
  } catch (err) {
    res.status(500).json({ message: "Mock interview generation failed", error: err.message });
  }
});
// 📌 POST /api/mock/feedback → generate feedback on user's answer
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ message: 'Question and your answer are required' });
    }

    // 🎓 Get the latest resume for context
    const resume = await Resume.findOne({ user: req.userId }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(400).json({ message: 'Resume not found. Please upload first.' });
    }

    // 🧠 Generate AI feedback
    const feedback = await generateMockFeedback(question, userAnswer, resume);
    res.json({ feedback });
  } catch (err) {
    console.error('❌ Mock Feedback Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
