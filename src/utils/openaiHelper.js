export const generateAnswer = async ({ question, resume, extraInfo, apiKey }) => {
    const prompt = `
  You are an AI interview assistant. Use the resume and extra info to answer professionally.
  
  Resume:\n${resume}\n
  Extra Info:\n${extraInfo}\n
  Question:\n${question}\n
  
  Provide a smart, natural, and concise answer.
    `;
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });
  
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response received.";
  };
  