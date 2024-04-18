const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Verify the transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email transporter:", error);
  } else {
    console.log("Email transporter connected successfully");
  }
});

module.exports = transporter;
