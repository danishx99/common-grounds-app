const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const User = require("../models/User");

// Check if the user is a resident
exports.isResident = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .sendFile(
          path.join(__dirname, "../../client/html/error/401notLoggedIn.html")
        );
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    let userCode = verified.userCode;
    let role = verified.role;

    if (role !== "Resident") {
      //return status 403 and send html file
      return res
        .status(403)
        .sendFile(
          path.join(__dirname, "../../client/html/error/403forbidden.html")
        );
    }

    next();
    //res.status(401).json({message: "You are authorized to access this resource, your details are: " + verified.userId + " " + verified.role});
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
