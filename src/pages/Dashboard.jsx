import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("user_name") || "Guest";
  const plan = localStorage.getItem("active_plan") || "Free (3 Questions/Day)";

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (!email) navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">👋 Welcome, {userName}</h2>
      <p className="text-md text-gray-700 mb-6">
        🌟 Your Plan: <span className="font-semibold">{plan}</span>
      </p>

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
          onClick={() => navigate("/interview")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow"
        >
          🎤 Start Interview
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
