const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const User = require('../models/User');

// Check if the user is a staff
exports.isStaff = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({error: "Not logged in"});
    }
    

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    let userCode = verified.userCode;
    let role = verified.role;

    if(role !== "Staff"){
      return res.status(403).json({error: "You are not authorized to access this resource"});
    }

   
    next();
    //res.status(401).json({message: "You are authorized to access this resource, your details are: " + verified.userId + " " + verified.role});
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({error: "Invalid token"});
  }

};
