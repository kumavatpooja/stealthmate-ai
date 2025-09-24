// models/Resume.js
const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resumeText: { type: String, required: true },
  preferredLanguage: { type: String, default: "English" },
  tone: { type: String, default: "Professional" },
  jobRole: { type: String, default: "" },
  extraInfo: { type: String, default: "" },
  active: { type: Boolean, default: true }, // ✅ Only one active per session
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Resume", ResumeSchema);
