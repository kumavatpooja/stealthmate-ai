import React, { useState, useRef } from "react";
import { Mic, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../api/axiosConfig";

const LiveInterview = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Mic states
  const [listeningInterviewer, setListeningInterviewer] = useState(false);
  const interviewerRecRef = useRef(null);

  // Highlight mic states
  const [highlightListening, setHighlightListening] = useState(false);
  const highlightRecRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [spokenWords, setSpokenWords] = useState([]);
  const [highlightEnabled, setHighlightEnabled] = useState(true);

  /* ---------------------------
     Speech Recognition Helper
  --------------------------- */
  const getSpeechRecognition = () =>
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  /* ---------------------------
     Interviewer Mic
  --------------------------- */
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
     Highlight Mic (Read Aloud)
  --------------------------- */
  const startHighlightRecognition = () => {
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

      recognition.onstart = () => setHighlightListening(true);

      recognition.onresult = (e) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript + " ";
        }

        const words = transcript.trim().split(" ");
        setSpokenWords(words);
        setHighlightedIndex(words.length - 1);
      };

      recognition.onend = () => setHighlightListening(false);

      recognition.start();
      highlightRecRef.current = recognition;
    } catch (err) {
      console.error("❌ Highlight mic error:", err);
      setHighlightListening(false);
    }
  };

  const stopHighlightRecognition = () => {
    try {
      const rec = highlightRecRef.current;
      if (rec && typeof rec.stop === "function") rec.stop();
    } catch {}
    highlightRecRef.current = null;
    setHighlightListening(false);
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

      const token = localStorage.getItem("token");

      const ocrRes = await api.post("/ocr/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const extractedText = ocrRes?.data?.text?.trim();
      if (!extractedText) {
        setAnswer("⚠️ No text detected in image.");
        return;
      }

      setQuestion(extractedText);

      const solveRes = await api.post(
        "/ocr/solve",
        { extractedText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const aiAnswer = solveRes?.data?.answer;

      setAnswer(
        aiAnswer
          ? aiAnswer.replace(/\n{2,}/g, "\n\n")
          : "⚠️ Failed to solve the question."
      );
    } catch (err) {
      console.error("❌ OCR process error:", err);
      setAnswer("⚠️ Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     Manual Question (typed input)
  --------------------------- */
  const askLiveQuestion = async (q) => {
    if (!q.trim()) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/live/ask",
        { question: q },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const aiAnswer = res?.data?.answer;
      setAnswer(
        aiAnswer
          ? aiAnswer.replace(/\n{2,}/g, "\n\n")
          : "⚠️ Failed to generate answer."
      );
    } catch (err) {
      console.error("❌ askLiveQuestion error:", err);
      setAnswer("⚠️ Could not process this question.");
    } finally {
      setLoading(false);
    }
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
            {/* Mobile Camera Upload */}
            <label className="flex flex-col items-center cursor-pointer">
              <span className="text-2xl">📱</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) =>
                  e.target.files[0] && processOCR(e.target.files[0])
                }
              />
              <p className="text-xs text-gray-500">Mobile Camera</p>
            </label>

            {/* Interviewer Mic */}
            <button
              onClick={() =>
                listeningInterviewer
                  ? stopInterviewerRecognition()
                  : startInterviewerRecognition()
              }
              className={`w-16 h-16 flex items-center justify-center rounded-full ${
                listeningInterviewer ? "bg-red-500" : "bg-green-500"
              } text-white`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-xs text-gray-600">
              {listeningInterviewer ? "Stop Mic" : "Start Mic"}
            </p>
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

          {/* Answer Section */}
          <div className="flex-1 bg-gray-900 text-white p-4 rounded-md overflow-y-auto max-h-[65vh]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-pink-400">💡 AI Answer</h2>
              <button
                onClick={() => setHighlightEnabled(!highlightEnabled)}
                className={`text-xs px-3 py-1 rounded ${
                  highlightEnabled
                    ? "bg-green-400 text-black"
                    : "bg-gray-400 text-white"
                }`}
              >
                Highlight: {highlightEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <div className="mt-2 text-base leading-relaxed">
              {answer.split(" ").map((word, idx) => {
                let className = "";
                if (highlightEnabled) {
                  if (idx < spokenWords.length - 1) {
                    className = "bg-yellow-400 text-black px-1 rounded";
                  } else if (idx === highlightedIndex) {
                    className =
                      "bg-orange-500 text-black px-1 rounded font-bold";
                  }
                }
                return (
                  <span key={idx} className={className}>
                    {word}{" "}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Read Aloud Mic */}
         {/* Read Aloud Mic */}
<div className="mt-4 flex flex-col items-center">
  <button
    onClick={() =>
      highlightListening
        ? stopHighlightRecognition()
        : startHighlightRecognition()
    }
    className={`w-16 h-16 flex items-center justify-center rounded-full shadow-md transition-colors ${
      highlightListening ? "bg-red-500" : "bg-blue-500"
    } text-white`}
  >
    <Mic className="w-8 h-8" />
  </button>
  <p className="text-xs text-gray-600 mt-2">
    {highlightListening ? "Stop Reading" : "Start Reading"}
  </p>
</div>

        </div>
      </div>
    </div>
  );
};

export default LiveInterview;
