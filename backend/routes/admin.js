const express = require("express");
const User = require("../models/User");
const ExcelFile = require("../models/ExcelFile");
const auth = require("../middleware/auth");

const router = express.Router();

// Admin middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (Admin only)
router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all files (Admin only)
router.get("/files", auth, requireAdmin, async (req, res) => {
  try {
    const files = await ExcelFile.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user status (Admin only)
router.put("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user (Admin only)
router.delete("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Delete user's files first
    await ExcelFile.deleteMany({ userId: user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete file (Admin only)
router.delete("/files/:id", auth, requireAdmin, async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    
    await ExcelFile.findByIdAndDelete(req.params.id);
    
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get system statistics (Admin only)
router.get("/stats", auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await ExcelFile.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: { $ne: false } });
    const adminUsers = await User.countDocuments({ isAdmin: true });
    
    const recentFiles = await ExcelFile.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      totalUsers,
      totalFiles,
      activeUsers,
      adminUsers,
      recentFiles
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
