const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Upload Resume + Extra Info
router.post('/upload', authMiddleware, async (req, res) => {
  try {
    const {
      resumeText,
      preferredLanguage,
      tone,
      jobRole,
      familyBackground,
      goals,
      hobbies,
      extraInfo,
    } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume is required" });
    }

    const newResume = new Resume({
      user: req.userId,
      resumeText,
      preferredLanguage,
      tone,
      jobRole,
      familyBackground,
      goals,
      hobbies,
      extraInfo,
    });

    await newResume.save();
    res.status(201).json({ message: 'Resume and extra info uploaded successfully' });
  } catch (err) {
    console.error('❌ Error uploading resume:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Confirm latest uploaded resume
router.get('/confirm', authMiddleware, async (req, res) => {
  try {
    const latestResume = await Resume.findOne({ user: req.userId }).sort({ createdAt: -1 });

    if (!latestResume) {
      return res.status(404).json({ message: 'No resume info found' });
    }

    res.json(latestResume);
  } catch (err) {
    console.error('❌ Error fetching resume info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
