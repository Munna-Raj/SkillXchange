const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true }, // "HH:MM"
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meetingLink: { type: String, required: true },
    maxParticipants: { type: Number, default: 100 },
    thumbnail: { type: String, default: null },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
  },
  { timestamps: true }
);

// Helper to compute status dynamically
function computeStatus(doc) {
  try {
    const date = new Date(doc.date);
    const [sh, sm] = String(doc.startTime || "00:00").split(":").map((n) => parseInt(n, 10));
    const [eh, em] = String(doc.endTime || "23:59").split(":").map((n) => parseInt(n, 10));
    const start = new Date(date);
    start.setHours(sh || 0, sm || 0, 0, 0);
    const end = new Date(date);
    end.setHours(eh || 0, em || 0, 0, 0);
    const now = new Date();
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "completed";
  } catch {
    return doc.status || "upcoming";
  }
}

workshopSchema.methods.getComputedStatus = function () {
  return computeStatus(this);
};

// Keep status field roughly in sync on save
workshopSchema.pre("save", function (next) {
  this.status = computeStatus(this);
  next();
});

module.exports = mongoose.model("Workshop", workshopSchema);

