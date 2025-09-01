const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils'); // add your JWT utils

const callbackURL =
  process.env.NODE_ENV === 'production'
    ? 'https://stealthmate-ai.onrender.com/api/auth/google/callback'
    : 'http://localhost:10000/api/auth/google/callback';

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
      prompt: 'select_account', // always show chooser
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email,
            picture: profile.photos?.[0]?.value || '',
            isVerified: true,
            authProvider: 'google',
            role: email === 'poojakumavat232@gmail.com' ? 'admin' : 'user',
            plan: { name: 'Free', dailyLimit: 3, usedToday: 0, expiresAt: null },
          });
          await user.save();
        } else if (email === 'poojakumavat232@gmail.com' && user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
        }

        // Generate JWT token
        const token = await generateToken(user._id);
        user.lastToken = token;
        await user.save();

        // Attach token to user object for callback route
        return done(null, { user, token });
      } catch (err) {
        console.error('❌ Google Strategy Error:', err.message);
        return done(err, null);
      }
    }
  )
);

// These are still required, even if you don't use sessions
passport.serializeUser((data, done) => done(null, data.user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
