import React, { useState, useRef, useEffect } from "react";
import { Mic, Camera, Send, RefreshCcw, History, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../api/axiosConfig";

const FREE_DAILY_LIMIT = 3;

const LiveInterview = () => {
  const [question, setQuestion] = useState("What is React?");
  const [answer, setAnswer] = useState(
    "React is a JavaScript library for building user interfaces."
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  // mic states
  const [listeningInterviewer, setListeningInterviewer] = useState(false);
  const [listeningCandidate, setListeningCandidate] = useState(false);
  const interviewerRecRef = useRef(null);
  const candidateRecRef = useRef(null);

  // camera states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // free plan
  const [askedCount, setAskedCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const words = answer.split(" ");

  useEffect(() => {
    return () => {
      stopInterviewerRecognition();
      stopCandidateRecognition();
      stopStream();
    };
  }, []);

  /* -------------------- Interviewer mic -------------------- */
  const getSpeechRecognition = () =>
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const startInterviewerRecognition = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert("SpeechRecognition not supported in this browser.");
      return;
    }
    if (listeningCandidate) stopCandidateRecognition();

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListeningInterviewer(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setQuestion(transcript);
      askLiveQuestion(transcript);
    };
    recognition.onerror = () => setListeningInterviewer(false);
    recognition.onend = () => setListeningInterviewer(false);

    recognition.start();
    interviewerRecRef.current = recognition;
  };

  const stopInterviewerRecognition = () => {
    try {
      interviewerRecRef.current?.stop();
    } catch {}
    interviewerRecRef.current = null;
    setListeningInterviewer(false);
  };

  /* -------------------- Candidate mic -------------------- */
  const startCandidateRecognition = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert("SpeechRecognition not supported in this browser.");
      return;
    }
    if (listeningInterviewer) stopInterviewerRecognition();

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => setListeningCandidate(true);
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
    recognition.onend = () => setListeningCandidate(false);

    recognition.start();
    candidateRecRef.current = recognition;
  };

  const stopCandidateRecognition = () => {
    try {
      candidateRecRef.current?.stop();
    } catch {}
    candidateRecRef.current = null;
    setListeningCandidate(false);
    setCurrentWordIndex(-1);
  };

  /* -------------------- Send Q → AI -------------------- */
  const askLiveQuestion = async (q) => {
    if (loading || !q.trim()) return;
    if (askedCount >= FREE_DAILY_LIMIT) {
      setShowLimitModal(true);
      return;
    }
    try {
      setLoading(true);
      setAskedCount((c) => c + 1);
      const res = await api.post("/live/ask", { question: q });
      if (res?.data?.answer) {
        setAnswer(res.data.answer);
        setCurrentWordIndex(-1);
      } else {
        setAnswer("⚠️ Failed to generate an answer. Try again.");
      }
    } catch (err) {
      setAnswer("⚠️ Could not process this question.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Camera + OCR -------------------- */
  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setShowCamera(true);
    } catch {
      setCameraError("Unable to access camera.");
      alert("⚠️ Allow camera permission & try again.");
    }
  };

  const closeCamera = () => stopStream();

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
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

        const extractedText = ocrRes?.data?.text?.trim();
        if (!extractedText) {
          setAnswer("⚠️ No text detected.");
          return;
        }
        setQuestion(extractedText);

        const solveRes = await api.post("/ocr/solve", { extractedText });
        setAnswer(solveRes?.data?.answer || "⚠️ Failed to solve text.");
        setCurrentWordIndex(-1);
      } catch {
        setAnswer("⚠️ OCR processing failed.");
      } finally {
        setLoading(false);
        closeCamera();
      }
    }, "image/jpeg");
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-white to-purple-200 p-4">
      <div className="w-full max-w-7xl h-[85vh] bg-white rounded-3xl shadow-lg grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="p-6 flex flex-col justify-between border-r border-gray-200 col-span-1 bg-gradient-to-br from-pink-50 to-white rounded-2xl">
          <h1 className="text-xl font-extrabold text-pink-600 mb-6">StealthMate AI</h1>
          <div className="flex flex-col gap-10 items-center">
            {/* Camera */}
            <div className="flex flex-col items-center">
              <button
                onClick={openCamera}
                className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:scale-110 transition"
              >
                <Camera className="w-10 h-10" />
              </button>
              <p className="text-sm text-gray-600 mt-2">Enable Camera</p>
            </div>
            {/* Mobile Camera */}
            <div className="text-center">
              <label className="flex flex-col items-center cursor-pointer">
                <span className="text-3xl mb-1">📱</span>
                <span className="text-sm text-gray-600">Mobile Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setQuestion("📸 Captured image uploaded. Processing...");
                    try {
                      setLoading(true);
                      const fd = new FormData();
                      fd.append("image", file);
                      const ocrRes = await api.post("/ocr/image", fd, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      const extractedText = ocrRes?.data?.text?.trim();
                      if (!extractedText) {
                        setAnswer("⚠️ No text detected.");
                        return;
                      }
                      setQuestion(extractedText);
                      const solveRes = await api.post("/ocr/solve", { extractedText });
                      setAnswer(solveRes?.data?.answer || "⚠️ Failed to solve.");
                    } catch {
                      setAnswer("⚠️ Failed to process image.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Tap above to open mobile camera</p>
            </div>
            {/* Mic */}
            <div className="flex flex-col items-center">
              <button
                onClick={() =>
                  listeningInterviewer
                    ? stopInterviewerRecognition()
                    : startInterviewerRecognition()
                }
                className={`w-20 h-20 flex items-center justify-center rounded-full ${
                  listeningInterviewer
                    ? "bg-red-500"
                    : "bg-gradient-to-r from-pink-500 to-purple-600"
                } text-white shadow-lg hover:scale-110 transition`}
              >
                <Mic className="w-10 h-10" />
              </button>
              <p className="text-sm text-gray-600 mt-2">Interviewer Mic</p>
            </div>
          </div>
          {/* Manual Input */}
          <div className="mt-auto flex">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 p-3 border rounded-l-xl focus:ring-2 focus:ring-pink-400 text-lg"
              placeholder="Type your question..."
            />
            <button
              onClick={() => askLiveQuestion(question)}
              disabled={loading}
              className="px-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-r-xl hover:scale-105 transition"
            >
              {loading ? "..." : <Send className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 flex flex-col h-full relative col-span-2">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl mb-5 shadow-md">
            <h2 className="font-semibold text-gray-800 text-lg">❓ Question</h2>
            <p className="text-gray-600 mt-1 text-lg">{question}</p>
          </div>

          {/* Scrollable Answer */}
          <div className="flex-1 bg-gray-900 text-white p-6 rounded-xl shadow-lg flex flex-col w-full relative overflow-y-auto">
            <h2 className="font-semibold text-pink-400 text-xl">💡 AI Answer</h2>
            <div className="mt-4 leading-relaxed flex-1 text-lg prose prose-invert max-w-none overflow-y-auto pr-2">
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
                        wrapLongLines
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
            {/* Candidate mic toggle */}
            {!listeningCandidate ? (
              <button
                onClick={() => startCandidateRecognition()}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center"
              >
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => stopCandidateRecognition()}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
              >
                <Square className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-4 mt-6 justify-center">
            <button
              onClick={() => askLiveQuestion(question)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:scale-105 transition"
            >
              <RefreshCcw className="w-4 h-4" /> Re-ask
            </button>
            <button
              onClick={() => (window.location.href = "/history")}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:scale-105 transition"
            >
              <History className="w-4 h-4" /> History
            </button>
          </div>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-4 w-[720px] max-w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Capture coding question</h3>
              <div className="flex gap-2">
                <button
                  onClick={capturePhoto}
                  className="px-3 py-1 bg-pink-500 text-white rounded-md hover:scale-105"
                >
                  Capture
                </button>
                <button
                  onClick={closeCamera}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="w-full h-[420px] bg-black flex items-center justify-center rounded-md overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
            {cameraError && <p className="text-sm text-red-500 mt-2">{cameraError}</p>}
          </div>
        </div>
      )}

      {/* LIMIT MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-[420px] text-center">
            <h3 className="text-lg font-semibold">⚠️ Free plan limit reached</h3>
            <p className="mt-2">
              You have used your {FREE_DAILY_LIMIT} free questions today. Upgrade to continue.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => setShowLimitModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => (window.location.href = "/pricing")}
                className="px-4 py-2 rounded-md bg-pink-500 text-white"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveInterview;
