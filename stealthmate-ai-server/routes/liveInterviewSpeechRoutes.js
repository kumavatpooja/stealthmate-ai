const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const authMiddleware = require('../middleware/authMiddleware');
const clarifyQuestion = require('../utils/clarifyQuestion');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔧 Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// 📂 Multer config
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-audio.webm`);
  },
});
const upload = multer({ storage });

router.post('/speech', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const filePath = path.resolve(req.file.path);
    const allowedTypes = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg'];

    if (!req.file || !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Unsupported file type.' });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'text',
    });

    const originalText = transcription;
    const clarifiedQuestion = await clarifyQuestion(originalText);

    fs.unlink(filePath, (err) => {
      if (err) console.error('❌ Error deleting audio:', err.message);
    });

    res.json({ original: originalText, clarified: clarifiedQuestion });
  } catch (err) {
    console.error('❌ Speech AI error:', err.message);
    res.status(500).json({ message: 'Speech transcription failed', error: err.message });
  }
});

module.exports = router;
