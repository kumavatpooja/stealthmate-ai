const nodemailer = require("nodemailer");
const axios = require("axios");

// Gmail transporter (App Password required)
const gmailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "StealthMate AI – Your One-Time Password (OTP)",
    html: `
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) for logging into StealthMate AI is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for a limited time. Please do not share it with anyone.</p>
      <br>
      <p>Thank you,<br>Team StealthMate AI</p>
    `,
  };

  try {
    // ✅ Try Gmail first
    await gmailTransporter.sendMail(mailOptions);
    console.log(`📩 OTP sent to ${email} via Gmail`);
  } catch (err) {
    console.error("❌ Gmail send failed, falling back to Resend:", err.message);

    try {
      // ✅ Fallback to Resend API
      await axios.post(
        "https://api.resend.com/emails",
        {
          from: "StealthMate AI <onboarding@resend.dev>", // Resend sandbox sender
          to: [email],
          subject: mailOptions.subject,
          html: mailOptions.html,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`📩 OTP sent to ${email} via Resend`);
    } catch (resendErr) {
      console.error("❌ Resend fallback also failed:", resendErr.message);
      throw new Error("Email sending failed (both Gmail and Resend)");
    }
  }
};

module.exports = { sendOTP };
