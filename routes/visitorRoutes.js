const express = require('express');
const visitorController = require('../controllers/visitorController');
const auth = require('../middleware/auth');

const router = express.Router();

// Visitor-related routes
router.post('/', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => visitorController.createVisitor(req, res));
router.get('/', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => visitorController.getVisitors(req, res));
router.get('/:id',(req, res,next) =>auth.verifyToken(req, res,next), (req, res) => visitorController.getVisitorById(req, res));
router.put('/:id',(req, res,next) =>auth.verifyToken(req, res,next), (req, res) => visitorController.updateVisitor(req, res));
router.delete('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => visitorController.deleteVisitor(req, res));


module.exports = router;