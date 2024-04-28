const express = require("express");
const userController = require("../controllers/userController");
const admin = require("../middleware/isAdmin");
const staff = require("../middleware/isStaff");
const resident = require("../middleware/isResident");
// const auth = require("../middleware/auth");

const router = express.Router();

// User-related routes

// Get current user information(Currently logged in user)
router.get("/getCurrentUser", (req, res) =>
  userController.getUserDetails(req, res)
);

// Get all users (accessible only to Admins)
router.get("/getAllUsers", (req, res, next)=> admin.isAdmin(req, res, next) ,(req, res) => userController.getAllUsers(req, res));


//Manage users (accessible only to Admins)
router.post("/manageUsers", (req, res, next)=> admin.isAdmin(req, res, next) ,(req, res) => userController.manageUsers(req, res));

module.exports = router;
