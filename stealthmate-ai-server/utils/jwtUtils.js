// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = async (userId) => {
  const freshUser = await User.findById(userId);
  if (!freshUser) throw new Error("User not found for token generation");

  const token = jwt.sign(
    {
      name: freshUser.name,
      email: freshUser.email,
      role: freshUser.role || "user",
      userId: freshUser._id
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  freshUser.lastToken = token;
  await freshUser.save();

  return token;
};

module.exports = { generateToken };
