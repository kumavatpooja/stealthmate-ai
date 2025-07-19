const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const OpenAI = require('openai'); // ✅ correct for v5+

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 🔐 from your .env
});

// 🎯 Route: POST /api/ocr/solve
router.post('/solve', authMiddleware, async (req, res) => {
  try {
    const { extractedText } = req.body;

    if (!extractedText) {
      return res.status(400).json({ message: 'No extracted text provided' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful coding assistant.' },
        { role: 'user', content: `Please solve this coding task:\n\n${extractedText}` },
      ],
    });

    const answer = response.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error('❌ AI Solve Error:', error.message);
    res.status(500).json({ message: 'AI failed to respond', error: error.message });
  }
});

module.exports = router;
