const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const authMiddleware = require('../middleware/authMiddleware');

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route: POST /api/ocr/image
router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imageBuffer = req.file.buffer;

    const result = await Tesseract.recognize(imageBuffer, 'eng');
    res.json({ text: result.data.text });
  } catch (err) {
    console.error('❌ OCR error:', err);
    res.status(500).json({ message: 'OCR failed', error: err.message });
  }
});

module.exports = router;


