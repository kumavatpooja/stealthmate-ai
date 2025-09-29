// routes/ocrRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { generateAnswer } = require("../utils/openaiUtils");

// ✅ OCR Solve – Treat extracted text as a coding/theory interview question
router.post("/solve", authMiddleware, async (req, res) => {
  try {
    const { extractedText } = req.body;

    if (!extractedText) {
      return res.status(400).json({ message: "No extracted text provided" });
    }

    const prompt = `
The following text was extracted from an image during an interview:
"${extractedText}"

⚠️ Important Instructions for AI:
- Treat this ONLY as an interview question (not resume).
- If it is about coding, write **clear, correct code** in the appropriate language (Python, Java, JS, etc.) + explain step by step.
- If it is a theory question, answer concisely but professionally.
- Do NOT introduce the candidate or say "based on resume". Just give the answer to the question.
`;

    const answer = await generateAnswer(prompt);

    res.json({ answer });
  } catch (err) {
    console.error("❌ OCR Solve Error:", err.message);
    res.status(500).json({ message: "AI failed to solve OCR question", error: err.message });
  }
});

module.exports = router;
