// utils/clarifyQuestion.js
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const clarifyQuestion = async (rawText) => {
  const prompt = `
You're an AI trained to clarify unclear or broken voice-to-text questions during live interviews.

Original Input: "${rawText}"

Fix grammar and misheard words to make it a clear technical interview question.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 100,
  });

  return response.choices[0].message.content.trim();
};

module.exports = clarifyQuestion;
