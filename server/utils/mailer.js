const dotenv = require("dotenv");
dotenv.config();

const nodemailer = require("nodemailer");

const transporter = nodemailer
  .createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  })

// check if transporter was created successfully
if (!transporter) {
  throw new Error("Error creating transporter");
}

// Verify the transporter connection
transporter.verify((error, success) => {
  if (error) {
    //console.error("Error connecting to email transporter:", error);
  } else {
    console.log("Email transporter connected successfully");
  }
});

module.exports = transporter;
