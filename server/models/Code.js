const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema({
  userCode: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    enum: ["Resident", "Staff", "Admin"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Code = mongoose.model("Code", codeSchema);

module.exports = Code;
