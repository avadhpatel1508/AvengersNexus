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
    from: `"Team AvengerNexus" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your AvengerNexus Signup OTP - ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0c0c0c; color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px;">
        </div>
        <h2 style="text-align: center; color: #ffffff;">Welcome to AvengerNexus!</h2>
        <p style="font-size: 16px; color: #dddddd; text-align: center;">
          Your One-Time Password (OTP) for signup is:
        </p>
        <div style="font-size: 28px; font-weight: bold; color: #ffffff; background-color: #1e1e1e; padding: 10px 20px; border-radius: 8px; text-align: center; margin: 20px auto; width: fit-content;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #aaaaaa; text-align: center;">
          This OTP is valid for one-time use only and will expire shortly. Please do not share it with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
        <p style="text-align: center; color: #888888; font-size: 13px;">
          With great power comes great responsibility.<br/>
          — Team AvengerNexus
        </p>
      </div>
    `,
  });
}

async function sendEmail(to, title, description) {
  await transporter.sendMail({
    from: `"Avengers Nexus" <${process.env.SMTP_USER}>`,
    to,
    subject: `[IMPORTANT] ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0c0c0c; color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px;">
        </div>
        <h2 style="text-align: center; color: #ffffff;">Important Update from Avengers Nexus</h2>
        <h3 style="text-align: center; color: #ffffff;">${title}</h3>
        <p style="font-size: 16px; color: #dddddd; text-align: center;">
          ${description}
        </p>
        <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
        <p style="text-align: center; color: #888888; font-size: 13px;">
          You're receiving this because you're part of the Avengers Nexus community.<br/>
          Stay strong. Stay united. 🛡️
        </p>
      </div>
    `,
  });
}


module.exports = { sendOtpMail,sendEmail };
