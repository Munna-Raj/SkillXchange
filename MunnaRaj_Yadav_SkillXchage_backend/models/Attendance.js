const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  joinTime: {
    type: Date,
    default: Date.now,
  },
  leaveTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["joined", "left"],
    default: "joined",
  },
}, { timestamps: true });

AttendanceSchema.index({ sessionId: 1, userId: 1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);
