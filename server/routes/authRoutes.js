const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

// User registration endpoint
router.post("/register", (req, res) => authController.registerUser(req, res));

// User login endpoints
router.post("/login", (req, res) =>
  authController.loginUser(req, res)
);
router.post("/login-with-google", (req, res) =>
  authController.loginWithGoogle(req, res)
);

// Password reset endpoint
router.post("/forgot-password", (req, res) =>
  authController.forgetPassword(req, res)
);

router.post(
  "/reset-password",
  
  (req, res) => authController.resetPassword(req, res)
);

module.exports = router;
