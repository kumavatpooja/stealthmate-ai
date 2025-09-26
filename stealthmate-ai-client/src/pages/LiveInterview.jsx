// src/pages/LiveInterview.jsx
import React, { useState, useRef, useEffect } from "react";
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

const FREE_DAILY_LIMIT = 3; // client-side UI limit (server also enforces)

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

  // free plan UI
  const [askedCount, setAskedCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const words = answer.split(" ");

  useEffect(() => {
    // cleanup on unmount
    return () => {
      stopInterviewerRecognition();
      stopCandidateRecognition();
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------
     Interviewer mic (automatic transcription → send)
     --------------------------- */
  const getSpeechRecognition = () =>
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const startInterviewerRecognition = async () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert("SpeechRecognition not supported in this browser.");
      return;
    }

    // if candidate mic is running, stop it to avoid conflicts
    if (listeningCandidate) {
      stopCandidateRecognition();
    }

    try {
      const recognition = new SR();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log("🟢 Interviewer recognition started");
        setListeningInterviewer(true);
      };

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        console.log("📝 Interviewer transcript:", transcript);
        setQuestion(transcript);

        // Auto-send after we got final transcript
        askLiveQuestion(transcript);
      };

      recognition.onerror = (err) => {
        console.warn("❌ Interviewer recognition error:", err);
        setListeningInterviewer(false);
      };

      recognition.onend = () => {
        console.log("⚪ Interviewer recognition ended");
        setListeningInterviewer(false);
      };

      recognition.start();
      interviewerRecRef.current = recognition;
    } catch (err) {
      console.error("❌ startInterviewerRecognition:", err);
      setListeningInterviewer(false);
    }
  };

  const stopInterviewerRecognition = () => {
    try {
      const rec = interviewerRecRef.current;
      if (rec && typeof rec.stop === "function") {
        rec.stop();
      }
    } catch (err) {
      console.warn("stopInterviewerRecognition error:", err);
    } finally {
      interviewerRecRef.current = null;
      setListeningInterviewer(false);
    }
  };

  /* ---------------------------
     Candidate reading mic (only for highlighting)
     --------------------------- */
  const startCandidateRecognition = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert("SpeechRecognition not supported in this browser.");
      return;
    }

    // try to keep both separate — browser may only allow one at a time:
    if (listeningInterviewer) {
      // stop interviewer temporarily (browser usually prevents two recognitions)
      stopInterviewerRecognition();
    }

    try {
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
          if (
            spokenWords.includes(words[i].toLowerCase().replace(/[^\w]/g, ""))
          ) {
            matchedIndex = i;
            break;
          }
        }
        if (matchedIndex > currentWordIndex) setCurrentWordIndex(matchedIndex);
      };

      recognition.onend = () => {
        setListeningCandidate(false);
        // attempt to restart interviewer recognition? no — keep user control
      };

      recognition.start();
      candidateRecRef.current = recognition;
    } catch (err) {
      console.error("❌ startCandidateRecognition:", err);
      setListeningCandidate(false);
    }
  };

  const stopCandidateRecognition = () => {
    try {
      const rec = candidateRecRef.current;
      if (rec && typeof rec.stop === "function") rec.stop();
    } catch (err) {
      console.warn("stopCandidateRecognition:", err);
    } finally {
      candidateRecRef.current = null;
      setListeningCandidate(false);
      setCurrentWordIndex(-1);
    }
  };

  /* ---------------------------
     Send question → backend (with client-side free-plan guard)
     --------------------------- */
  const askLiveQuestion = async (q) => {
    if (loading || !q || q.trim() === "") return;

    // client-side free plan guard
    if (askedCount >= FREE_DAILY_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    try {
      setLoading(true);

      // Increment asked count locally (UI only)
      setAskedCount((c) => c + 1);

      const res = await api.post("/live/ask", { question: q });
      if (res?.data?.answer) {
        setAnswer(res.data.answer);
        setCurrentWordIndex(-1);
      } else {
        setAnswer("⚠️ Failed to generate a resume-based answer. Please try again.");
      }
    } catch (err) {
      console.error("❌ askLiveQuestion error:", err);
      if (err?.response?.status === 429 || err?.response?.status === 403) {
        // server says limit reached
        setShowLimitModal(true);
        setAnswer("⚠️ Free plan limit reached. Upgrade to continue.");
      } else if (err?.response?.status === 401) {
        setAnswer("⚠️ Unauthorized. Please login again.");
      } else {
        setAnswer("⚠️ Could not process this question.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     Camera: robust open, fallback to simple video if needed
     --------------------------- */
  const stopStream = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } catch (err) {
      console.warn("stopStream error:", err);
    }
    setShowCamera(false);
  };

  const openCamera = async () => {
    setCameraError(null);
    try {
      console.log("📸 Requesting camera...");

      // First try with environment/back camera preference
      const primaryConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);

      // If returned stream appears inactive or has no video tracks, fallback
      const hasVideoTrack = stream && stream.getVideoTracks && stream.getVideoTracks().length > 0;
      const active = stream && stream.active;

      if (!hasVideoTrack || !active) {
        console.warn("Primary camera attempt returned inactive stream — trying fallback.");
        // close previous tracks
        stream.getTracks().forEach((t) => t.stop());
        // fallback to simple default camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      // attach stream
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // avoid audio feedback
        videoRef.current.playsInline = true;
        // ensure autoplay attempt (some browsers return a Promise)
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("▶️ video.play() failed:", playErr);
        }
      }

      setShowCamera(true);
      console.log("✅ Camera stream started", stream);
    } catch (err) {
      console.error("❌ Camera error:", err);
      setCameraError(
        "Unable to access camera. Make sure the page is served from https (or localhost), allow camera permission, and close other apps that use camera."
      );
      alert("⚠️ Unable to access camera. Please allow permission & try again.");
    }
  };

  const closeCamera = () => {
    stopStream();
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    const vid = videoRef.current;

    // compute dims
    const w = vid.videoWidth || vid.clientWidth || 1280;
    const h = vid.videoHeight || vid.clientHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(vid, 0, 0, w, h);

    canvas.toBlob(async (blob) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("image", blob, "capture.jpg");

        // OCR endpoint (requires auth via api axios interceptors)
        const ocrRes = await api.post("/ocr/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const extractedText = ocrRes.data.text?.trim();
        if (!extractedText) {
          setAnswer("⚠️ No text detected in image.");
          return;
        }

        setQuestion(extractedText);

        // send to /ocr/solve (server will call OpenAI)
        const solveRes = await api.post("/ocr/solve", { extractedText });
        if (solveRes?.data?.answer) {
          setAnswer(solveRes.data.answer);
          setCurrentWordIndex(-1);
        } else {
          setAnswer("⚠️ Failed to solve the coding prompt.");
        }
      } catch (err) {
        console.error("❌ capturePhoto error:", err);
        setAnswer("⚠️ Failed to extract/solve from image.");
      } finally {
        setLoading(false);
        closeCamera();
      }
    }, "image/jpeg");
  };

  /* ---------------------------
     UI / JSX
     --------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-white to-purple-200 p-4">
      <div className="w-full max-w-7xl h-[85vh] bg-white rounded-3xl shadow-[0_4px_30px_rgba(255,0,150,0.4)] grid grid-cols-1 md:grid-cols-3 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="p-6 flex flex-col justify-between border-r border-gray-200 col-span-1 bg-gradient-to-br from-pink-50 to-white rounded-2xl">
          <h1 className="text-xl font-extrabold text-pink-600 mb-6">StealthMate AI</h1>

          <div className="flex flex-col gap-10 items-center">
            {/* Camera */}
            <div className="flex flex-col items-center">
              <button
                onClick={openCamera}
                className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:scale-110 transition"
                title="Open camera"
              >
                <Camera className="w-10 h-10" />
              </button>
              <p className="text-sm text-gray-600 mt-2">Enable Camera</p>
            </div>

            {/* Mobile fallback: file input capture */}
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="mb-2"
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
                    const extractedText = ocrRes.data.text?.trim();
                    if (!extractedText) {
                      setAnswer("⚠️ No text detected in image.");
                      return;
                    }
                    setQuestion(extractedText);
                    const solveRes = await api.post("/ocr/solve", { extractedText });
                    if (solveRes?.data?.answer) {
                      setAnswer(solveRes.data.answer);
                    }
                  } catch (err) {
                    console.error(err);
                    setAnswer("⚠️ Failed to process captured image.");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              <p className="text-xs text-gray-500">Mobile: take photo to upload</p>
            </div>

            {/* Interviewer Mic */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  if (!listeningInterviewer) startInterviewerRecognition();
                  else stopInterviewerRecognition();
                }}
                className={`w-20 h-20 flex items-center justify-center rounded-full
                  ${listeningInterviewer ? "bg-red-500" : "bg-gradient-to-r from-pink-500 to-purple-600"}
                  text-white shadow-lg hover:scale-110 transition`}
                title="Listen interviewer question"
              >
                <Mic className="w-10 h-10" />
              </button>
              <p className="text-sm text-gray-600 mt-2">Interviewer Mic</p>
            </div>
          </div>

          {/* Question input */}
          <div className="mt-auto">
            <div className="flex">
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
                title="Send question"
              >
                {loading ? "..." : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — answer panel kept intact */}
        <div className="p-6 flex flex-col h-full relative col-span-2">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl mb-5 shadow-md">
            <h2 className="font-semibold text-gray-800 text-lg">❓ Question</h2>
            <p className="text-gray-600 mt-1 text-lg">{question}</p>
          </div>

          <div className="flex-1 bg-gray-900 text-white p-6 rounded-xl shadow-lg flex flex-col w-full relative overflow-y-auto">
            <h2 className="font-semibold text-pink-400 text-xl">💡 AI Answer</h2>
            <div className="mt-4 leading-relaxed flex-1 text-lg prose prose-invert max-w-none">
              <ReactMarkdown
                children={answer}
                components={{
                  code({ node, inline, className, children, ...props }) {
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

            {/* Candidate reading mic (highlighting support) */}
            {!listeningCandidate ? (
              <button
                onClick={() => startCandidateRecognition()}
                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-600 text-white transition hover:scale-110"
                title="Track candidate reading"
              >
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => stopCandidateRecognition()}
                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition hover:scale-110"
                title="Stop tracking"
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

      {/* Camera Modal */}
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
              {/* REPLACED video block (robust attributes & style) */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                style={{ backgroundColor: "black" }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            {cameraError && (
              <p className="text-sm text-red-500 mt-2">{cameraError}</p>
            )}
          </div>
        </div>
      )}

      {/* LIMIT MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-[420px] text-center">
            <h3 className="text-lg font-semibold">⚠️ Free plan limit reached</h3>
            <p className="mt-2">You have used your {FREE_DAILY_LIMIT} free questions for today. Upgrade to continue.</p>
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