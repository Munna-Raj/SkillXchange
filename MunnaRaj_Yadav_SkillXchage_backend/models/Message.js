const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SkillExchangeRequest",
    required: false,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false,
  },
  isGroupMessage: {
    type: Boolean,
    default: false,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  text: {
    type: String,
    required: false,
  },
  fileUrl: {
    type: String,
    required: false,
  },
  fileName: {
    type: String,
    required: false,
  },
  fileType: {
    type: String,
    enum: ["image", "document", null],
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
