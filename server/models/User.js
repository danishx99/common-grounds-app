const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // firebaseUserId: {
    //   type: String,
    //   unique: true,
    // },
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    // username: {
    //   type: String,
    //   // required: true,
    //   unique: true,
    // },
    password: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Resident", "Staff", "Admin"],
    },
    residentId: {
      type: String,
      required: true,
      unique: true,
    },
    biometricData: {
      type: Object,
    },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String, required: true },
        status: { type: String, enum: ["success", "failed"], required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
