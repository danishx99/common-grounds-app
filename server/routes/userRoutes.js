const express = require("express");
const userController = require("../controllers/userController");
const admin = require("../middleware/isAdmin");
const staff = require("../middleware/isStaff");
const resident = require("../middleware/isResident");
// const auth = require("../middleware/auth");

const router = express.Router();

// Password change endpoint (can be accessible by admin and the user) (they don't to be authenticated since they are already logged in)
router.put(
  "/change-password",
  /*, (req, res,next) =>auth.verifyToken(req, res,next)*/ (req, res) =>
    userController.changePassword(req, res)
);

// Approve user onboarding (accessible only to Admins)
// router.post(
//   "/:userId",
//   (req, res) => userController.isAdmin(req, res),
//   (req, res) => userController.approveOnboarding(req, res)
// );

// Get users (accessible only to Admins? or staff also?)
router.get(
  "/",
  (req, res) =>
    admin.isAdmin(req, res) /*(req, res) => userController.isAdmin(req, res),*/,
  (req, res) => userController.getUsers(req, res)
);

// Get detailed user information (accessible only to Admins? or staff also?)
router.get("/getCurrentUser", (req, res) =>
  userController.getUserDetails(req, res)
);

// Remove user access (accessible only to Admins)
router.delete(
  "/:userId",
  (req, res) => admin.isAdmin(req, res),
  (req, res) => userController.removeAccess(req, res)
);
// Change user permissions (accessible only to Admins)
router.put(
  "/:userId",
  (req, res) => admin.isAdmin(req, res),
  (req, res) => userController.changePermissions(req, res)
);

module.exports = router;
