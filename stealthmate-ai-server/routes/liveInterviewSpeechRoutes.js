// stealthmate-ai-server/routes/liveInterviewSpeechRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const authMiddleware = require("../middleware/authMiddleware");
const clarifyQuestion = require("../utils/clarifyQuestion");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 🎤 POST /api/live/speech
router.post("/speech", authMiddleware, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio uploaded" });
    }

    // 1️⃣ Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(path.resolve(req.file.path)),
      model: "whisper-1",
      response_format: "text",
    });

    const originalText = transcription;
    const clarifiedQuestion = await clarifyQuestion(originalText);

    // cleanup
    fs.unlink(req.file.path, () => {});

    res.json({
      original: originalText,
      clarified: clarifiedQuestion,
    });
  } catch (err) {
    console.error("❌ Speech Interview Error:", err);
    res.status(500).json({ message: "Speech interview failed", error: err.message });
  }
});

module.exports = router;
