import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function MockInterview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // ✅ Fetch questions on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    const fetchQuestions = async () => {
      try {
        const resume = localStorage.getItem("resume_text") || "";
        const extra = localStorage.getItem("extra_info") || "";

        const res = await fetch("http://localhost:5000/api/interview/mock-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume, extra }),
        });

        const data = await res.json();
        if (res.ok) {
          setQuestions(data.questions);
        } else {
          alert("❌ Failed to load questions.");
        }
      } catch (err) {
        console.error(err);
        alert("Error loading questions.");
      }
    };

    fetchQuestions();
  }, [navigate]);

  // ✅ Submit user's answer to backend for GPT evaluation
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return alert("✍️ Please write or speak your answer.");

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: questions[current],
          answer: userAnswer,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        alert(data.message); // Daily usage limit reached
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        alert("⚠️ Failed to evaluate your answer.");
        setIsLoading(false);
        return;
      }

      setModelAnswer(data.modelAnswer || "⚠️ No model answer received.");
    } catch (err) {
      console.error(err);
      alert("⚠️ Network error. Try again.");
    }

    setIsLoading(false);
  };

  // ✅ Move to next question
  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrent(current + 1);
      setUserAnswer("");
      setModelAnswer("");
      resetTranscript();
    }
  };

  // ✅ Store transcript if speech stops
  useEffect(() => {
    if (!listening && transcript) {
      setUserAnswer(transcript);
    }
  }, [transcript, listening]);

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  if (questions.length === 0) {
    return <div className="p-6 text-center">Loading questions...</div>;
  }

  if (isFinished) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-green-700">🎉 Mock Interview Completed!</h2>
        <button
          className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl"
          onClick={() => navigate("/dashboard")}
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        ❓ Question {current + 1} of {questions.length}
      </h2>
      <p className="mb-4 max-w-2xl text-gray-700 text-center">
        {questions[current]}
      </p>

      <textarea
        rows="4"
        className="w-full max-w-2xl mb-3 p-3 border border-gray-300 rounded"
        placeholder="Type your answer or speak..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      ></textarea>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: false });
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl"
        >
          🎙️ {listening ? "Listening..." : "Start Speaking"}
        </button>

        <button
          onClick={SpeechRecognition.stopListening}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-xl"
        >
          ⏹️ Stop
        </button>
      </div>

      <button
        onClick={handleSubmitAnswer}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow mb-4"
      >
        {isLoading ? "Generating..." : "🧠 Submit Answer"}
      </button>

      {modelAnswer && (
        <div className="bg-white shadow p-4 rounded-xl max-w-2xl text-left">
          <h4 className="font-semibold mb-2">💡 Model Answer / Feedback:</h4>
          <p className="text-gray-800 whitespace-pre-wrap">{modelAnswer}</p>
        </div>
      )}

      {modelAnswer && (
        <button
          onClick={handleNext}
          className="mt-4 px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
        >
          ➡ Next Question
        </button>
      )}
    </div>
  );
}

export default MockInterview;
