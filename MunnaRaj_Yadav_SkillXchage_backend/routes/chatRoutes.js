const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getChatHistory, markAsRead } = require("../controllers/chatController");

router.use(authMiddleware);

router.get("/history/:requestId", getChatHistory);
router.put("/read/:requestId", markAsRead);

module.exports = router;
