const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Issued",
      enum: ["Issued", "In Progress", "Completed"],
    },
    reportedBy: {
      type: String,
      required: true,
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

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
