const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Create a new feedback
// @route   POST /api/feedback
// @access  Private
exports.createFeedback = async (req, res) => {
  const { recipientId, rating, comment } = req.body;

  try {
    // 1. Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: "Recipient not found" });
    }

    // 2. Prevent self-review
    if (recipientId === req.user.id) {
      return res.status(400).json({ msg: "You cannot rate yourself" });
    }

    // 3. Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      reviewer: req.user.id,
      recipient: recipientId
    });

    if (existingFeedback) {
      return res.status(400).json({ msg: "You have already reviewed this user" });
    }

    // 4. Create Feedback
    const feedback = new Feedback({
      reviewer: req.user.id,
      recipient: recipientId,
      rating,
      comment
    });

    await feedback.save();

    // 5. Create Notification
    const notification = new Notification({
      userId: recipientId,
      type: "feedback_received",
      message: `You received a ${rating}-star review from ${req.user.fullName || "a user"}`,
      relatedId: feedback._id // Storing feedback ID
    });
    await notification.save();

    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get feedback for a user
// @route   GET /api/feedback/:userId
// @access  Public
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
