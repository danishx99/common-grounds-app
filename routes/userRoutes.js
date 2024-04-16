const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

// Password change endpoint (authenticated)
router.put("/change-password", (req, res,next) =>auth.verifyToken(req, res,next), (req, res) =>
  userController.changePassword(req, res)
);

// Approve user onboarding (accessible only to Admins)
router.post(
  "/approve/:userId",
  (req, res) => userController.isAdmin(req, res),
  (req, res) => userController.approveOnboarding(req, res)
);

// Remove user access (accessible only to Admins)
router.delete(
  "/remove/:userId",
  (req, res) => userController.isAdmin(req, res),
  (req, res) => userController.removeAccess(req, res)
);

// Change user permissions (accessible only to Admins)
router.put(
  "/permissions/:userId",
  (req, res) => userController.isAdmin(req, res),
  (req, res) => userController.changePermissions(req, res)
);

module.exports = router;
