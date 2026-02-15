const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Create
exports.createFeedback = async (req, res) => {
  const { recipientId, rating, comment } = req.body;

  try {
    // Recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: "Recipient not found" });
    }

    // Check self
    if (recipientId === req.user.id) {
      return res.status(400).json({ msg: "You cannot rate yourself" });
    }

    // Existing
    const existingFeedback = await Feedback.findOne({
      reviewer: req.user.id,
      recipient: recipientId
    });

    if (existingFeedback) {
      return res.status(400).json({ msg: "You have already reviewed this user" });
    }

    // Save
    const feedback = new Feedback({
      reviewer: req.user.id,
      recipient: recipientId,
      rating,
      comment
    });

    await feedback.save();

    // Notify
    const notification = new Notification({
      userId: recipientId,
      type: "feedback_received",
      message: `You received a ${rating}-star review from ${req.user.fullName || "a user"}`,
      relatedId: feedback._id
    });
    await notification.save();

    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// User feedback
exports.getFeedbackForUser = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ recipient: req.params.userId })
      .populate("reviewer", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.json(feedbackList);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
