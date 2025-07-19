const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 📌 1. MOCK INTERVIEW GENERATOR
const generateMockInterview = async (resumeText) => {
  const prompt = `
Based on the following resume content, generate a mock interview with 8 questions and suggested answers. Include a mix of HR and technical questions.

Format:
Q1: ...
A1: ...

Resume:
${resumeText}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
};

// 📌 2. MOCK FEEDBACK GENERATOR
const generateMockFeedback = async (question, userAnswer) => {
  const prompt = `
You're an expert interview coach. Provide helpful feedback for the user's answer.

Question: ${question}
User's Answer: ${userAnswer}

Give 2-3 points of feedback.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content.trim();
};

// ✅ EXPORT BOTH FUNCTIONS
module.exports = {
  generateMockInterview,
  generateMockFeedback,
};
