const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController");

router.use(authMiddleware);

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);

module.exports = router;
