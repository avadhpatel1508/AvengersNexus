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
async function sendEmail(to, title, description) {
  await transporter.sendMail({
    from: `"Avengers Nexus" <${process.env.SMTP_USER}>`,
    to,
    subject: `[IMPORTANT] ${title}`,
    html: `
      <h2 style="color:#00ffff">📢 Important Update from Avengers Nexus</h2>
      <h3>${title}</h3>
      <p>${description}</p>
      <hr/>
      <p style="font-size:12px; color:gray">You are receiving this email because you're a registered user of Avengers Nexus.</p>
    `,
  });
}

module.exports = { sendOtpMail,sendEmail };
