const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Save token to user DB
  user.lastToken = token;
  user.save(); // 🔐 Save current token as last valid one

  return token;
};

module.exports = { generateToken };
