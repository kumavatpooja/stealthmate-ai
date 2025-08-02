const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cron = require('node-cron');
const morgan = require('morgan');
require('dotenv').config();

// 📦 Models
const User = require('./models/User');

// 🔐 Passport Google Auth Strategy
require('./config/googleAuth');

// 📦 Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const mockRoutes = require('./routes/mockRoutes');
const historyRoutes = require('./routes/historyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const ocrToAiRoutes = require('./routes/ocrToAI');
const liveInterviewRoutes = require('./routes/liveInterviewRoutes');
const supportRoutes = require('./routes/supportRoutes');
const liveInterviewSpeechRoutes = require('./routes/liveInterviewSpeechRoutes');

// ⚙️ App Setup
const app = express();
const PORT = process.env.PORT || 10000;

// 🔧 Logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ✅ Robust CORS Setup
const frontendUrl = process.env.FRONTEND_URL || 'https://stealthmate-ai.netlify.app';
const allowedOrigins = [
  'http://localhost:5173', // local dev
  frontendUrl, // live frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g., curl, mobile apps, or same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed from this origin: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛡️ Session Management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// 🔐 Passport Setup
app.use(passport.initialize());
app.use(passport.session());

// 🛣️ Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/ocr', ocrToAiRoutes);
app.use('/api/live', liveInterviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/live', liveInterviewSpeechRoutes);

// 🩺 Health Check
app.get('/api/test/ping', (req, res) => {
  res.json({ message: '✅ StealthMate AI Server Running' });
});

// 🔁 Cron Job: Reset plan daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const users = await User.find();

    for (const user of users) {
      user.plan.usedToday = 0;
      user.mockCountToday = 0;

      if (user.plan.expiresAt && user.plan.expiresAt < now) {
        user.plan = {
          name: 'Free',
          dailyLimit: 3,
          usedToday: 0,
          expiresAt: null,
          lastUsed: null,
        };
      }

      await user.save();
    }

    console.log('🔁 Daily usage reset completed.');
  } catch (err) {
    console.error('❌ Cron Job Error:', err.message);
  }
});

// 🔗 Connect to MongoDB & Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));
