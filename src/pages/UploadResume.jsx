import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parsePDF } from "../utils/parsePDF";
import { parseDocx } from "../utils/parseDocx";
import { parseTxt } from "../utils/parseTxt";

function UploadResume() {
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    setFileName(file.name);

    let text = "";

    try {
      if (extension === "pdf") {
        text = await parsePDF(file);
      } else if (extension === "docx") {
        text = await parseDocx(file);
      } else if (extension === "txt") {
        text = await parseTxt(file);
      } else {
        alert("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
        return;
      }

      if (!text || text.length < 20) {
        alert("⚠️ Could not extract enough content. Try a different file.");
        return;
      }

      localStorage.setItem("resume_text", text);
      navigate("/add-extra-info");
    } catch (err) {
      console.error("Parse error:", err);
      alert("❌ Failed to read the file. Try again with a valid document.");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Upload Resume (PDF / DOCX / TXT)</h2>

      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        className="mb-4"
      />

      {fileName && (
        <p className="text-sm text-gray-600 mb-2">Selected: {fileName}</p>
      )}

      <button
        onClick={() => document.querySelector('input[type="file"]').click()}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-xl shadow"
      >
        Choose File
      </button>
    </div>
  );
}

export default UploadResume;
