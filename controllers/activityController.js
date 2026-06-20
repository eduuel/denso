const ActivityLog = require("../models/ActivityLog");

// Helper function to log activities from other controllers
exports.logActivity = async (userEmail, action, details) => {
  try {
    await ActivityLog.create({
      userEmail,
      action,
      details
    });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};

// Fetch logs (Admin only)
exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100); // Get latest 100 logs
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity logs", details: err.message });
  }
};
