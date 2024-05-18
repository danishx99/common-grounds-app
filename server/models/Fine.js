const mongoose = require("mongoose");

const fineSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    dateIssued: {
      type: Date,
      default: Date.now,
    },

    issuedTo: {
      type: String,
      required: true,
    },
    issuedBy: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Fine = mongoose.model("Fine", fineSchema);

module.exports = Fine;
