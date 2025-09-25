// src/pages/LiveInterview.jsx
import React, { useState, useRef } from "react";
import {
  Mic,
  Camera,
  Send,
  RefreshCcw,
  History,
  Square,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../api/axiosConfig";

const LiveInterview = () => {
  const [question, setQuestion] = useState("What is React?");
  const [answer, setAnswer] = useState(
    "React is a JavaScript library for building user interfaces."
  );

  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const recognitionRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // 🎤 Mic states
  const [listeningHighlight, setListeningHighlight] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // 📸 Camera state
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const words = answer.split(" ");

  // 🎤 Mic 1 → Interviewer (Whisper backend)
  const listenInterviewer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "question.webm");

        try {
          const res = await api.post("/live/speech", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const q = res.data?.clarified || res.data?.original || "";
          if (q) {
            setQuestion(q);
            askLiveQuestion(q);
          }
        } catch (err) {
          console.error("❌ Speech error:", err);
          setAnswer("⚠️ Could not process microphone input.");
        }
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); // record 5s
    } catch (err) {
      console.error("Mic error:", err);
      alert("⚠️ Please allow microphone access.");
    }
  };

  // 🧠 Send Q to backend
  const askLiveQuestion = async (q) => {
    if (loading || !q || q.trim() === "") return;
    try {
      setLoading(true);
      const res = await api.post("/live/ask", { question: q });
      if (res?.data?.answer) {
        setAnswer(res.data.answer);
        setCurrentWordIndex(-1);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setShowPlanModal(true); // show modal
      } else {
        setAnswer("⚠️ Could not process this question.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🎤 Mic 2 → Candidate Highlight
  const trackReading = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;

    recognition.onresult = (e) => {
      const spoken = e.results[e.results.length - 1][0].transcript;
      const spokenWords = spoken.trim().toLowerCase().split(" ");
      let matchedIndex = currentWordIndex;
      for (let i = currentWordIndex + 1; i < words.length; i++) {
        if (spokenWords.includes(words[i].toLowerCase().replace(/[^\w]/g, ""))) {
          matchedIndex = i;
          break;
        }
      }
      if (matchedIndex > currentWordIndex) setCurrentWordIndex(matchedIndex);
    };

    recognition.onend = () => setListeningHighlight(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListeningHighlight(true);
  };

  const stopReading = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListeningHighlight(false);
      setCurrentWordIndex(-1);
    }
  };

  // 📷 Camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        await videoRef.current.play().catch((err) => {
          console.warn("▶️ Play blocked:", err);
        });
      }
      setShowCamera(true);
    } catch (err) {
      console.error("❌ Camera error:", err);
      alert("⚠️ Camera blocked. Allow permissions & use HTTPS.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("image", blob, "capture.jpg");

        const ocrRes = await api.post("/ocr/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const extractedText = ocrRes.data.text?.trim();
        if (!extractedText) {
          setAnswer("⚠️ No text detected in image.");
          return;
        }

        setQuestion(extractedText);

        const solveRes = await api.post("/ocr/solve", { extractedText });
        if (solveRes?.data?.answer) {
          setAnswer(solveRes.data.answer);
          setCurrentWordIndex(-1);
        }
      } catch (err) {
        setAnswer("⚠️ Failed to extract/solve from image.");
      } finally {
        setLoading(false);
        closeCamera();
      }
    }, "image/jpeg");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-white to-purple-200 p-6">
      <div className="w-full max-w-7xl h-[85vh] bg-white rounded-3xl shadow-lg grid grid-cols-1 md:grid-cols-3 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="p-6 flex flex-col justify-between items-center border-r border-gray-200 col-span-1">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-6 w-full">
            <h3 className="text-lg font-semibold text-gray-700">🎥 Setup</h3>

            {/* Camera */}
            <button onClick={openCamera} className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow hover:scale-110 transition">
              <Camera className="w-10 h-10" />
            </button>
            <p className="text-sm text-gray-600">Enable Camera</p>

            {/* Mic 1 */}
            <button onClick={listenInterviewer} className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow hover:scale-110 transition animate-pulse">
              <Mic className="w-12 h-12" />
            </button>
            <p className="text-sm text-gray-600">🎤 Interviewer Mic</p>
          </div>

          {/* Question input */}
          <div className="flex w-full max-w-sm mt-8">
            <input
              type="text"
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 p-3 border rounded-l-xl focus:ring-2 focus:ring-pink-400 text-lg"
            />
            <button
              onClick={() => askLiveQuestion(question)}
              disabled={loading}
              className="px-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-r-xl hover:scale-105 transition shadow"
            >
              {loading ? "..." : <Send className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 flex flex-col h-full relative col-span-2">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl mb-5 shadow">
            <h2 className="font-semibold text-gray-800 text-lg">❓ Question</h2>
            <p className="text-gray-600 mt-1 text-lg">{question}</p>
          </div>

          <div className="flex-1 bg-gray-900 text-white p-6 rounded-xl shadow flex flex-col w-full relative">
            <h2 className="font-semibold text-pink-400 text-xl">💡 AI Answer</h2>
            <div className="mt-4 leading-relaxed flex-1 overflow-y-auto text-lg prose prose-invert max-w-none">
              <ReactMarkdown
                children={answer}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-800 px-1 py-0.5 rounded" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </div>

            {/* Candidate Highlight Mic */}
            {!listeningHighlight ? (
              <button onClick={trackReading} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-600 text-white transition hover:scale-110">
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={stopReading} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition hover:scale-110">
                <Square className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-4 mt-6 justify-center">
            <button onClick={() => askLiveQuestion(question)} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow hover:scale-105 transition">
              <RefreshCcw className="w-4 h-4" /> Re-ask
            </button>
            <button onClick={() => (window.location.href = "/history")} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow hover:scale-105 transition">
              <History className="w-4 h-4" /> History
            </button>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-4 w-[720px] max-w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Capture coding question (camera)</h3>
              <div className="flex gap-2">
                <button onClick={capturePhoto} className="px-3 py-1 bg-pink-500 text-white rounded-md hover:scale-105 transition">Capture</button>
                <button onClick={closeCamera} className="px-3 py-1 bg-gray-200 rounded-md hover:scale-105 transition">Close</button>
              </div>
            </div>
            <div className="w-full h-[420px] bg-black flex items-center justify-center rounded-md overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          </div>
        </div>
      )}

      {/* Free Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Free Plan Limit</h2>
            <p className="text-gray-700 mb-6">You have reached your daily free plan limit (3 questions). Please upgrade to continue.</p>
            <button onClick={() => setShowPlanModal(false)} className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow hover:scale-105 transition">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveInterview;
