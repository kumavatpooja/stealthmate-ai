// utils/openaiUtils.js
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateAnswer = async (question, resume) => {
  const resumeText = `
Resume Info:
Job Role: ${resume.jobRole}
Preferred Language: ${resume.preferredLanguage}
Tone: ${resume.tone}
Goals: ${resume.goals}
Extra Info: ${resume.extraInfo}
Hobbies: ${resume.hobbies}
Family Background: ${resume.familyBackground}
`;

  const prompt = `
You're an AI interview assistant. Use the resume info to answer professionally.

Question: ${question}

${resumeText}

Your answer:
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
  });

  return response.choices[0].message.content.trim();
};

module.exports = { generateAnswer };




 
