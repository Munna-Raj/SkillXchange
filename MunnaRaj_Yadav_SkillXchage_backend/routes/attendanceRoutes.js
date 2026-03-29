const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const { logJoin, logLeave, getSessionAttendance, getUserAttendance } = require("../controllers/attendanceController");

// @route   POST /api/attendance/join
// @desc    Log when a user joins a session
// @access  Private
router.post("/join", auth, logJoin);

// @route   POST /api/attendance/leave
// @desc    Log when a user leaves a session
// @access  Private
router.post("/leave", auth, logLeave);

// @route   GET /api/attendance/session/:sessionId
// @desc    Get detailed attendance for a session (Admin only)
// @access  Private/Admin
router.get("/session/:sessionId", auth, isAdmin, getSessionAttendance);

// @route   GET /api/attendance/:userId
// @desc    Get all attendance dates for a user
// @access  Private
router.get("/:userId", auth, getUserAttendance);

module.exports = router;
