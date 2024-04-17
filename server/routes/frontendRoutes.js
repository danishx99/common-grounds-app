const express = require("express");
const router = express.Router();

const path = require("path");


//router.use(express.static("client"));
//login route 
router.get("/login", (req, res) => {
   
    console.log(__dirname)
    res.sendFile(path.join(__dirname, '../../client/login.html'));
    
  });
  
  
  //home route
  router.get("/", (req, res) => {
    res.send("Welcome to the library management system");
  });
  
  //user registration route
  router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/register.html'));
  });



module.exports = router;
