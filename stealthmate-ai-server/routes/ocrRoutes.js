// stealthmate-ai-server/routes/ocrRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const Jimp = require("jimp");
const authMiddleware = require("../middleware/authMiddleware");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * ✅ OCR image endpoint
 */
router.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        console.error("❌ No file received in OCR route");
        return res.status(400).json({ message: "No image uploaded" });
      }

      console.log("📥 OCR received:", {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      });

      let img;
      try {
        img = await Jimp.read(req.file.buffer);
      } catch (e) {
        console.error("❌ Jimp could not read buffer:", e);
        return res.status(400).json({ message: "Invalid image format" });
      }

      // Preprocess for better accuracy
      img
        .greyscale()
        .contrast(0.3)
        .normalize()
        .resize(1200, Jimp.AUTO)
        .quality(85);

      const processedBuffer = await img.getBufferAsync(Jimp.MIME_JPEG);

      // OCR in English + Hindi
      const { data } = await Tesseract.recognize(processedBuffer, "eng+hin", {
        logger: (m) => console.log("🟣 TESSERACT:", m),
      });

      const text = data?.text?.trim() || "";
      console.log("✅ OCR extracted text:", text);

      if (!text) {
        return res.status(200).json({ text: "" }); // send safe response
      }

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

/**
 * ✅ OCR → AI solver endpoint
 */
router.post("/solve", authMiddleware, async (req, res) => {
  try {
    const { extractedText } = req.body;

    if (!extractedText) {
      return res.status(400).json({ message: "No extracted text provided" });
    }

    // Force AI to treat as coding question
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a coding assistant. Always explain step by step. If the question is about code, provide runnable code + explanation. Keep answers clear.",
        },
        {
          role: "user",
          content: `Solve this problem from an image:\n\n${extractedText}`,
        },
      ],
    });

    const answer = response.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error("❌ OCR Solve Error:", error.message);
    res.status(500).json({ message: "AI failed to respond", error: error.message });
  }
});

module.exports = router;
