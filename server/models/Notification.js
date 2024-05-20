const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    issuedBy: {
      type: String,
      required: true,
    },
    // array that stores the user id of the users that have viewed the notification
    viewedBy: {
      type: Array,
      default: [],
    },
    dateIssued: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
