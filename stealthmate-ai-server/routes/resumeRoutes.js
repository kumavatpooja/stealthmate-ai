// stealthmate-ai-server/routes/resumeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");
const parseResume = require("../utils/parseResume");

// ✅ Multer setup → keep files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ GET Latest Resume Info for Logged-in User
router.get("/confirm", authMiddleware, async (req, res) => {
  try {
    // 🔑 Fix: use "uploadedAt" instead of "createdAt"
    const latestResume = await Resume.findOne({ user: req.userId }).sort({
      uploadedAt: -1,
    });

    if (!latestResume) {
      return res.status(404).json({ message: "No resume info found" });
    }

    res.json(latestResume);
  } catch (err) {
    console.error("❌ Error fetching resume info:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// ✅ Upload Resume + Extra Info (FormData with file)
router.post(
  "/upload",
  authMiddleware,
  upload.single("resumeFile"), // 🔑 matches frontend FormData.append("resumeFile", file)
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No resume file uploaded" });
      }

      console.log("📂 File received:", req.file.originalname);

      const fileBuffer = req.file.buffer;
      const fileType = req.file.originalname.split(".").pop().toLowerCase();

      let resumeText;
      try {
        // ✅ Parse file content
        resumeText = await parseResume(fileBuffer, fileType);
        console.log("✅ Parsed text length:", resumeText?.length);
      } catch (parseErr) {
        console.warn("⚠️ Parse failed:", parseErr.message);
        resumeText = `⚠️ Could not parse file type: ${fileType}`;
      }

      const { preferredLanguage, tone, jobRole, extraInfo } = req.body;

      // ✅ Save resume (with fallback for jobRole)
      const newResume = new Resume({
        user: req.userId,
        resumeText,
        preferredLanguage,
        tone,
        jobRole: jobRole || "Not Specified", // 🔑 fallback if empty
        extraInfo,
      });

      await newResume.save();

      res.status(201).json({
        message: "Resume uploaded successfully",
        resumeId: newResume._id,
      });
    } catch (err) {
      console.error("❌ Error uploading resume:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }
);

module.exports = router;
