import { Link } from "react-router-dom";
import cardImage from "../assets/card.jpg";
import bgImage from "../assets/bg.jpg";
import roboGif from "../assets/robo.gif"; // ✅ Correct path for the robot

export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-6 py-24 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className="w-full max-w-5xl min-h-[460px] rounded-3xl overflow-hidden shadow-xl transform transition duration-700 hover:scale-105 backdrop-blur-md bg-white bg-opacity-90"
        style={{
          backgroundImage: `url(${cardImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="p-10 flex flex-col items-center justify-center">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={roboGif}
              alt="bot"
              className="h-10 w-15 md:h-10 md:w-12 animate-bounce"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-primary drop-shadow">
              Welcome to <span className="text-cta">StealthMate AI</span>
            </h1>
          </div>

          <p className="text-lg text-textDark mb-8 leading-relaxed bg-white/70 p-4 rounded-xl shadow">
            🚀 Boost your interview confidence with real-time, resume-based answers.<br />
            🎙️ Understands spoken questions, even when misheard.<br />
            📷 Snap coding tasks with your camera and get step-by-step AI help.<br />
            🌐 Works across mobile, web — no setup needed.
          </p>

          <div className="flex gap-5 flex-wrap">
            <Link
              to="/register"
              className="bg-secondary px-6 py-3 rounded-lg font-semibold text-white shadow hover:bg-primary transition"
            >
              Get Started
            </Link>
            <Link
              to="/pricing"
              className="border border-secondary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-secondary hover:text-white transition"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
