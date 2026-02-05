const Notification = require("../models/Notification");

// Get all notifications for the current user
exports.getNotifications = async (req, res) => {
  try {
    // console.log("Fetching notifications for user:", req.user.id);
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20); // Limit to last 20
    // console.log("Found notifications:", notifications.length);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: "Notification not found" });

    // Ensure user owns the notification
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

// Mark all notifications as read
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

// Internal helper to create notification
exports.createNotification = async (userId, type, message, relatedId) => {
  try {
    console.log(`Creating notification for user ${userId}: ${message}`);
    const notification = new Notification({
      userId,
      type,
      message,
      relatedId,
    });
    await notification.save();
    console.log("Notification created successfully");
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
};
