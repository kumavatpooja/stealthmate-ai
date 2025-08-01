// utils/jwtUtils.js

const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const token = jwt.sign(
    {
      name: user.name,              // ✅ Add full name
      email: user.email,
      role: user.role || "user",    // ✅ Optional role
      userId: user._id              // ✅ Always add userId
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  user.lastToken = token;
  user.save();

  return token;
};

module.exports = { generateToken };
