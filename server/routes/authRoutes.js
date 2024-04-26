const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

// User registration endpoint
router.post("/register", (req, res) => authController.registerUser(req, res));

// User login endpoints
router.post("/login", (req, res) => authController.loginUser(req, res));

router.post("/login-with-google", (req, res) =>
  authController.loginWithGoogle(req, res)
);

router.post("/register-with-google", (req, res) => {
  authController.registerWithGoogle(req, res);
});

// Password reset endpoint
router.post("/forgot-password", (req, res) =>
  authController.forgetPassword(req, res)
);

router.post("/reset-password", (req, res) =>
  authController.resetPassword(req, res)
);

// register face endpoint
router.post("/register-face", (req, res) =>
  authController.registerFace(req, res)
);
// verify face endpoint
router.post("/verify-face", (req, res) =>
  authController.verifyFace(req, res)
);

module.exports = router;
