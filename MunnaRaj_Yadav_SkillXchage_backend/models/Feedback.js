const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxLength: 500
  }
}, { timestamps: true });

// Unique index
feedbackSchema.index({ reviewer: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
