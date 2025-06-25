// src/pages/Interview.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Interview() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const plan = localStorage.getItem("user_plan") || "Free (3 Questions/Day)";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    const today = new Date().toISOString().split("T")[0];
    const storedDate = localStorage.getItem("last_question_date");
    const storedCount = parseInt(localStorage.getItem("question_count")) || 0;

    if (storedDate === today) {
      setQuestionCount(storedCount);
    } else {
      localStorage.setItem("last_question_date", today);
      localStorage.setItem("question_count", "0");
      setQuestionCount(0);
    }

    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in your browser.");
      return;
    }

    const recog = new webkitSpeechRecognition();
    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = false;

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
    };

    recog.onerror = (err) => {
      console.error("Mic Error:", err);
      alert("Microphone error: " + err.error);
      setIsListening(false);
    };

    setRecognition(recog);
  }, [navigate]);

  const handleListen = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setAnswer("");
      setIsListening(true);
      recognition.start();
    }
  };

  const handleGenerateAnswer = async () => {
    const limits = {
      "Free (3 Questions/Day)": 3,
      "Basic ₹149": 100,
      "Pro ₹299": 200,
    };

    const maxAllowed = limits[plan] || 3;

    if (questionCount >= maxAllowed) {
      alert(`❌ Daily limit reached for your plan (${maxAllowed} questions/day).`);
      return;
    }

    const resumeText = localStorage.getItem("resume_text") || "";
    const extraInfo = localStorage.getItem("extra_info") || "";
    const apiKey = localStorage.getItem("openai_api_key");

    if (!apiKey) {
      alert("OpenAI API key not set. Please go to 'Set API Key' page.");
      return;
    }

    const prompt = `You are helping a candidate in a live interview. Based on their resume and additional info, answer this question:

Resume: ${resumeText}
Extra Info: ${extraInfo}
Question: ${question}

Provide a clear, confident, short answer.`;

    setAnswer("Generating answer...");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const response = data.choices?.[0]?.message?.content || "No answer received.";
      setAnswer(response);

      const newCount = questionCount + 1;
      localStorage.setItem("question_count", newCount.toString());
      setQuestionCount(newCount);

    } catch (err) {
      console.error(err);
      setAnswer("Failed to get response. Check your API key or network.");
    }
  };

  const questionsLeft = Math.max(({
    "Free (3 Questions/Day)": 3,
    "Basic ₹149": 100,
    "Pro ₹299": 200
  }[plan] || 3) - questionCount, 0);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-start p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🎧 Live Interview Assistant</h2>
      <p className="text-sm text-gray-600 mb-4">Questions Left Today: {questionsLeft}</p>

      <button
        onClick={handleListen}
        className={`mb-4 px-6 py-2 rounded-xl text-white font-semibold shadow ${isListening ? "bg-red-500" : "bg-yellow-500 hover:bg-yellow-600"}`}
      >
        {isListening ? "🎙️ Stop Listening" : "🎤 Start Listening"}
      </button>

      <textarea
        rows="3"
        className="w-full max-w-2xl mb-4 p-3 border border-gray-300 rounded"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Or type your interview question here..."
      ></textarea>

      <button
        onClick={handleGenerateAnswer}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow"
      >
        🧠 Generate Smart Answer
      </button>

      {answer && (
        <div className="bg-white mt-6 p-4 rounded-xl shadow w-full max-w-2xl">
          <h4 className="text-lg font-semibold mb-2">Answer:</h4>
          <p className="text-gray-800 whitespace-pre-line">{answer}</p>
          <button
            onClick={() => navigator.clipboard.writeText(answer)}
            className="mt-2 text-sm text-blue-600 underline"
          >
            📋 Copy Answer
          </button>
        </div>
      )}
    </div>
  );
}

export default Interview;
