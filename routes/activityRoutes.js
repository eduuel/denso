const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Admin-Only routes
router.get("/activities", auth, admin, activityController.getLogs);

module.exports = router;
