const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================
// 🟢 REGISTER
// ============================
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // 2. Check for duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 3. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 4. Create user
    // First user created becomes admin by default for easy setup
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const user = new User({
      email,
      password: hashed,
      role
    });

    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error during registration", details: err.message });
  }
};

// ============================
// 🔐 LOGIN
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" }); // generic message for security
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4. Fallback role (Migration for legacy users without a role)
    const role = user.role || "user";
    if (!user.role) {
      user.role = role;
      await user.save(); // Migrate in DB silently
    }

    // 5. Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" } // More secure expiration
    );

    res.json({ token, role });
  } catch (err) {
    res.status(500).json({ error: "Server error during login", details: err.message });
  }
};
