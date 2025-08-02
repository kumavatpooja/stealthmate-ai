const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const callbackURL =
  process.env.NODE_ENV === 'production'
    ? 'https://stealthmate-ai.onrender.com/api/auth/google/callback'
    : 'http://localhost:10000/api/auth/google/callback';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL, // ✅ Now absolute and matches Google Console
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
          plan: {
            name: 'Free',
            dailyLimit: 3,
            usedToday: 0,
            expiresAt: null,
          },
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// For express-session-based login (optional)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
  