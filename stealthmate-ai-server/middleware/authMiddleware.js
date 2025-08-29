// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('lastToken role email name');

    if (!user) return res.status(401).json({ message: 'User not found' });

    // Cross-device logout check
    if (!user.lastToken || user.lastToken !== token) {
      return res.status(401).json({ message: 'Token revoked' });
    }

    // ✅ Attach full user to req
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
