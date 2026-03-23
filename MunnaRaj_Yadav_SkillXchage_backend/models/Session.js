const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "SkillExchangeRequest" },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  isGroupSession: { type: Boolean, default: false },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  meetLink: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return typeof v === "string" && v.startsWith("https://meet.google.com/");
      },
      message: "Invalid Google Meet link",
    },
  },
  startDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // HH:mm
  daysCount: { type: Number, default: 7 },
  schedule: [
    {
      date: { type: Date, required: true },
      timeSlot: { type: String, required: true },
      status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
    },
  ],
  status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Session", SessionSchema);
