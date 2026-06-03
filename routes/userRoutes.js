const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

// Protect all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET all users
router.get("/", getUsers);

// UPDATE role
router.put("/:id/role", updateUserRole);

// DELETE user
router.delete("/:id", deleteUser);

module.exports = router;