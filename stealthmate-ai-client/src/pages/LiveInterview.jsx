import React, { useState, useRef, useEffect } from "react";
import { Mic, Camera, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../api/axiosConfig";

const LiveInterview = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // mic states
  const [listeningInterviewer, setListeningInterviewer] = useState(false);
  const interviewerRecRef = useRef(null);

  // highlight state for Read-Aloud
  const [highlighted, setHighlighted] = useState("");

  // camera states (only mobile camera kept)
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  /* ---------------------------
     Interviewer Mic (continuous + interim)
  --------------------------- */
  const getSpeechRecognition = () =>
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const startInterviewerRecognition = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert("SpeechRecognition not supported in this browser.");
      return;
    }
    try {
      const recognition = new SR();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      let finalTranscript = "";

      recognition.onstart = () => setListeningInterviewer(true);

      recognition.onresult = (e) => {
        let interimTranscript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript.trim();
          if (e.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        setQuestion(finalTranscript + interimTranscript);
      };

      recognition.onend = () => {
        setListeningInterviewer(false);
        if (finalTranscript.trim()) {
          askLiveQuestion(finalTranscript.trim());
        }
      };

      recognition.start();
      interviewerRecRef.current = recognition;
    } catch (err) {
      console.error("❌ Mic error:", err);
      setListeningInterviewer(false);
    }
  };

  const stopInterviewerRecognition = () => {
    try {
      const rec = interviewerRecRef.current;
      if (rec && typeof rec.stop === "function") rec.stop();
    } catch {}
    interviewerRecRef.current = null;
    setListeningInterviewer(false);
  };

  /* ---------------------------
     OCR Process (upload → extract → solve)
  --------------------------- */
  const processOCR = async (fileOrBlob) => {
    try {
      setLoading(true);
      setQuestion("📸 Captured image uploaded. Processing...");

      const formData = new FormData();
      formData.append("image", fileOrBlob);

      const ocrRes = await api.post("/ocr/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extractedText = ocrRes?.data?.text?.trim();
      if (!extractedText) {
        setAnswer("⚠️ No text detected in image.");
        return;
      }

      setQuestion(extractedText);

      const solveRes = await api.post("/ocr/solve", { extractedText });
      const aiAnswer = solveRes?.data?.answer;
      setAnswer(aiAnswer || "⚠️ Failed to solve the question.");
    } catch (err) {
      console.error("❌ OCR process error:", err);
      setAnswer("⚠️ Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     Manual Question (type input)
  --------------------------- */
  const askLiveQuestion = async (q) => {
    if (!q.trim()) return;
    try {
      setLoading(true);
      const res = await api.post("/live/ask", { question: q });
      setAnswer(res?.data?.answer || "⚠️ Failed to generate answer.");
    } catch (err) {
      console.error("❌ askLiveQuestion error:", err);
      setAnswer("⚠️ Could not process this question.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     Read-Aloud Practice (highlight words as spoken)
  --------------------------- */
  const startReadAloudPractice = () => {
    const SR = getSpeechRecognition();
    if (!SR) return alert("SpeechRecognition not supported");
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (e) => {
      let spoken = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        spoken += e.results[i][0].transcript + " ";
      }
      setHighlighted(spoken.trim());
    };

    recognition.start();
  };

  /* ---------------------------
     UI
  --------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-white to-purple-200 p-2">
      <div className="w-full max-w-7xl h-[85vh] bg-white rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="p-4 flex flex-col justify-between border-r border-gray-200">
          <h1 className="text-lg font-bold text-pink-600 mb-4">StealthMate AI</h1>

          <div className="flex flex-col gap-8 items-center">
            {/* Mobile Upload */}
            <label className="flex flex-col items-center cursor-pointer">
              <span className="text-2xl">📱</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files[0] && processOCR(e.target.files[0])}
              />
              <p className="text-xs text-gray-500">Mobile Camera</p>
            </label>

            {/* Interviewer Mic */}
            <button
              onClick={() =>
                listeningInterviewer ? stopInterviewerRecognition() : startInterviewerRecognition()
              }
              className={`w-16 h-16 flex items-center justify-center rounded-full ${
                listeningInterviewer ? "bg-red-500" : "bg-purple-600"
              } text-white`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-xs text-gray-600">Interviewer Mic</p>
          </div>

          {/* Question Input */}
          <div className="mt-auto flex flex-col sm:flex-row">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 p-2 border rounded-md sm:rounded-l-md sm:rounded-r-none"
              placeholder="Type your question..."
            />
            <button
              onClick={() => askLiveQuestion(question)}
              className="px-4 bg-pink-500 text-white rounded-md sm:rounded-r-md sm:rounded-l-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-4 flex flex-col h-full col-span-2">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-md mb-3">
            <h2 className="font-semibold text-sm">❓ Question</h2>
            <p className="text-base">{question}</p>
          </div>

          <div className="flex-1 bg-gray-900 text-white p-4 rounded-md overflow-y-auto max-h-[65vh]">
            <h2 className="font-semibold text-pink-400">💡 AI Answer</h2>
            <div className="mt-2 text-base leading-relaxed">
              {answer.split(" ").map((word, idx) => (
                <span
                  key={idx}
                  className={
                    highlighted.includes(word) ? "bg-yellow-300 text-black" : ""
                  }
                >
                  {word}{" "}
                </span>
              ))}
            </div>
          </div>

          {/* Read Aloud */}
          <button
            onClick={startReadAloudPractice}
            className="mt-3 px-4 py-2 rounded-md bg-pink-500 text-white self-start"
          >
            🎙️ Read Aloud
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;
