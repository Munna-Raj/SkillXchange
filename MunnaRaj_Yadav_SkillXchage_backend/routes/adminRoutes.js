const express = require("express");
const router = express.Router();
const { 
    adminLogin, 
    getAllUsers, 
    deleteUser, 
    getDashboardStats,
    getAllSkills,
    deleteSkill,
    getAllRequests,
    deleteRequest,
    getReportsData,
    promoteToMentor
} = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// @route   POST /api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post("/login", adminLogin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get("/users", adminAuth, getAllUsers);

// @route   PUT /api/admin/users/:id/promote
// @desc    Promote a user to mentor
// @access  Private (Admin only)
router.put("/users/:id/promote", adminAuth, promoteToMentor);

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

// @route   GET /api/admin/skills
// @desc    Get all skills
// @access  Private (Admin only)
router.get("/skills", adminAuth, getAllSkills);

// @route   DELETE /api/admin/skills/:skillId/:ownerId/:type
// @desc    Delete a skill
// @access  Private (Admin only)
router.delete("/skills/:skillId/:ownerId/:type", adminAuth, deleteSkill);

// @route   GET /api/admin/requests
// @desc    Get all exchange requests
// @access  Private (Admin only)
router.get("/requests", adminAuth, getAllRequests);

// @route   DELETE /api/admin/requests/:id
// @desc    Delete an exchange request
// @access  Private (Admin only)
router.delete("/requests/:id", adminAuth, deleteRequest);

// @route   GET /api/admin/reports
// @desc    Get reports data
// @access  Private (Admin only)
router.get("/reports", adminAuth, getReportsData);

module.exports = router;
