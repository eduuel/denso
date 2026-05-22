const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // 🚨 No token provided
  if (!authHeader) {
    return res.status(401).json({ error: "No token, access denied" });
  }

  try {
    // 🔥 Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token format invalid" });
    }

    // 🔐 Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // 📦 Attach user info to request
    req.user = verified; 
    // req.user now contains: { id, email, role, iat, exp }

    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;