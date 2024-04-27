const express = require("express");
const router = express.Router();

const path = require("path");

const admin = require("../middleware/isAdmin");
const staff = require("../middleware/isStaff");
const resident = require("../middleware/isResident");

//router.use(express.static("client"));
//home route
router.get("/", (req, res) => {
  
  res.redirect("/login");

});

//login route 
router.get("/login", (req, res) => {
   
   
    res.sendFile(path.join(__dirname, '../../client/login.html'));
    
});
  


// login with google route
router.get("/login-with-google", (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/loginWithGoogle.html'));
});

//forgot password route
router.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/forgotPassword.html'));
});

//reset password route
router.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/resetPassword.html'));
});

//user registration route
router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/register.html'));
});

//user Facial Registration Login route
router.get("/facialAuth", (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/facialAuth.html'));
});

//user Facial Registration Registration route
router.get("/setUpFacialAuth", (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/setUpFacialAuth.html'));
});


//Generate code page for user registration, admin only access
router.get("/admin/generateCode", (req, res, next) => admin.isAdmin(req,res,next) ,(req, res) => {
  res.sendFile(path.join(__dirname, '../../client/generateCode.html'));
});


module.exports = router;
