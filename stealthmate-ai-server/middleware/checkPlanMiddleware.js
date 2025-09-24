// middleware/checkPlanMiddleware.js
const User = require('../models/User');

const checkPlanMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Ensure user.plan always exists
    if (!user.plan) {
      user.plan = {
        type: "free",
        dailyLimit: 3,
        usedToday: 0,
        lastUsed: null,
      };
    }

    const today = new Date().toDateString();
    const lastUsed = user.plan.lastUsed?.toDateString();

    // Reset daily usage
    if (today !== lastUsed) {
      user.plan.usedToday = 0;
      user.plan.lastUsed = new Date();
      await user.save();
    }

    // Expiry check
    if (user.plan.expiresAt && new Date() > user.plan.expiresAt) {
      return res.status(403).json({
        error: "⚠️ Your plan has expired. Please upgrade to continue.",
      });
    }

    // Free plan daily limit check
    if (user.plan.usedToday >= user.plan.dailyLimit) {
      return res.status(403).json({
        error: "⚠️ Free plan limit reached. Upgrade to continue.",
      });
    }

    // Increment usage
    user.plan.usedToday += 1;
    user.plan.lastUsed = new Date();
    await user.save();

    next();
  } catch (err) {
    console.error("❌ checkPlanMiddleware error:", err.message);
    res.status(500).json({ error: "Server error in plan validation" });
  }
};

module.exports = checkPlanMiddleware;
