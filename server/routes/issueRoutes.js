const express = require('express');
const issueController = require('../controllers/issueController');
const auth = require('../middleware/auth');
const resident = require('../middleware/isResident');
const staff = require('../middleware/isStaff');
const admin = require('../middleware/isAdmin');

const router = express.Router();

//Issue-related routes
router.post('/logIssue', (req, res,next) => resident.isResident(req, res,next), (req, res) => issueController.createIssue(req, res));
//get all issues for a resident
router.get('/getUserIssues', (req, res,next) => resident.isResident(req, res,next), (req, res) => issueController.getUserIssues(req, res));
//get all issues (staff)
router.get('/getAllIssues', (req, res,next) => staff.isStaff(req, res,next), (req, res) => issueController.getAllIssues(req, res));
//update issue status (staff)
router.post('/updateIssueStatus', (req, res,next) => staff.isStaff(req, res,next), (req, res) => issueController.updateIssueStatus(req, res));
// router.get('/', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => issueController.getIssues(req, res));
// router.get('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => issueController.getIssueById(req, res));
// router.put('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => issueController.updateIssue(req, res));
// router.delete('/:id', (req, res,next) =>auth.verifyToken(req, res,next), (req, res) => issueController.deleteIssue(req, res));


module.exports = router;