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
    const resumeText = resume?.resumeText || "";
    const language = resume?.preferredLanguage || "English";
    const tone = resume?.tone || "Professional";
    const role = resume?.jobRole || "Software Developer";
    const extraInfo = resume?.extraInfo || "";

    // 🎯 Human-like system prompt
    const systemPrompt = `
You are StealthMate AI, acting as the candidate in a live interview. 
Always answer as if *you are the candidate*, speaking naturally and confidently.

⚡ Style Rules:
- Use first-person language ("I", "my experience", "I worked on…").
- Be confident but concise, no robotic tone.
- For technical questions:
   1. Start with a simple explanation in plain language.
   2. Then show a short, clear code example (if relevant).
   3. End with a summary or why it matters.
- Tailor answers strictly to THIS candidate’s background, role, and extra info.

📄 Candidate Resume:
${resumeText}

🎯 Target Role: ${role}
💡 Extra Info: ${extraInfo}
🗣 Preferred Language: ${language}
✨ Preferred Tone: ${tone}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 🔄 swap to gpt-3.5-turbo if you want faster
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.7, // more natural variation
      max_tokens: 700,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ OpenAI error:", error.message);
    return "⚠️ Failed to generate a resume-based answer. Please try again.";
  }
};

module.exports = { generateAnswer };
