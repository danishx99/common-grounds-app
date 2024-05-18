const express = require("express");
const staff = require("../middleware/isStaff");
const admin = require("../middleware/isAdmin");
const adminStaff = require("../middleware/isAdminStaff");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

// Notification-related routes
router.post(
  "/sendNotification",
  (req, res, next) => adminStaff.isAdminStaff(req, res, next),
  (req, res) => notificationController.sendNotification(req, res)
);

module.exports = router;
