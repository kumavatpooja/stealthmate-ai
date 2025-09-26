// routes/resumeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let extractedText = "";

    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text || "";
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value || "";
    } else if (req.file.mimetype === "text/plain") {
      extractedText = req.file.buffer.toString("utf8");
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    if (!extractedText || extractedText.trim().length < 30) {
      return res.status(400).json({ message: "Could not extract text from resume" });
    }

    // Deactivate old
    await Resume.updateMany({ user: req.userId }, { $set: { active: false } });

    // Save new
    const resume = new Resume({
      user: req.userId,
      resumeText: extractedText.trim(),
      preferredLanguage: req.body.preferredLanguage || "English",
      tone: req.body.tone || "Professional",
      jobRole: req.body.jobRole || "",
      extraInfo: req.body.extraInfo || "",
      active: true,
    });

    await resume.save();

    console.log("✅ Resume uploaded:", extractedText.slice(0, 200)); // log preview
    res.json({ message: "✅ Resume uploaded & parsed successfully", resume });
  } catch (err) {
    console.error("❌ Resume upload error:", err);
    res.status(500).json({ message: "Resume upload failed", error: err.message });
  }
});

module.exports = router;
