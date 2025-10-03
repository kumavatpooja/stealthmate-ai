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
    const language = resume.preferredLanguage || "English"; // English / Hindi / Mixed
    const tone = resume.tone || "Neutral"; // Professional / Friendly / Formal / Casual
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
    let languageInstruction = "";

    if (language.toLowerCase().includes("hindi")) {
      languageInstruction = `Use **casual Hindi** (simple, spoken style). Avoid robotic/formal Hindi. 
Example: "Hello mera naam Pooja hai, maine MERN stack pe kaam kiya tha" instead of "Mera naam Pooja hai aur main ek MERN stack developer hoon."`;
    } else if (language.toLowerCase().includes("mixed")) {
      languageInstruction = `Use **Hinglish (mix of Hindi + English)** in a natural way. 
Keep it casual, like how people speak in India. Example: "Maine ek MERN stack project banaya tha jisme React aur Node use kiya."`;
    } else {
      languageInstruction = `Use **simple Indian English** (no heavy words). Keep it clear and natural.`;
    }

    const systemPrompt = `
You are **StealthMate AI**, answering interview questions AS the candidate ("I").
Speak in a **natural, conversational style** — like a real person in India, not a textbook.

Language rules:
${languageInstruction}

Tone: ${tone}.
Always reflect candidate’s **resume, job role, and extra info**.
Always answer in **first-person ("I did", "I worked on")**.

For coding/technical questions:
1. Start with a short explanation in natural tone.  
2. Provide **clean runnable code** in a code block.  
3. Add a simple step-by-step explanation after the code.  

Format:
- Use **short paragraphs** with spacing.  
- Avoid robotic tone. Make it sound like normal human conversation.  
`;

    const userMessage = `
Interview Question:
${question}

Candidate Resume Extract:
${resumeText}

Candidate Role: ${role}
Extra Info: ${extraInfo}
`;

    // --- OpenAI call ---
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7, // slightly more creative for human tone
      max_tokens: 1000,
    });

    let content = resp.choices?.[0]?.message?.content || "";

    if (!content) {
      console.error("⚠️ OpenAI returned no content. Raw response:", resp);
      return "⚠️ AI did not return an answer. Please try again.";
    }

    // ✅ Ensure paragraph formatting
    content = content
      .replace(/\n{2,}/g, "\n\n")
      .replace(/(\.)(\s+)/g, "$1\n\n"); // break after full stops

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
