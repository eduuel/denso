const adminMiddleware = (req, res, next) => {
  // Ensure authMiddleware has already run and attached req.user
  if (!req.user) {
    return res.status(401).json({ error: "Access denied. User not authenticated." });
  }

  // Check if the user has admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin privileges required." });
  }

  next();
};

module.exports = adminMiddleware;
