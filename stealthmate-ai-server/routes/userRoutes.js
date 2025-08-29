// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password -otp -__v");
    if (!req.user) return res.status(404).json({ message: "User not found" });
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ /me always includes role
router.get("/me", authMiddleware, async (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ _id, name, email, role });
});

module.exports = router;
