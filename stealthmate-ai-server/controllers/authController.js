// controllers/authController.js
const User = require("../models/User");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // Don't send password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserProfile };
