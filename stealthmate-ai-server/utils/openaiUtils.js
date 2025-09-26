// stealthmate-ai-server/utils/openaiUtils.js
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an AI interview answer with resume + extra info context
 * @param {string} question
 * @param {object} resume - latest user resume doc
 */
const generateAnswer = async (question, resume = {}) => {
  try {
    // Extract resume fields safely
    const resumeText = resume.resumeText || resume.parsedText || "";
    const language = resume.preferredLanguage || "English";
    const tone = resume.tone || "Professional";
    const role = resume.jobRole || "Software Developer";
    const extraInfo = resume.extraInfo || resume.additionalInfo || "";

    console.log("📝 [generateAnswer] Debug context:", {
      question,
      role,
      language,
      tone,
      extraInfo: extraInfo ? extraInfo.slice(0, 80) + "..." : "none",
      resumeLength: resumeText.length,
    });

    // --- System instructions ---
    const systemPrompt = `
You are StealthMate AI, an assistant answering interview questions AS the candidate ("I").
Rules:
- Tailor to candidate's resume & extraInfo when applicable.
- Speak naturally in first-person ("I built...", "I experienced...").
- For technical/coding questions:
  1. Start with a short explanation.
  2. Provide complete code in a block.
  3. Give a short step-by-step explanation.
- If resume lacks info, say: "Based on my resume, I have experience with X. If you meant something else, please clarify."
- Keep tone ${tone}, in ${language}.
`;

    const userMessage = `
Interview question:
${question}

Candidate resume extract:
${resumeText}

Candidate role: ${role}
Extra info: ${extraInfo}
`;

    // --- OpenAI call ---
    const resp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 900,
    });

    const content = resp.choices?.[0]?.message?.content;

    if (!content) {
      console.error("⚠️ OpenAI returned no content. Raw response:", resp);
      return "⚠️ AI did not return an answer. Please try again.";
    }

    return content.trim();
  } catch (err) {
    console.error("❌ [generateAnswer] OpenAI error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    return "⚠️ Failed to generate a resume-based answer. Please try again.";
  }
};

module.exports = { generateAnswer };
