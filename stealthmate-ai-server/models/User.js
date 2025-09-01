const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ✅ Role for admin/user access
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ✅ Plan object for subscriptions
    plan: {
      name: { type: String, enum: ["Free", "Basic", "Pro"], default: "Free" },
      dailyLimit: { type: Number, default: 3 }, // Free = 3/day
      usedToday: { type: Number, default: 0 },
      expiresAt: { type: Date },
      lastUsed: { type: Date },
      lastToken: { type: String },
    },

    authProvider: {
      type: String,
      enum: ["google", "email"],
      default: "email",
    },

    otp: {
      type: String,
    }, // for email login

    isVerified: {
      type: Boolean,
      default: false,
    },

    usageCount: {
      type: Number,
      default: 0,
    }, // Daily questions used

    createdAt: {
      type: Date,
      default: Date.now,
    },

    // ✅ Mock interview tracking
    mockCountToday: {
      type: Number,
      default: 0,
    },
    mockLastUsed: {
      type: Date,
    },

    // ✅ Optional: store googleId if needed for OAuth
    googleId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
