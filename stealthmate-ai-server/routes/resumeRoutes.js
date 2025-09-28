const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// multer setup (store in memory)
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

    // ✅ Deactivate old resumes
    await Resume.updateMany({ user: req.user.id }, { active: false });

    // ✅ Save new resume (always active, with timestamp)
    const resume = await Resume.create({
      user: req.user.id,
      resumeText,
      preferredLanguage,
      tone,
      jobRole,
      extraInfo,
      active: true,
      uploadedAt: Date.now(),
    });

    res.json(resume);
  } catch (err) {
    console.error("❌ Resume upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ✅ Get active resume for logged-in user
 */
router.get("/active", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id, active: true }).sort({
      uploadedAt: -1,
    });

    // 🔎 Debug log (check in Render logs)
    console.log("🔎 Resume fetch for user:", req.user.id, "=>", resume ? "FOUND" : "NOT FOUND");

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
