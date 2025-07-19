const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config();

// 🗄️ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// 📦 Models
const User = require('./models/User');

// 🔐 Auth Config
require('./config/googleAuth');

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

const app = express();

// ✅ Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📂 uploads/ folder created');
}

// ⚙️ Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: 'stealthmate_secret_session',
  resave: false,
  saveUninitialized: false,
}));

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
app.use('/api/live', liveInterviewRoutes);            // /ask route
app.use('/api/live', liveInterviewSpeechRoutes);      // /speech route
app.use('/api/support', supportRoutes);

// 🩺 Health Check
app.get('/api/test/ping', (req, res) => {
  res.json({ message: '✅ StealthMate AI Server Running' });
});

// 🔁 Daily Plan Reset (00:00 every day)
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
          lastUsed: null
        };
      }

      await user.save();
    }

    console.log("🔁 Daily plan & mock usage reset");
  } catch (error) {
    console.error("❌ Cron error:", error.message);
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
