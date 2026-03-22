const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { markAttendance, getUserAttendance } = require("../controllers/attendanceController");

// @route   POST /api/attendance/join
// @desc    Mark attendance when joining a session
// @access  Private
router.post("/join", auth, markAttendance);

// @route   GET /api/attendance/:userId
// @desc    Get attendance dates for a user
// @access  Private
router.get("/:userId", auth, getUserAttendance);

module.exports = router;
