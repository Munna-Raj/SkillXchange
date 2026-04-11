const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Group = require("../models/Group");

const isAdmin = (user) => user?.role === "admin";
const isMentorOrAdmin = (user) => user?.role === "mentor" || isAdmin(user);

const isGroupMember = (group, userId) =>
  group.members.some((memberId) => String(memberId) === String(userId));

const resolveSubmissionStatus = (dueDate, submittedAt, reviewed) => {
  if (reviewed) return "reviewed";
  return new Date(submittedAt) > new Date(dueDate) ? "late" : "submitted";
};

exports.createAssignment = async (req, res) => {
  try {
    if (!isMentorOrAdmin(req.user)) {
      return res.status(403).json({ msg: "Only mentors/admin can create assignments" });
    }

    const { title, description, instructions, groupId, dueDate } = req.body;
    if (!title || !groupId || !dueDate) {
      return res.status(400).json({ msg: "title, groupId and dueDate are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (!isAdmin(req.user) && String(group.mentor) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Only this group's mentor can create assignments" });
    }

    const assignment = await Assignment.create({
      title,
      description: description || "",
      instructions: instructions || "",
      groupId,
      mentorId: req.user.id,
      dueDate: new Date(dueDate),
      file: req.file ? req.file.filename : null,
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("CREATE ASSIGNMENT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    const group = await Group.findById(assignment.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (!isAdmin(req.user) && String(group.mentor) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Only this group's mentor can update assignments" });
    }

    const allowed = ["title", "description", "instructions", "dueDate"];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) assignment[key] = req.body[key];
    });

    if (req.file) assignment.file = req.file.filename;

    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error("UPDATE ASSIGNMENT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    const group = await Group.findById(assignment.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (!isAdmin(req.user) && String(group.mentor) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Only this group's mentor can delete assignments" });
    }

    await Submission.deleteMany({ assignmentId: assignment._id });
    await Assignment.deleteOne({ _id: assignment._id });
    res.json({ msg: "Assignment deleted successfully" });
  } catch (err) {
    console.error("DELETE ASSIGNMENT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAssignmentsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    const member = isGroupMember(group, userId);
    if (!member && !isAdmin(req.user)) {
      return res.status(403).json({ msg: "Access denied. You are not a member of this group." });
    }

    const assignments = await Assignment.find({ groupId })
      .populate("mentorId", "fullName email")
      .sort({ dueDate: 1, createdAt: -1 });

    const submissions = await Submission.find({
      groupId,
      userId,
      assignmentId: { $in: assignments.map((a) => a._id) },
    }).select("assignmentId status submittedAt marks feedback");

    const submissionMap = new Map(submissions.map((s) => [String(s.assignmentId), s]));

    const payload = assignments.map((assignment) => {
      const submission = submissionMap.get(String(assignment._id));
      const now = new Date();
      const due = new Date(assignment.dueDate);

      let status = "not submitted";
      if (submission) {
        status = submission.status === "reviewed" ? "reviewed" : submission.status;
      } else if (now > due) {
        status = "late";
      }

      return {
        ...assignment.toObject(),
        mySubmission: submission || null,
        myStatus: status,
      };
    });

    res.json(payload);
  } catch (err) {
    console.error("GET ASSIGNMENTS BY GROUP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAssignmentDetails = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId).populate(
      "mentorId",
      "fullName email"
    );
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    const group = await Group.findById(assignment.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    const member = isGroupMember(group, req.user.id);
    if (!member && !isAdmin(req.user)) {
      return res.status(403).json({ msg: "Access denied." });
    }

    const mySubmission = await Submission.findOne({
      assignmentId: assignment._id,
      userId: req.user.id,
    });

    res.json({ ...assignment.toObject(), mySubmission });
  } catch (err) {
    console.error("GET ASSIGNMENT DETAILS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { text } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    const group = await Group.findById(assignment.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (!isGroupMember(group, req.user.id)) {
      return res.status(403).json({ msg: "Only group members can submit assignments" });
    }

    const existing = await Submission.findOne({
      assignmentId,
      userId: req.user.id,
    });
    if (existing) {
      return res.status(400).json({ msg: "Submission exists. Use resubmit endpoint." });
    }

    if (!req.file && !text?.trim()) {
      return res.status(400).json({ msg: "Please provide file or text submission." });
    }

    const submittedAt = new Date();
    const status = resolveSubmissionStatus(assignment.dueDate, submittedAt, false);

    const submission = await Submission.create({
      assignmentId,
      userId: req.user.id,
      groupId: assignment.groupId,
      file: req.file ? req.file.filename : null,
      text: text || "",
      submittedAt,
      status,
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error("SUBMIT ASSIGNMENT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.resubmitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { text } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    const submission = await Submission.findOne({
      assignmentId,
      userId: req.user.id,
    });
    if (!submission) return res.status(404).json({ msg: "No submission found to resubmit" });

    if (!req.file && text === undefined) {
      return res.status(400).json({ msg: "Please provide updated file or text." });
    }

    if (req.file) submission.file = req.file.filename;
    if (text !== undefined) submission.text = text;

    submission.submittedAt = new Date();
    submission.status = resolveSubmissionStatus(assignment.dueDate, submission.submittedAt, false);
    submission.marks = null;
    submission.feedback = "";

    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error("RESUBMIT ASSIGNMENT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    const group = await Group.findById(assignment.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (!isAdmin(req.user) && String(group.mentor) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Only this group's mentor can view submissions" });
    }

    const submissions = await Submission.find({ assignmentId: assignment._id })
      .populate("userId", "fullName email username profilePic")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error("GET ASSIGNMENT SUBMISSIONS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.reviewSubmission = async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ msg: "Submission not found" });

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    const group = await Group.findById(assignment.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (!isAdmin(req.user) && String(group.mentor) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Only this group's mentor can review submissions" });
    }

    if (marks !== undefined) submission.marks = marks;
    if (feedback !== undefined) submission.feedback = feedback;
    submission.status = "reviewed";

    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error("REVIEW SUBMISSION ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
