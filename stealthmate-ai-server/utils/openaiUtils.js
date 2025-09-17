// stealthmate-ai-server/utils/openaiUtils.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an AI interview answer with resume + extra info context
 * @param {string} question - The interview question
 * @param {object} resume - Resume document from MongoDB (includes text, preferences, extra info)
 */
const generateAnswer = async (question, resume) => {
  try {
    // Safely extract resume data
    const resumeText = resume?.parsedText || "";
    const language = resume?.preferredLanguage || "English";
    const tone = resume?.tone || "Professional";
    const role = resume?.jobRole || "Software Developer";
    const extraInfo = resume?.additionalInfo || "";

    // Build a rich system prompt
    const systemPrompt = `
You are StealthMate AI, a professional interview assistant. 
Always answer in a human-like, confident tone.

The candidate's resume:
${resumeText}

The candidate's job role:
${role}

Extra information provided:
${extraInfo}

Preferred Language: ${language}
Preferred Tone: ${tone}

👉 Very important: Your answers must be tailored to this candidate's resume, skills, and goals.
Do NOT give generic definitions. Frame answers as if this candidate is speaking about their own experience.
Include short coding examples when relevant.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-3.5-turbo if you prefer
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.6,
      max_tokens: 600,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ OpenAI error:", error.message);
    return "⚠️ Failed to generate a resume-based answer. Please try again.";
  }
};

module.exports = { generateAnswer };
