const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an AI interview answer with resume + extra info context
 */
const generateAnswer = async (question, resume = {}) => {
  try {
    // Extract resume fields
    const resumeText = resume.resumeText || resume.parsedText || "";
    const language = resume.preferredLanguage || "English";
    const tone = resume.tone || "Professional";
    const role = resume.jobRole || "Software Developer";
    const extraInfo = resume.extraInfo || resume.additionalInfo || "";

    console.log("📝 Generating answer with context:", {
      question,
      role,
      language,
      tone,
      extraInfo: extraInfo?.slice(0, 100) + "...",
      resumeLength: resumeText.length
    });

    const systemPrompt = `
You are StealthMate AI, an assistant that answers interview questions by speaking AS the candidate (first-person "I").
Rules:
- Tailor the answer to the candidate's resume & extraInfo when applicable.
- Use first-person statements ("I built...", "In my experience...").
- For coding: give summary + code + explanation.
- If resume lacks info, say "Based on my resume, I have experience with X..." instead of making things up.
`;

    const userMessage = `
Interview question:
${question}

Candidate resume extract:
${resumeText}

Candidate role: ${role}
Extra info: ${extraInfo}
Preferred language: ${language}
Tone: ${tone}
`;

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
    return content ? content.trim() : "⚠️ AI returned empty answer.";
  } catch (err) {
    console.error("❌ OpenAI generateAnswer error:", err.response?.data || err.message || err);
    return "⚠️ Failed to generate a resume-based answer. Please try again.";
  }
};

module.exports = { generateAnswer };
