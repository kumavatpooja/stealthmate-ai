// src/pages/Home.jsx
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">🤖 StealthMate AI</h1>
      <p className="text-lg text-gray-700 mb-6 max-w-xl">
        Your private AI assistant for interviews. Upload your resume, answer live questions, and get instant smart suggestions — in real-time.
      </p>
      <Link to="/upload-resume">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition">
          Get Started
        </button>
      </Link>
    </div>
  );
}

export default Home;
