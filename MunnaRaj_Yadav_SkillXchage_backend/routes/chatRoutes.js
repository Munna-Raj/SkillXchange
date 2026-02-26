const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getChatHistory, markAsRead, uploadFile } = require("../controllers/chatController");
const upload = require("../middleware/upload");

router.use(authMiddleware);

router.get("/history/:requestId", getChatHistory);
router.post("/upload", upload.single("file"), uploadFile);
router.put("/read/:requestId", markAsRead);

module.exports = router;
