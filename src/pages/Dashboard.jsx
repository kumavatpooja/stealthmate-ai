// src/pages/Dashboard.jsx

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [usageInfo, setUsageInfo] = useState(null);

  const userName = localStorage.getItem("user_name") || "Guest";
  const planText = localStorage.getItem("active_plan") || "Free (3 Questions/Day)";

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (!email) navigate("/login");

    const fetchUsage = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/interview/usage", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("📊 usageInfo from backend:", data); // Debug log

        if (res.ok) setUsageInfo(data);
        else console.error("❌ Failed to fetch usage info:", data.message);
      } catch (err) {
        console.error("⚠️ Failed to fetch usage info", err);
      }
    };

    fetchUsage();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">👋 Welcome, {userName}</h2>
      <p className="text-md text-gray-700 mb-2">
        🌟 Your Plan: <span className="font-semibold">{planText}</span>
      </p>

      {usageInfo && (
        <div className="bg-white border border-yellow-300 rounded-xl px-6 py-4 mb-4 shadow-md text-gray-800 text-sm w-full max-w-md">
          <p>
            🧠 Used Today: <strong>{usageInfo.used ?? "0"}</strong> / {usageInfo.limit ?? "?"}
          </p>
          <p>
            ⏳ Remaining:{" "}
            <strong>
              {usageInfo.remaining != null
                ? usageInfo.remaining
                : (usageInfo.limit ?? 0) - (usageInfo.used ?? 0)}
            </strong>{" "}
            questions
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={() => navigate("/upload-resume")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow"
        >
          📤 Upload Resume
        </button>
        <button
          onClick={() => navigate("/add-extra-info")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow"
        >
          📝 Add Extra Info
        </button>
        <button
          onClick={() => navigate("/mock-interview")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow"
        >
          🧪 Mock Interview
        </button>
        <button
          onClick={() => navigate("/interview")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow"
        >
          🎤 Start Interview
        </button>
        <button
          onClick={() => navigate("/history")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow"
        >
          📄 View Q&A History
        </button>
        <button
          onClick={() => navigate("/plans")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow"
        >
          💳 View / Upgrade Plan
        </button>
      </div>

      <button
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
        className="mt-6 text-sm text-red-600 underline"
      >
        🔒 Logout
      </button>
    </div>
  );
}

export default Dashboard;
