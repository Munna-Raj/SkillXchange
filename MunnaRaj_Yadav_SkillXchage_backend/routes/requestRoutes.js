const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  respondToRequest,
} = require("../controllers/requestController");

// All routes are protected
router.use(authMiddleware);

// Send a request
router.post("/", sendRequest);

// Get sent requests
router.get("/sent", getSentRequests);

// Get received requests
router.get("/received", getReceivedRequests);

// Accept or reject request
router.put("/:id/respond", respondToRequest);

module.exports = router;
