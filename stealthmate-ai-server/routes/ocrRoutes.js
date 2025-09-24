// stealthmate-ai-server/routes/ocrRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const authMiddleware = require("../middleware/authMiddleware");

// Multer Setup (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📸 Route: POST /api/ocr/image
router.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Convert buffer to Base64 with MIME type (permanent fix)
    const base64Image = `data:image/png;base64,${req.file.buffer.toString("base64")}`;

    // Run OCR
    const result = await Tesseract.recognize(base64Image, "eng", {
      logger: (m) => console.log(m), // logs progress
    });

    res.json({ text: result.data.text.trim() });
  } catch (err) {
    console.error("❌ OCR error:", err);
    res.status(500).json({ message: "OCR failed", error: err.message });
  }
});

module.exports = router;
