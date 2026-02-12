const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

// Create feedback (Protected)
router.post("/", authMiddleware, feedbackController.createFeedback);

// Get feedback for a user (Public)
router.get("/:userId", feedbackController.getFeedbackForUser);

module.exports = router;
