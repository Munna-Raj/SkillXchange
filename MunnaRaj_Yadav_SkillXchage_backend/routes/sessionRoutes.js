const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createSession,
  getSessionsByRequest,
  updateSessionSchedule,
  getUpcomingForUser,
} = require("../controllers/sessionController");

router.post("/", auth, createSession);
router.get("/request/:requestId", auth, getSessionsByRequest);
router.put("/:id", auth, updateSessionSchedule);
router.get("/upcoming/me", auth, getUpcomingForUser);

module.exports = router;
