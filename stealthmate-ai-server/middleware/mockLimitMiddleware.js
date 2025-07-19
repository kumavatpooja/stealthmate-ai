const User = require('../models/User');

const checkMockLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const today = new Date().toDateString();
    const lastUsed = user.mockLastUsed ? new Date(user.mockLastUsed).toDateString() : null;

    if (lastUsed !== today) {
      // Reset count
      user.mockCountToday = 0;
      user.mockLastUsed = new Date();
    }

    if (user.mockCountToday >= 10) {
      return res.status(403).json({ message: "Daily mock interview limit reached (10)." });
    }

    user.mockCountToday += 1;
    await user.save();

    next();
  } catch (err) {
    res.status(500).json({ message: "Mock limit check failed", error: err.message });
  }
};

module.exports = checkMockLimit;
