import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddExtraInfo() {
  const [extraInfo, setExtraInfo] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!extraInfo || extraInfo.length < 10) {
      alert("⚠️ Please enter some extra details before continuing.");
      return;
    }

    localStorage.setItem("extra_info", extraInfo);
    navigate("/interview");
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Add Extra Info (Optional)</h2>

      <textarea
        value={extraInfo}
        onChange={(e) => setExtraInfo(e.target.value)}
        rows={6}
        placeholder="Add additional details not covered in your resume. E.g., skills, certifications, side projects, etc."
        className="w-full max-w-2xl p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:ring-yellow-400 bg-white text-gray-700"
      />

      {/* ✅ Nesting fix: ul is no longer inside p */}
      <div className="text-sm text-gray-600 mb-4 text-center max-w-2xl mt-2">
        <p><strong>Examples you can include:</strong></p>
        <ul className="list-disc mt-2 pl-5 text-left text-gray-700">
          <li>Projects not mentioned in resume</li>
          <li>Tech skills or hobbies</li>
          <li>Certifications or volunteer work</li>
          <li>Specific domains (e.g. fintech, AI, edtech)</li>
        </ul>
      </div>

      <button
        onClick={handleContinue}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow mt-4"
      >
        ✅ Continue to Interview
      </button>
    </div>
  );
}

export default AddExtraInfo;
