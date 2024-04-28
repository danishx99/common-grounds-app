const express = require('express');
const visitorController = require('../controllers/visitorController');
const auth = require("../middleware/auth");
const admin = require("../middleware/isAdmin");
const staff = require("../middleware/isStaff");
const resident = require("../middleware/isResident");

const router = express.Router();

// Visitor-related routes (we can add a check for each role using isAdmin, isStaff, and isResident) depends on logic
router.post('/checkInVisitor', (req,res,next)=> admin.isAdmin(req,res,next) ,(req, res) => visitorController.checkInVisitor(req, res));
router.get('/',  (req, res) => visitorController.getVisitors(req, res));
router.get('/:id', (req, res) => visitorController.getVisitorById(req, res));
router.put('/:id', (req, res) => visitorController.updateVisitor(req, res));
router.put('/:id', (req, res) => visitorController.checkInVisitor(req, res));
router.delete('/:id',  (req, res) => visitorController.deleteVisitor(req, res));

module.exports = router;
