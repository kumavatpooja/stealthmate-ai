const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const { sendOTP } = require("../utils/emailUtils");
const { generateToken } = require("../utils/jwtUtils");
const authMiddleware = require("../middleware/authMiddleware");

// Google OAuth2 Client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// ----------------- REGISTER -----------------
router.post("/register", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "Name and email are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const newUser = new User({
      name,
      email,
      isVerified: true,
      authProvider: "email",
      role: email === "poojakumavat232@gmail.com" ? "admin" : "user",
      plan: { name: "Free", dailyLimit: 3, usedToday: 0, expiresAt: null },
      usageCount: 0,
    });
    await newUser.save();

    const token = await generateToken(newUser._id);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ----------------- SEND OTP -----------------
router.post("/login/email", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not registered. Please register first." });

    user.otp = otp;
    await user.save();

    console.log(`📩 OTP for ${email}: ${otp}`);
    await sendOTP(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ OTP Send Error:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ----------------- VERIFY OTP -----------------
router.post("/login/verify", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) return res.status(401).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    if (email === "poojakumavat232@gmail.com") user.role = "admin";
    await user.save();

    const token = await generateToken(user._id);
    user.lastToken = token;
    await user.save();

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("❌ OTP Verify Error:", err.message);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
});

// ----------------- GOOGLE LOGIN (classic popup) -----------------
router.post("/login/google-token", async (req, res) => {
  const { token: code } = req.body; // auth code from frontend

  try {
    // Exchange auth code for tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: "postmessage", // required for popup flow
    });

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        picture,
        isVerified: true,
        authProvider: "google",
        role: email === "poojakumavat232@gmail.com" ? "admin" : "user",
        plan: { name: "Free", dailyLimit: 3, usedToday: 0, expiresAt: null },
      });
      await user.save();
    } else if (email === "poojakumavat232@gmail.com" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = await generateToken(user._id);
    user.lastToken = token;
    await user.save();

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("❌ Google Token Error:", error.message);
    res.status(401).json({ message: "Invalid Google token/code" });
  }
});

// ----------------- /me ENDPOINT -----------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("❌ Error in /auth/me:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;
