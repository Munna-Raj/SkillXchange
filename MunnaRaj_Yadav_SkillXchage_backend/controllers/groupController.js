const Group = require("../models/Group");
const User = require("../models/User");

// @desc    Create a new group (Mentor only)
// @route   POST /api/groups
exports.createGroup = async (req, res) => {
  const { name, description } = req.body;
  const mentorId = req.user.id;

  try {
    if (!name) {
      return res.status(400).json({ msg: "Group name is required" });
    }

    const newGroup = new Group({
      name,
      description,
      mentor: mentorId,
      members: [mentorId], // Mentor is also a member
    });

    const group = await newGroup.save();
    res.status(201).json(group);
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Add a user to a group (Mentor only)
// @route   POST /api/groups/:groupId/members
exports.addMember = async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;
  const mentorId = req.user.id;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    // Check if the requester is the mentor of the group
    if (group.mentor.toString() !== mentorId) {
      return res.status(403).json({ msg: "Only the group mentor can add members" });
    }

    // Check if the user to add exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ msg: "User to add not found" });
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ msg: "User is already a member of this group" });
    }

    group.members.push(userId);
    await group.save();

    res.json({ msg: "User added to group successfully", members: group.members });
  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Remove a user from a group (Mentor only)
// @route   DELETE /api/groups/:groupId/members/:userId
exports.removeMember = async (req, res) => {
  const { groupId, userId } = req.params;
  const mentorId = req.user.id;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    // Check if the requester is the mentor of the group
    if (group.mentor.toString() !== mentorId) {
      return res.status(403).json({ msg: "Only the group mentor can remove members" });
    }

    // Don't allow mentor to remove themselves via this route
    if (userId === mentorId) {
      return res.status(400).json({ msg: "Mentor cannot be removed from their own group" });
    }

    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();

    res.json({ msg: "User removed from group successfully", members: group.members });
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Get all groups the current user is part of (Mentor or Member)
// @route   GET /api/groups
exports.getMyGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const groups = await Group.find({ members: userId })
      .populate("mentor", "fullName username profilePic")
      .populate("members", "fullName username profilePic")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("GET MY GROUPS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Get group details
// @route   GET /api/groups/:groupId
exports.getGroupDetails = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    if (!groupId || groupId === "undefined") {
      return res.status(400).json({ msg: "Valid groupId is required" });
    }

    const group = await Group.findById(groupId)
      .populate("mentor", "fullName username profilePic role")
      .populate("members", "fullName username profilePic role");

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    // Check if the user is a member of the group
    const isMember = group.members.some(member => member._id.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ msg: "Access denied. You are not a member of this group." });
    }

    res.json(group);
  } catch (error) {
    console.error("GET GROUP DETAILS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
