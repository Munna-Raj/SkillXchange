const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByGroup,
  getAssignmentDetails,
  submitAssignment,
  resubmitAssignment,
  getAssignmentSubmissions,
  reviewSubmission,
} = require("../controllers/assignmentController");

router.use(auth);

// Mentor/Admin assignment management
router.post("/", upload.single("file"), createAssignment);
router.put("/:id", upload.single("file"), updateAssignment);
router.delete("/:id", deleteAssignment);

// Group members view assignments
router.get("/group/:groupId", getAssignmentsByGroup);
router.get("/:assignmentId", getAssignmentDetails);

// Student submission flow
router.post("/:assignmentId/submissions", upload.single("file"), submitAssignment);
router.put("/:assignmentId/submissions/me", upload.single("file"), resubmitAssignment);

// Mentor review flow
router.get("/:assignmentId/submissions", getAssignmentSubmissions);
router.put("/submissions/:submissionId/review", reviewSubmission);

module.exports = router;
