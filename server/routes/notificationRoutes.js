const express = require("express");
const staff = require("../middleware/isStaff");
const admin = require("../middleware/isAdmin");
const resident = require("../middleware/isResident");
const adminStaff = require("../middleware/isAdminStaff");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

// Notification-related routes
router.post(
  "/sendNotification",
  (req, res, next) => adminStaff.isAdminStaff(req, res, next),
  (req, res) => notificationController.sendNotification(req, res)
);

// Get all notifications 
router.get(
  "/getNotifications",
  (req, res, next) => resident.isResident(req, res, next),
  (req, res) => notificationController.getNotifications(req, res)
);

//Get unread notifications
router.get(
  "/getUnreadNotifications",
  (req, res, next) => resident.isResident(req, res, next),
  (req, res) => notificationController.getUnreadNotifications(req, res)
);

module.exports = router;
