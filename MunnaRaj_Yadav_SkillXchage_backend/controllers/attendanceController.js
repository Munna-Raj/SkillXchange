const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Session = require("../models/Session");

// Log when a user joins a session
exports.logJoin = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!sessionId) {
      return res.status(400).json({ msg: "Session ID is required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    // Create a new record for this join event
    const newAttendance = await Attendance.create({
      sessionId,
      userId,
      joinTime: new Date(),
      status: "joined",
    });

    res.status(201).json({ msg: "Join event logged successfully", attendance: newAttendance });

  } catch (err) {
    console.error("LOG JOIN ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Log when a user leaves a session
exports.logLeave = async (req, res) => {
  try {
    const { attendanceId } = req.body; // We'll need the specific attendance record ID

    if (!attendanceId) {
      return res.status(400).json({ msg: "Attendance ID is required" });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ msg: "Attendance record not found" });
    }

    // Update the existing record with leave time
    attendance.leaveTime = new Date();
    attendance.status = "left";
    await attendance.save();

    res.json({ msg: "Leave event logged successfully", attendance });

  } catch (err) {
    console.error("LOG LEAVE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get detailed attendance for a specific session (for Admin)
exports.getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const attendance = await Attendance.find({ sessionId })
      .populate("userId", "fullName username profilePic email")
      .sort({ joinTime: -1 });

    res.json(attendance);
  } catch (err) {
    console.error("GET SESSION ATTENDANCE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get a user's attendance dates for the contribution graph
exports.getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }
    
    // Find all attendance records for this user where they joined a session
    const attendanceRecords = await Attendance.find({ 
      userId,
      status: { $in: ["joined", "left"] }
    }).select("joinTime");

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(200).json([]);
    }

    // Extract unique date strings (YYYY-MM-DD)
    const uniqueDates = [
      ...new Set(
        attendanceRecords
          .filter(record => record && record.joinTime)
          .map(record => {
            try {
              return new Date(record.joinTime).toISOString().split('T')[0];
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean)
      )
    ];

    res.json(uniqueDates);
  } catch (err) {
    console.error("GET USER ATTENDANCE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
