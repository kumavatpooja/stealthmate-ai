// 📍 path: backend/routes/ocrRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const imageBuffer = req.file.buffer;

    const result = await Tesseract.recognize(imageBuffer, "eng");
    const extractedText = result.data.text;

    if (!extractedText || extractedText.trim() === "") {
      return res.status(400).json({ message: "Text could not be extracted from image." });
    }

    res.json({ text: extractedText.trim() });
  } catch (err) {
    console.error("❌ OCR error:", err);
    res.status(500).json({ message: "OCR failed", error: err.message });
  }
});

module.exports = router;
