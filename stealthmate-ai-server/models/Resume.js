// models/Resume.js
const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // 📝 Core text extracted from resume
  resumeText: { type: String, default: "" }, // not strictly required
  parsedText: { type: String, default: "" }, // optional fallback

  // 🎯 User preferences
  preferredLanguage: { type: String, default: "English" },
  tone: { type: String, default: "Professional" },
  jobRole: { type: String, default: "" },
  extraInfo: { type: String, default: "" },

  active: { type: Boolean, default: true }, // only one active per user
  uploadedAt: { type: Date, default: Date.now },
});

// 🔎 Virtual: unified resume content
ResumeSchema.virtual("fullText").get(function () {
  return this.resumeText || this.parsedText || "";
});

module.exports = mongoose.model("Resume", ResumeSchema);
