import React from "react";
import { useNavigate } from "react-router-dom";
import homebg from "../assets/homebg.jpg"; // your actual background image

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center"
      style={{
        backgroundImage: `url(${homebg})`,
      }}
    >
      <div className="w-full h-full bg-black/60 flex items-center justify-start px-8 sm:px-16">
        <div className="max-w-[700px] text-white">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Welcome to{" "}
            <span className="text-pink-500">Stealth</span>
            <span className="text-yellow-400">Mate</span> AI
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8">
            Smart interview prep assistant — accurate, helpful, and confidential.
            StealthMate gives you real-time, personalized practice without the
            fluff. Built for people who want to level up, not cheat.
          </p>

          <ul className="text-white/90 space-y-3 mb-10 text-base sm:text-lg">
            <li>📄 Resume-powered AI — personalized answers from your profile</li>
            <li>🎧 Smart voice input — understands spoken questions instantly</li>
            <li>🌐 Hindi + English support for real inclusivity</li>
            <li>⚙️ Job role & tone selector — customize answers on the fly</li>
            <li>📈 Tracks usage and helps improve performance daily</li>
            <li>🔐 Private & secure — no session tracking, no data saved</li>
          </ul>

          <button
          onClick={() => navigate("/register", { replace: true })}

            className="px-6 py-3 text-white bg-[#9c48e1] border-pink-500 rounded-full font-semibold hover:bg-pink-600 transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
