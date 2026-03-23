const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isMentor } = require("../middleware/roleMiddleware");
const {
  createGroup,
  addMember,
  removeMember,
  getMyGroups,
  getGroupDetails
} = require("../controllers/groupController");
const { getSessionsByGroup } = require("../controllers/sessionController");

// All routes are protected by authMiddleware
router.use(authMiddleware);

// Get all groups for current user (Mentor or Member)
router.get("/", getMyGroups);

// Create a new group (Mentor only)
router.post("/", isMentor, createGroup);

// Get group details
router.get("/:groupId", getGroupDetails);

// Add member to group (Mentor only)
router.post("/:groupId/members", isMentor, addMember);

// Remove member from group (Mentor only)
router.delete("/:groupId/members/:userId", isMentor, removeMember);

// Get sessions for a specific group
router.get("/:groupId/sessions", getSessionsByGroup);

module.exports = router;
