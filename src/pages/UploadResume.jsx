import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function UploadResume() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile.type === "application/pdf") {
      extractPDFText(selectedFile);
    } else if (
      selectedFile.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extractDocxText(selectedFile);
    } else if (selectedFile.type === "text/plain") {
      extractTxtText(selectedFile);
    } else {
      alert("Please upload a PDF, DOCX, or TXT file.");
    }
  };

  const extractPDFText = async (file) => {
    const reader = new FileReader();
    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      setText(fullText);
    };
    reader.readAsArrayBuffer(file);
  };

  const extractDocxText = async (file) => {
    const reader = new FileReader();
    reader.onload = async function (event) {
      const arrayBuffer = event.target.result;
      const result = await mammoth.extractRawText({ arrayBuffer });
      setText(result.value);
    };
    reader.readAsArrayBuffer(file);
  };

  const extractTxtText = (file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      setText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!text) {
      alert("Please upload a valid resume file.");
      return;
    }

    localStorage.setItem("resume_text", text);
    // ✅ SKIP extra info and go to dashboard directly
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Upload Resume</h2>

      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        className="mb-4"
      />

      <button
        onClick={handleSubmit}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
      >
        ✅ Save & Continue
      </button>

      {text && (
        <div className="mt-6 w-full max-w-2xl bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-gray-700">📋 Extracted Resume Text:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 max-h-60 overflow-auto">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

export default UploadResume;
