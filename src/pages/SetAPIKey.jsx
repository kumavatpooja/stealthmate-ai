import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SetAPIKey() {
  const navigate = useNavigate();
  const [key, setKey] = useState(localStorage.getItem("openai_api_key") || "");

  const handleSave = () => {
    if (!key.startsWith("sk-")) {
      alert("❌ Invalid API key format. It should start with 'sk-'.");
      return;
    }

    localStorage.setItem("openai_api_key", key);
    alert("✅ API key saved successfully.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 Enter Your OpenAI API Key</h2>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="sk-xxxxxxxxxxxxxxxx"
        />
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold w-full py-2 rounded"
        >
          💾 Save & Continue
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Don’t have a key?{" "}
          <a
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Get it from OpenAI
          </a>
        </p>
      </div>
    </div>
  );
}

export default SetAPIKey;
