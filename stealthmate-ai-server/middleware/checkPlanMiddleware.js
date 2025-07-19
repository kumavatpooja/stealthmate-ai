const User = require('../models/User');

const checkPlanMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ error: 'User not found' });

  const today = new Date().toDateString();
  const lastUsed = user.plan.lastUsed?.toDateString();

  // Reset count if new day
  if (today !== lastUsed) {
    user.plan.usedToday = 0;
    user.plan.lastUsed = new Date();
    await user.save();
  }

  // Check expiry
  if (user.plan.expiresAt && new Date() > user.plan.expiresAt) {
    return res.status(403).json({ error: 'Plan expired' });
  }

  // Check limit
  if (user.plan.usedToday >= user.plan.dailyLimit) {
    return res.status(429).json({ error: 'Daily limit reached' });
  }

  // Track usage
  user.plan.usedToday += 1;
  await user.save();

  next();
};

module.exports = checkPlanMiddleware;
