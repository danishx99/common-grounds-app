const express = require("express");
const router = express.Router();

const path = require("path");


//router.use(express.static("client"));
//home route
router.get("/", (req, res) => {
  res.send("Welcome to the library management system");
});

//login route 
router.get("/login", (req, res) => {
   
    console.log(__dirname)
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



module.exports = router;
