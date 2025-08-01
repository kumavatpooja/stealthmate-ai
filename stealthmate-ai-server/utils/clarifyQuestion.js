const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const clarifyQuestion = async (rawText) => {
  const prompt = `
You're an interview assistant. The question below may be unclear, broken, or misheard from speech.

Original (possibly unclear): "${rawText}"

Rewrite this as a clear, complete technical interview question:
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


