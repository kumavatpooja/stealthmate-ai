import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userName = localStorage.getItem("user_name") || "Guest";

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">🤖 StealthMate AI</h1>
      <p className="text-lg text-gray-700 mb-6 max-w-xl">
        Your private, smart interview assistant. Upload your resume, listen to live questions, and get AI-generated answers instantly!
      </p>

      {!isLoggedIn ? (
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow"
          >
            🔐 Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl shadow"
          >
            📝 Register
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-gray-800">Welcome back, <span className="font-bold">{userName}</span>!</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-xl shadow"
            >
              🏠 Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl shadow"
            >
              🔒 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
