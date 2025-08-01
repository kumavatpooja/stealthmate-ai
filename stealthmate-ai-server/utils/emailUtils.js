const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'StealthMate AI – Your One-Time Password (OTP)',
    html: `
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) for logging into StealthMate AI is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for a limited time. Please do not share it with anyone.</p>
      <br>
      <p>Thank you,<br>Team StealthMate AI</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };
