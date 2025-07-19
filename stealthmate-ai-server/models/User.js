const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String }, // ✅ Password-based login

  // ✅ Password reset
  resetToken: String,
  resetTokenExpires: Date,

  plan: {
    name: { type: String, enum: ['Free', 'Basic', 'Pro'], default: 'Free' },
    dailyLimit: { type: Number, default: 3 },
    usedToday: { type: Number, default: 0 },
    expiresAt: { type: Date },
    lastUsed: { type: Date },
    lastToken: { type: String }
  },

  authProvider: { type: String, enum: ['google', 'email'], default: 'email' },
  otp: String,
  isVerified: { type: Boolean, default: false },

  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },

  mockCountToday: { type: Number, default: 0 },
  mockLastUsed: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
