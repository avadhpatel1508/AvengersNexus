const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpMail(to, otp) {
  await transporter.sendMail({
    from: `"Avengers Nexus" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your OTP for Signup',
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  });
}

module.exports = { sendOtpMail };
