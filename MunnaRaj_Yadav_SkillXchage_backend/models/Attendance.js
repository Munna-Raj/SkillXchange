const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  // To handle "multiple joins same day = 1", we can use a unique index or just check in logic
  // Storing the actual timestamp of joining
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Index for faster queries on user and date
AttendanceSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);
