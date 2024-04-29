const express = require('express');
const visitorController = require('../controllers/visitorController');
const auth = require("../middleware/auth");
const admin = require("../middleware/isAdmin");
const staff = require("../middleware/isStaff");
const resident = require("../middleware/isResident");

const router = express.Router();

// Visitor-related routes (we can add a check for each role using isAdmin, isStaff, and isResident) depends on logic
router.post('/checkInVisitor', (req,res,next)=> admin.isAdmin(req,res,next) ,(req, res) => visitorController.checkInVisitor(req, res));
router.get('/getAllVisitors',  (req, res) => visitorController.getAllVisitors(req, res));
router.post('/manageVisitors', (req,res,next)=> admin.isAdmin(req,res,next) ,(req, res) => visitorController.manageVisitors(req, res));



module.exports = router;
