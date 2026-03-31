const Message = require("../models/Message");
const path = require("path");
const fs = require("fs");

// Chat history
// Individual chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!requestId || requestId === "undefined") {
      return res.status(400).json({ msg: "Valid requestId is required" });
    }
    const messages = await Message.find({ requestId })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName profilePic");
    
    res.json(messages);
  } catch (err) {
    console.error("GET CHAT HISTORY ERROR:", err.message);
    res.status(500).send("Server Error");
  }
};

// Group chat history
exports.getGroupChatHistory = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId || groupId === "undefined") {
      return res.status(400).json({ msg: "Valid groupId is required" });
    }
    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName profilePic");
    
    res.json(messages);
  } catch (err) {
    console.error("GET GROUP CHAT HISTORY ERROR:", err.message);
    res.status(500).send("Server Error");
  }
};

// Upload file to chat
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const { requestId, receiverId } = req.body;
    const fileUrl = req.file.filename;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype.startsWith("image/") ? "image" : "document";

    const newMessage = new Message({
      requestId,
      senderId: req.user.id,
      receiverId,
      fileUrl,
      fileName,
      fileType,
      text: req.body.text || ""
    });

    await newMessage.save();

    // Populate sender for frontend
    const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");

    res.json(populatedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const { requestId } = req.params;
    await Message.updateMany(
      { requestId, receiverId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ msg: "Messages marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Delete message (sender only)
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ msg: "Message not found" });
    if (String(msg.senderId) !== String(userId)) {
      return res.status(403).json({ msg: "Not allowed to delete this message" });
    }
    if (msg.fileUrl) {
      const filename = msg.fileUrl.split('/').pop();
      const filePath = path.join(process.cwd(), "uploads", filename);
      fs.promises.unlink(filePath).catch(() => {});
    }
    await Message.deleteOne({ _id: id });
    res.json({ ok: true, requestId: msg.requestId, messageId: id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
