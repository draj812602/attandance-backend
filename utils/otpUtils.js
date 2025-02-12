const nodemailer = require("nodemailer");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Using Brevo instead of Gmail
    port: process.env.SMTP_PORT,
    secure: false, // TLS (recommended)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Attendance Tracker" draj.8126@gmail.com`, // Update with your domain email
    to: email,
    subject: "Your OTP for Attendance Tracker",
    text: `Your OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendEmail };
