// stealthmate-ai-server/routes/ocrRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const Jimp = require("jimp");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Memory storage (keeps image in RAM)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // ✅ Preprocess image
    const img = await Jimp.read(req.file.buffer);
    img
      .greyscale()
      .contrast(0.3)
      .normalize()
      .resize(1600, Jimp.AUTO)
      .quality(85);

    const processedBuffer = await img.getBufferAsync(Jimp.MIME_JPEG);

    // ✅ OCR
    const { data } = await Tesseract.recognize(processedBuffer, "eng", {
      logger: m => console.log("TESSERACT:", m),
    });

    const text = (data && data.text) ? data.text.trim() : "";
    if (!text) {
      return res.status(400).json({ message: "No readable text detected in image." });
    }

    res.json({ text });
  } catch (err) {
    console.error("❌ OCR error:", err);
    res.status(500).json({ message: "OCR failed", error: err.message || "Unknown error" });
  }
});

module.exports = router;
