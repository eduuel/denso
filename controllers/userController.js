const User = require("../models/User");

// GET all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE user role
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.isPrimaryAdmin) {
      return res.status(403).json({ error: "Only the Primary Admin can change roles" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isPrimaryAdmin) {
      return res.status(403).json({ error: "Primary admin cannot be modified." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting self
  if (id === req.user.id) {
    return res
      .status(403)
      .json({ error: "Admins cannot delete themselves" });
  }

  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.isPrimaryAdmin) {
      return res.status(403).json({ error: "Only the Primary Admin can delete users" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isPrimaryAdmin) {
      return res.status(403).json({ error: "Primary admin cannot be modified." });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};