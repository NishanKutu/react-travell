const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Wrap in an async IIFE so we can use await.
const emailSender = async (mailOptions) => {
  const info = await transporter.sendMail({
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    text: mailOptions.text, // plain‑text body
    html: mailOptions.html, // HTML body
  });

  console.log("Message sent:", info.messageId);
}

module.exports = emailSender