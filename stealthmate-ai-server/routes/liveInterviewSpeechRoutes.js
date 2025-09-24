//stealthmate-ai-server\routes\liveInterviewSpeechRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const authMiddleware = require('../middleware/authMiddleware');
const clarifyQuestion = require('../utils/clarifyQuestion'); // 🧠 Smart clarification

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🗂️ Multer config for audio upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 🎙️ POST /api/live/speech - Transcribe audio + clarify
router.post('/speech', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (!req.file || !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Unsupported file type. Use MP3, WAV, OGG, or WEBM.' });
    }

    // 🎧 1. Transcribe speech to text
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(path.resolve(req.file.path)),
      model: 'whisper-1',
      response_format: 'text',
    });

    const originalText = transcription;

    // 🧠 2. Clarify the transcribed question
    const clarifiedQuestion = await clarifyQuestion(originalText);

    // 🧹 3. Clean up
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('❌ Error deleting uploaded file:', err);
    });

    // 📦 4. Return both
    res.json({
      original: originalText,
      clarified: clarifiedQuestion,
    });
  } catch (err) {
    console.error('❌ Speech Interview Error:', err);
    res.status(500).json({ message: 'Speech interview failed', error: err.message });
  }
});

module.exports = router;

