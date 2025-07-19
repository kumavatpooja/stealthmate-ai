const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Send OTP
const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'StealthMate AI - One-Time Password (OTP)',
    html: `
      <p>Dear User,</p>
      <p>Your One-Time Password (OTP) for accessing StealthMate AI is:</p>
      <h2 style="color:#2e86de;">${otp}</h2>
      <p>Please use this code to complete your verification process.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <br>
      <p>Best regards,<br><strong>StealthMate AI Team</strong></p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Send Reset Password Link
const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - StealthMate AI',
    html: `
      <p>You requested to reset your password.</p>
      <p><a href="${resetLink}" style="padding:10px 20px; background:#A835f2; color:#fff; border-radius:5px; text-decoration:none;">Click here to reset</a></p>
      <p>This link will expire in 15 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP, sendResetPasswordEmail };
