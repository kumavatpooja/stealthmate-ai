const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const OpenAI = require("openai");

// 🔐 Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎯 Route: POST /api/ocr/solve
router.post("/solve", authMiddleware, async (req, res) => {
  try {
    const { extractedText } = req.body;

    if (!extractedText) {
      return res.status(400).json({ message: "No extracted text provided" });
    }

    // ✅ Send request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI interview assistant. ONLY answer the extracted question from the image. " +
            "If the question is about Python, answer in Python. If it is about another technology, answer that directly. " +
            "Always give step-by-step explanations, and include any code examples in fenced code blocks (```language ... ```).",
        },
        {
          role: "user",
          content: `Question extracted from image:\n\n${extractedText}`,
        },
      ],
      temperature: 0.7,
    });

    const answer = response.choices?.[0]?.message?.content || "No response from AI";
    res.json({ answer });
  } catch (error) {
    console.error("❌ AI Solve Error:", error.response?.data || error.message);

    res.status(500).json({
      message: "AI failed to respond",
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

module.exports = router;
