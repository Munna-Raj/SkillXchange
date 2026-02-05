const express = require("express");
const router = express.Router();
const { adminLogin, getAllUsers, deleteUser, getDashboardStats } = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// @route   POST /api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post("/login", adminLogin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get("/users", adminAuth, getAllUsers);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete("/users/:id", adminAuth, deleteUser);

// @route   GET /api/admin/dashboard
// @desc    Test protected admin route
// @access  Private (Admin only)
router.get("/dashboard", adminAuth, (req, res) => {
    res.json({ msg: "Welcome to Admin Dashboard" });
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get("/stats", adminAuth, getDashboardStats);

module.exports = router;
