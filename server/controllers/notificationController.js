const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

exports.sendNotification = async (req, res) => {
  try {
    const token = req.cookies.token;
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const issuedBy = verified.userCode;

    const { title, description } = req.body;

    const newNotification = new Notification({
      title,
      description,
      issuedBy,
    });

    await newNotification.save();
    res.status(201).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Error sending notification" });
  }
};
