const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure you have dotenv to load environment variables
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const User = require('../models/User');
    const Otp = require('../models/Otp');
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

    const otp = generateOtp();
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: `"Healthcare System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification OTP - Healthcare System',
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP for email verification is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

module.exports = { generateOtp, sendOtp };