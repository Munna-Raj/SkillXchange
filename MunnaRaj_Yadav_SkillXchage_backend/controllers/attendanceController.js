const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const User = require("../models/User");

// Mark attendance when joining a session
exports.markAttendance = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!sessionId) {
      return res.status(400).json({ msg: "Session ID is required" });
    }

    // Verify session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    // Current date normalized to midnight
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if already marked for today for this session
    const existing = await Attendance.findOne({
      userId,
      sessionId,
      date: today
    });

    if (existing) {
      return res.json({ msg: "Attendance already marked for today", attendance: existing });
    }

    const newAttendance = await Attendance.create({
      userId,
      sessionId,
      date: today,
      timestamp: now
    });

    // Update User Streak
    const user = await User.findById(userId);
    if (user) {
      const lastDate = user.lastAttendanceDate ? new Date(user.lastAttendanceDate) : null;
      if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate.getTime() === yesterday.getTime()) {
          // Continuous streak
          user.currentStreak += 1;
        } else if (lastDate.getTime() < yesterday.getTime()) {
          // Streak broken
          user.currentStreak = 1;
        }
        // If lastDate is today, currentStreak stays same (handled by existing attendance check above)
      } else {
        // First time attendance
        user.currentStreak = 1;
      }

      // Update highest streak if current is higher
      if (user.currentStreak > user.highestStreak) {
        user.highestStreak = user.currentStreak;
      }

      user.lastAttendanceDate = today;
      await user.save();
    }

    res.status(201).json(newAttendance);
  } catch (err) {
    console.error("MARK ATTENDANCE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get attendance history for a user (for the graph)
exports.getUserAttendance = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id || req.user._id;
    
    // Fetch all unique dates user joined any session
    const attendance = await Attendance.find({ userId })
      .select("date")
      .sort({ date: 1 });

    // Extract unique date strings to avoid duplicates in frontend
    const dates = [...new Set(attendance.map(a => a.date.toISOString().split('T')[0]))];

    res.json(dates);
  } catch (err) {
    console.error("GET ATTENDANCE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
