const express = require('express');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const resident = require('../middleware/isResident');
const staff = require('../middleware/isStaff');
const admin = require('../middleware/isAdmin');

const router = express.Router();

// Report-related routes
router.get(
    "/getIssueVisitorFinesReport/:year",
    (req, res, next) => admin.isAdmin(req, res, next),
    (req, res) => reportController.getIssueVisitorFinesReport(req, res)

);

router.get(
    "/getFinesReport/:year/:userCode",
    (req, res, next) => admin.isAdmin(req, res, next),
    (req, res) => reportController.getFinesReport(req, res)
);


module.exports = router;