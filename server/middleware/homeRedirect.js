const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const User = require('../models/User');

// Check if the user is an admin
exports.homeRedirect = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login");
    }
    

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    let userCode = verified.userCode;
    let role = verified.role;

    if(role == "Admin"){
    return res.redirect("/admin");
    } else if(role == "Staff"){
    return res.redirect("/staff");
    } else if(role == "Resident"){
    return res.redirect("/resident");
    }

   
    
    //res.status(401).json({message: "You are authorized to access this resource, your details are: " + verified.userId + " " + verified.role});
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({error: "Invalid token"});
  }

};
