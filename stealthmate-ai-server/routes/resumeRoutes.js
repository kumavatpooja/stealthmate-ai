// routes/resumeRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// multer setup (store in memory, not filesystem)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * ✅ Upload resume (PDF, DOCX, TXT)
 */
router.post("/upload", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    const { preferredLanguage, tone, jobRole, extraInfo } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let resumeText = "";

    // 🔹 PDF
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }
    // 🔹 DOCX
    else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value;
    }
    // 🔹 TXT
    else if (req.file.mimetype === "text/plain") {
      resumeText = req.file.buffer.toString("utf-8");
    }
    // ❌ Unsupported
    else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ message: "Resume text could not be extracted" });
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
    console.error("❌ Resume upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
