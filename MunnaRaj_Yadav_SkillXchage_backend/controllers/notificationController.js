const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// User notifications
exports.getNotifications = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ msg: "Invalid user" });
    }
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Mark read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: "Notification not found" });

    // Owner check
    if (notification.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Mark all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ msg: "All notifications marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Helper
exports.createNotification = async (userId, type, message, relatedId) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      relatedId,
    });
    await notification.save();
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
};
