const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const Jimp = require("jimp");
const authMiddleware = require("../middleware/authMiddleware");

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      // 1) Load buffer into Jimp safely
      let img;
      try {
        img = await Jimp.read(req.file.buffer);
      } catch (e) {
        console.error("❌ Jimp could not read buffer:", e);
        return res.status(400).json({ message: "Invalid image format" });
      }

      img
        .greyscale()
        .contrast(0.3)
        .normalize()
        .resize(1200, Jimp.AUTO)
        .quality(85);

      const processedBuffer = await img.getBufferAsync(Jimp.MIME_JPEG);

      // 2) Run Tesseract directly on buffer
      const { data } = await Tesseract.recognize(processedBuffer, "eng", {
        logger: (m) => console.log("🟣 TESSERACT:", m),
      });

      const text = data?.text?.trim() || "";
      res.json({ text });
    } catch (err) {
      console.error("❌ OCR error:", err);
      res.status(500).json({
        message: "OCR failed",
        error: err.message || err.toString(),
      });
    }
  }
);

module.exports = router;
