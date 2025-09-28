// routes/resumeRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");

/**
 * ✅ Upload resume
 * This will deactivate old ones and set the new one as active
 */
router.post("/upload", authMiddleware, async (req, res) => {
  try {
    const { resumeText, preferredLanguage, tone, jobRole, extraInfo } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    // deactivate old resumes
    await Resume.updateMany({ user: req.user.id }, { active: false });

    // save new active resume
    const resume = await Resume.create({
      user: req.user.id,
      resumeText,
      preferredLanguage,
      tone,
      jobRole,
      extraInfo,
      active: true,
    });

    res.json(resume);
  } catch (err) {
    console.error("❌ Resume upload error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get active resume for logged-in user
 */
router.get("/active", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id, active: true })
      .sort({ uploadedAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: "No active resume found" });
    }

    res.json(resume);
  } catch (err) {
    console.error("❌ Resume fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get all resumes of the user
 */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ uploadedAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error("❌ Fetch resumes error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Set a specific resume as active
 */
router.put("/set-active/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // deactivate all
    await Resume.updateMany({ user: req.user.id }, { active: false });

    // activate chosen one
    const updated = await Resume.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { active: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Set active resume error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
