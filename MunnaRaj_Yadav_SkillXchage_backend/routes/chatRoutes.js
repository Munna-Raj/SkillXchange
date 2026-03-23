const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getChatHistory, getGroupChatHistory, markAsRead, uploadFile, deleteMessage } = require("../controllers/chatController");
const upload = require("../middleware/upload");

router.use(authMiddleware);

router.get("/history/:requestId", getChatHistory);
router.get("/group/:groupId", getGroupChatHistory);
router.post("/upload", upload.single("file"), uploadFile);
router.put("/read/:requestId", markAsRead);
router.delete("/:id", deleteMessage);

module.exports = router;
