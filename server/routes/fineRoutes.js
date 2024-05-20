const express = require("express");
const fineController = require("../controllers/fineController");
const auth = require("../middleware/auth");
const admin = require("../middleware/isAdmin");
const resident = require("../middleware/isResident");

const router = express.Router();

// Fine-related routes
//get all fines
router.get(
  "/getAllFines",
  (req, res, next) => admin.isAdmin(req, res, next),
  (req, res) => fineController.getFines(req, res)
);

router.get(
  "/hasUnreadFines",
  (req, res, next) => resident.isResident(req, res, next),
  (req, res) => fineController.hasUnreadFines(req, res)
);

router.post(
  "/issueFine",
  (req, res, next) => admin.isAdmin(req, res, next),
  (req, res) => fineController.issueFine(req, res)
);

router.post(
  "/updateFineStatus",
  (req, res, next) => admin.isAdmin(req, res, next),
  (req, res) => fineController.updateFineStatus(req, res)
);

//Get fine for specific user
router.get(
  "/getUserFines",
  (req, res, next) => resident.isResident(req, res, next),
  (req, res) => fineController.getUserFines(req, res)
);

module.exports = router;
