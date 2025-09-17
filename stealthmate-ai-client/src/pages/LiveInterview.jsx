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
import api from "../api/axiosConfig";

const LiveInterview = () => {
  const [question, setQuestion] = useState("What is React?");
  const [answer, setAnswer] = useState(
    "React is a JavaScript library for building user interfaces. It uses a declarative approach and virtual DOM for efficient updates."
  );

  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const [loading, setLoading] = useState(false);

  // camera state
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const words = answer.split(" ");

  // 🎤 Mic 1 → interviewer (only fill input, no API call)
  const listenInterviewer = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setQuestion(transcript); // ✅ just set the question
    };

    recognition.onerror = (e) => {
      console.error("❌ Interviewer mic error:", e);
    };

    recognition.start();
  };

  // 🧠 Send question to backend with resume context
  const askLiveQuestion = async (q) => {
    if (loading) return;
    if (!q || q.trim() === "") return;

    try {
      setLoading(true);
      const res = await api.post("/live/ask", { question: q });
      if (res?.data?.answer) {
        setAnswer(res.data.answer);
        setCurrentWordIndex(-1);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setAnswer("⚠️ Too many requests. Please wait before asking again.");
      } else {
        console.error("❌ Live Interview Ask Error:", err);
        setAnswer("⚠️ Sorry, I couldn't process this question. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 📷 Camera helpers
  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640 } });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Check permissions.");
    }
  };

  const closeCamera = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    closeCamera();

    try {
      setLoading(true);
      const blob = await (await fetch(dataUrl)).blob();
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      const ocrRes = await api.post("/ocr/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extractedText = ocrRes.data.text?.trim();
      if (!extractedText) {
        setAnswer("⚠️ No text detected in image. Try again with clearer photo.");
        return;
      }

      setQuestion(extractedText);

      const solveRes = await api.post("/ocr/solve", { extractedText });
      if (solveRes?.data?.answer) {
        setAnswer(solveRes.data.answer);
        setCurrentWordIndex(-1);
      }
    } catch (err) {
      console.error("❌ OCR or Solve error:", err);
      setAnswer("⚠️ Failed to extract/solve from image.");
    } finally {
      setLoading(false);
    }
  };

  // 🎤 Mic 2 → candidate reading tracker
  const trackReading = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
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

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopReading = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      setCurrentWordIndex(-1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-white to-purple-200 p-6">
      <div className="w-full max-w-7xl h-[85vh] bg-white rounded-3xl shadow-[0_4px_30px_rgba(255,0,150,0.4)] grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="p-6 flex flex-col justify-between items-center border-r border-gray-200 col-span-1">
          <div className="bg-white rounded-2xl shadow-[0_0_25px_rgba(255,0,150,0.5)] p-6 flex flex-col items-center gap-6 w-full">
            <h3 className="text-lg font-semibold text-gray-700">🎥 Setup</h3>

            {/* Camera */}
            <button
              onClick={openCamera}
              className="w-20 h-20 flex items-center justify-center rounded-full 
                         bg-gradient-to-r from-purple-500 to-pink-600 text-white 
                         shadow-[0_0_20px_rgba(255,0,150,0.8)] hover:scale-110 transition"
              title="Open camera"
            >
              <Camera className="w-10 h-10" />
            </button>
            <p className="text-sm text-gray-600">Enable Camera</p>

            {/* Mic 1 */}
            <button
              onClick={listenInterviewer}
              className={`w-24 h-24 flex items-center justify-center rounded-full 
                         ${listening ? "bg-red-500" : "bg-gradient-to-r from-pink-500 to-purple-600"} 
                         text-white shadow-[0_0_25px_rgba(255,0,150,0.8)] 
                         hover:scale-110 transition animate-pulse`}
              title="Listen interviewer question"
            >
              <Mic className="w-12 h-12" />
            </button>
            <p className="text-sm text-gray-600">Interviewer Mic</p>
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
              className="px-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-r-xl hover:scale-105 transition shadow-[0_0_15px_rgba(255,0,150,0.7)]"
            >
              {loading ? "..." : <Send className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 flex flex-col h-full relative col-span-2">
          {/* Question */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl mb-5 shadow-[0_0_20px_rgba(255,0,150,0.6)]">
            <h2 className="font-semibold text-gray-800 text-lg">❓ Question</h2>
            <p className="text-gray-600 mt-1 text-lg">{question}</p>
          </div>

          {/* Answer */}
          <div className="flex-1 bg-gray-900 text-white p-6 rounded-xl shadow-[0_0_30px_rgba(255,0,150,0.8)] flex flex-col w-full relative">
            <h2 className="font-semibold text-pink-400 text-xl">💡 AI Answer</h2>
            <p className="mt-4 leading-relaxed flex-1 overflow-y-auto text-lg">
              {words.map((word, index) => (
                <span
                  key={index}
                  className={
                    index <= currentWordIndex
                      ? "text-pink-400 font-bold"
                      : "text-white"
                  }
                >
                  {word}{" "}
                </span>
              ))}
            </p>

            {/* Example code area */}
            <pre className="mt-6 bg-gray-800 text-green-300 p-5 rounded-lg text-lg font-mono overflow-x-auto">
{`function HelloWorld() {
  return <h1>Hello, world!</h1>;
}`}
            </pre>

            {/* Mic 2 */}
            {!listening ? (
              <button
                onClick={trackReading}
                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full 
                           bg-pink-500 hover:bg-pink-600 text-white transition hover:scale-110"
                title="Track candidate reading"
              >
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={stopReading}
                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full 
                           bg-red-500 hover:bg-red-600 text-white transition hover:scale-110"
                title="Stop tracking"
              >
                <Square className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6 justify-center">
            <button
              onClick={() => askLiveQuestion(question)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_20px_rgba(255,0,150,0.7)] hover:scale-105 transition"
            >
              <RefreshCcw className="w-4 h-4" /> Re-ask
            </button>
            <button
              onClick={() => (window.location.href = "/history")}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_20px_rgba(255,0,150,0.7)] hover:scale-105 transition"
            >
              <History className="w-4 h-4" /> History
            </button>
          </div>
        </div>
      </div>

      {/* Camera modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-4 w-[720px] max-w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Capture coding question (camera)</h3>
              <div className="flex gap-2">
                <button
                  onClick={capturePhoto}
                  className="px-3 py-1 bg-pink-500 text-white rounded-md hover:scale-105 transition"
                >
                  Capture
                </button>
                <button
                  onClick={closeCamera}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:scale-105 transition"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="w-full h-[420px] bg-black flex items-center justify-center rounded-md overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveInterview;
