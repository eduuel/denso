const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // 🚨 No token provided
  if (!authHeader) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    // 🔥 Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token format invalid" });
    }

    // 🔐 Verify token
    const verified = jwt.verify(token, "secretkey");

    // 📦 Attach user info to request
    req.user = verified; 
    // req.user now contains:
    // { id, email, role, iat, exp }

    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;