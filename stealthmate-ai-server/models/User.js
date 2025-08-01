const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },

  // ✅ Correct nested plan object
  plan: {
    name: { type: String, enum: ['Free', 'Basic', 'Pro'], default: 'Free' },
    dailyLimit: { type: Number, default: 3 }, // Free = 3/day
    usedToday: { type: Number, default: 0 },
    expiresAt: { type: Date },
    lastUsed: { type: Date },
    lastToken: { type: String }

  },

  authProvider: { type: String, enum: ['google', 'email'], default: 'email' },
  otp: String, // for email login
  isVerified: { type: Boolean, default: false },

  usageCount: { type: Number, default: 0 }, // Daily questions used
  createdAt: { type: Date, default: Date.now },

  // ✅ Mock interview tracking
  mockCountToday: { type: Number, default: 0 },
  mockLastUsed: { type: Date }
});

module.exports = mongoose.model('User', userSchema);


