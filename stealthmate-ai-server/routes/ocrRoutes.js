// stealthmate-ai-server/routes/ocrRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const Jimp = require("jimp");
const authMiddleware = require("../middleware/authMiddleware");

// multer memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ message: "No image uploaded" });

    // 1) Load buffer into Jimp and do basic preprocessing
    const img = await Jimp.read(req.file.buffer);
    // convert to greyscale, increase contrast, resize to reasonable width for Tesseract
    img
      .greyscale()
      .contrast(0.3)
      .normalize()
      .resize(1600, Jimp.AUTO) // upscale small images a bit
      .quality(85);

    const processedBuffer = await img.getBufferAsync(Jimp.MIME_JPEG);

    // 2) Run Tesseract on processed buffer
    const { data } = await Tesseract.recognize(processedBuffer, "eng", {
      logger: m => console.log("TESSERACT:", m) // optional logging
    });

    const text = (data && data.text) ? data.text : "";
    res.json({ text });
  } catch (err) {
    console.error("OCR error:", err);
    res.status(500).json({ message: "OCR failed", error: err.message || err });
  }
});

module.exports = router;
