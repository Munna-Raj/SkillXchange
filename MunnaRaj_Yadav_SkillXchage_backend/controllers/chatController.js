const Message = require("../models/Message");
const path = require("path");

// Chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { requestId } = req.params;
    const messages = await Message.find({ requestId })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullName profilePic");
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
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
