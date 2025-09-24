const express = require("express");
const router = express.Router();
const multer = require("multer");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");

// 🗂️ Multer config (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * 📌 Upload or update resume
 * Route: POST /api/resume/upload
 */
router.post("/upload", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resumeText = req.body.resumeText || req.file.buffer.toString("utf-8");
    const { jobRole, preferredLanguage, tone, extraInfo } = req.body;

    const newResume = new Resume({
      user: req.userId,
      resumeText,
      jobRole,
      preferredLanguage,
      tone,
      extraInfo,
      uploadedAt: new Date(),
    });

    await newResume.save();

    res.json({ message: "✅ Resume uploaded successfully", resume: newResume });
  } catch (err) {
    console.error("❌ Resume upload error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * 📌 Confirm latest resume (legacy route)
 * Route: GET /api/resume/confirm
 */
router.get("/confirm", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.userId }).sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(404).json({ message: "No resume uploaded yet" });
    }
    res.json(resume);
  } catch (err) {
    console.error("❌ Resume confirm error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * 📌 Get active resume (recommended route for dashboard)
 * Route: GET /api/resume/active
 */
router.get("/active", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.userId }).sort({ uploadedAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: "No active resume found" });
    }

    res.json(resume);
  } catch (err) {
    console.error("❌ Resume fetch error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * 📌 Delete all resumes for user (optional cleanup)
 * Route: DELETE /api/resume/clear
 */
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    await Resume.deleteMany({ user: req.userId });
    res.json({ message: "🗑️ All resumes cleared successfully" });
  } catch (err) {
    console.error("❌ Resume delete error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
