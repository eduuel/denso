const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

// 🧑 USER MODEL (simple)
const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String
}));

// 🟢 REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashed
  });

  await user.save();

  res.json({ message: "User created" });
});

// 🔐 LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ id: user._id }, "secret123");

  res.json({ token });
});

module.exports = router;