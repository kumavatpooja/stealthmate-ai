const InterviewLog = require('../models/InterviewLog');
const { generateAnswerFromAI } = require('../utils/openaiUtils');

const liveInterviewHandler = async (req, res) => {
  try {
    const { question, capturedImage } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const answer = await generateAnswerFromAI(question);

    const log = new InterviewLog({
      user: req.userId,
      question,
      answer,
      capturedImage: capturedImage || null,
    });

    await log.save();
    res.status(200).json({ answer });
  } catch (err) {
    console.error('❌ Live interview error:', err);
    res.status(500).json({ message: 'Failed to generate answer', error: err.message });
  }
};

module.exports = liveInterviewHandler;
