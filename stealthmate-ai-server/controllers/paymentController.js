const User = require('../models/User');

const saveUserPlan = async (req, res) => {
  const { planName } = req.body;
  const userId = req.userId; // ✅ Must be from authMiddleware

  try {
    const user = await User.findById(userId); // ✅ Must return user

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.plan = {
      name: planName,
      dailyLimit: planName === 'Pro' ? 200 : 100,
      usedToday: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastUsed: null,
    };

    await user.save();
    res.json({ message: 'Plan saved', plan: user.plan });
  } catch (err) {
    console.error('❌ saveUserPlan error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { saveUserPlan };
