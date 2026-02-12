const Message = require("../models/Message");

// Get chat history for a specific request
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

// Mark messages as read (optional future feature)
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
