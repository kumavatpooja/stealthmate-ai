// stealthmate-ai-server/routes/ocrRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const OpenAI = require("openai");
const Resume = require("../models/Resume"); // ✅ fetch active resume

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * OCR Image → Extract text with Vision
 */
router.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    console.log("📥 OCR received:", {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });

    const base64Image = req.file.buffer.toString("base64");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an OCR + interview assistant. Extract text from images (even handwritten). Clean it up so it looks like a proper interview question.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract and clean the text from this image clearly.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const extractedText = response.choices[0].message.content?.trim() || "";
    if (!extractedText) {
      return res.status(400).json({ message: "No text detected in image" });
    }

    res.json({ text: extractedText });
  } catch (err) {
    console.error("❌ OCR Vision error:", err);
    res.status(500).json({
      message: "OCR Vision failed",
      error: err.message || err.toString(),
    });
  }
});

/**
 * OCR → AI Solver (with Resume Context)
 */
router.post("/solve", authMiddleware, async (req, res) => {
  try {
    const { extractedText } = req.body;
    if (!extractedText) {
      return res.status(400).json({ message: "No extracted text provided" });
    }

    // ✅ Fetch latest active resume for user
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });
    const resumeText = resume?.resumeText || "";
    const jobRole = resume?.jobRole || "";
    const tone = resume?.tone || "neutral";
    const preferredLanguage = resume?.preferredLanguage || "English";
    const extraInfo = resume?.extraInfo || "";

    // ✅ Inject resume + extra info into system prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are StealthMate AI, an interview assistant. 
Always answer naturally and conversationally (not robotic). 
Use ${preferredLanguage} language. 
Tone: ${tone}.
Job Role: ${jobRole}.
Resume Context: ${resumeText}.
Extra Info: ${extraInfo}.
Make sure your answer reflects the candidate’s real resume, projects, and skills.
If the question is in Hindi, reply in **natural Hinglish** (casual mix of Hindi + English). 
If code is required, always provide runnable code with explanation.`,
        },
        {
          role: "user",
          content: extractedText,
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
