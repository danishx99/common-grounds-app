const express = require('express');
const fineController = require('../controllers/fineController');
const auth = require('../middleware/auth');

const router = express.Router();

// Fine-related routes
router.post('/', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => fineController.issueFine(req, res));
router.get('/', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => fineController.getFines(req, res));
router.get('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => fineController.getFineById(req, res));
router.put('/:id/pay', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => fineController.payFine(req, res));


module.exports = router;