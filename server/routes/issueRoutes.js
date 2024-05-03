const express = require('express');
const issueController = require('../controllers/issueController');
const auth = require('../middleware/auth');
const resident = require('../middleware/isResident');

const router = express.Router();

//Issue-related routes
router.post('/logIssue', (req, res,next) => resident.isResident(req, res,next), (req, res) => issueController.createIssue(req, res));
router.get('/getAllIssues', (req, res,next) => resident.isResident(req, res,next), (req, res) => issueController.getIssues(req, res));
// router.get('/', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => issueController.getIssues(req, res));
// router.get('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => issueController.getIssueById(req, res));
// router.put('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => issueController.updateIssue(req, res));
// router.delete('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => issueController.deleteIssue(req, res));


module.exports = router;