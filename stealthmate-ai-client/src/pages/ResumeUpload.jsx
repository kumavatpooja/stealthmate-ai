// src/pages/ResumeUpload.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import axios from "../utils/axios";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0); // ✅ progress bar
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Professional");
  const [jobRole, setJobRole] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setProgress(100); // simulate full bar
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a resume file first!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("resumeFile", file);
      formData.append("preferredLanguage", language);
      formData.append("tone", tone);
      formData.append("jobRole", jobRole);
      formData.append("extraInfo", extraInfo);

      await axios.post("/resume/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Resume uploaded successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-200">
      {/* ✅ Card same color everywhere */}
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-lg border border-pink-200">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-pink-500">
          Upload Your Resume & Extra Info
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-2xl p-6 cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition">
            <Upload className="w-10 h-10 text-pink-500 mb-2" />
            <span className="text-gray-700">Drag & drop or click to upload</span>
            <span className="text-xs text-gray-400">Supported: PDF, DOCX, TXT</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* File name + Progress */}
          {file && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">
                📄 {file.name} — {progress}%
              </p>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Language & Tone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Mixed (English + Hindi)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
              >
                <option>Professional</option>
                <option>Friendly</option>
                <option>Formal</option>
                <option>Casual</option>
              </select>
            </div>
          </div>

          {/* Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Role
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. MERN Developer"
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Information
            </label>
            <textarea
              rows="3"
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              placeholder="Tell us about your family background, goals, reason for switching jobs..."
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg transform transition hover:scale-105 hover:shadow-xl"
          >
            Upload & Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeUpload;
