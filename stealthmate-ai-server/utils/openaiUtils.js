// stealthmate-ai-server/utils/openaiUtils.js
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an AI interview answer with resume + extra info context
 * @param {string} question
 * @param {object} resume - Mongoose resume doc
 */
const generateAnswer = async (question, resume = {}) => {
  try {
    // Extract fields robustly
    const resumeText = resume.resumeText || resume.parsedText || "";
    const language = resume.preferredLanguage || "English";
    const tone = resume.tone || "Professional";
    const role = resume.jobRole || "Software Developer";
    const extraInfo = resume.extraInfo || resume.additionalInfo || "";

    // System prompt (explicit, restrictive, first-person)
    const systemPrompt = `
You are StealthMate AI, an assistant that answers interview questions by speaking AS the candidate (first-person "I").
Important rules:
- Always tailor the answer to the candidate's resume & extraInfo when applicable.
- Use first-person statements like "I built..." or "In my experience...".
- For technical/coding questions:
  1) Start with a brief plain-language summary.
  2) Provide a short, complete code example (if relevant).
  3) Provide a short explanation of the code (line-by-line or paragraph).
- If the resume does NOT contain enough information to assert a fact, be explicit: "Based on my resume, I have experience with X. If you meant something else, please clarify."
- Keep answers human-like, natural, and concise. Add small natural fillers only when appropriate (e.g. "I usually...").
- Prefer correctness over verbosity.
`;

    const userMessage = `
Interview question:
${question}

Candidate resume (extract):
${resumeText}

Candidate role: ${role}
Extra info: ${extraInfo}
Preferred language: ${language}
Preferred tone: ${tone}

Answer should be tailored to this candidate and follow the rules above.
`;

    // Use gpt-3.5-turbo for predictable latency; change if you have gpt-4 access
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
    return content ? content.trim() : "⚠️ AI returned an empty answer.";
  } catch (err) {
    console.error("OpenAI generateAnswer error:", err?.message || err);
    return "⚠️ Failed to generate a resume-based answer. Please try again.";
  }
};

module.exports = { generateAnswer };
