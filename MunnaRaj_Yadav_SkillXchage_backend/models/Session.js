const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "SkillExchangeRequest", required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // max 2
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  meetLink: { type: String, required: true },
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
