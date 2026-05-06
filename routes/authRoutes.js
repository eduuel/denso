const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


// ============================
// 🧑 USER MODEL
// ============================
const User = mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" } // 👈 ROLE ADDED
}));


// ============================
// 🟢 REGISTER
// ============================
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check empty input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // check duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      role: "admin" // 👈 first user becomes admin (for now)
    });

    await user.save();

    res.json({ message: "User created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// 🔐 LOGIN
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // JWT TOKEN (with role)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// EXPORT
// ============================
module.exports = router;