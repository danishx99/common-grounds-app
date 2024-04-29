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
    userCode: {
      type: String,
      required: true,
      unique: true,
    },

    
    //So after generating a vistor password, its stored here. When we log out a vistor after they leave
    //we remove this password from here or make it null, esentially making it invalid/expired. Generating new password overwrites the one 
    //stored here
    visitorPassword: {
      type: String,
      required: false,
    },

    visitorPasswordCreatedAt: {
      type: Date,
      required: false,
    },

    // add faceId to user schema for Azure Face API
    faceId: {
      type: String, required:false
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
