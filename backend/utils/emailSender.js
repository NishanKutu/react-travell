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

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP Connection Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

// Wrap in an async IIFE so we can use await.
const emailSender = async (mailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: mailOptions.from || '"HikeHub" <no-reply@hikehub.com>', // Add a default sender
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
    });

    console.log("Message sent: %s", info.messageId);
    return info; 
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // throw the error so your controller knows it failed
  }
}

module.exports = emailSender;