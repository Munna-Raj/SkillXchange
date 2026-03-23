const Session = require("../models/Session");
const SkillExchangeRequest = require("../models/SkillExchangeRequest");
const Group = require("../models/Group");

const buildSchedule = (startDate, timeSlot, daysCount = 7) => {
  const base = new Date(startDate);
  const out = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({ date: d, timeSlot, status: "upcoming" });
  }
  return out;
};

exports.createSession = async (req, res) => {
  try {
    const { requestId, groupId, isGroupSession, startDate, timeSlot, meetLink } = req.body;
    const userId = req.user.id || req.user._id;

    if (!startDate || !timeSlot || !meetLink) {
      return res.status(400).json({ msg: "Start date, time slot, and meet link are required" });
    }

    if (!String(meetLink).startsWith("https://meet.google.com/")) {
      return res.status(400).json({ msg: "Valid Google Meet link is required" });
    }

    const schedule = buildSchedule(startDate, timeSlot, 7);
    let participants = [];
    let sessionData = {
      createdBy: userId,
      meetLink,
      startDate,
      timeSlot,
      daysCount: 7,
      schedule,
      status: "active"
    };

    if (isGroupSession) {
      // GROUP SESSION LOGIC
      if (!groupId) return res.status(400).json({ msg: "groupId is required for group sessions" });

      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ msg: "Group not found" });

      // Only the mentor can create sessions in the group
      if (group.mentor.toString() !== userId.toString()) {
        return res.status(403).json({ msg: "Only the mentor can create group sessions" });
      }

      participants = group.members;
      sessionData.groupId = groupId;
      sessionData.isGroupSession = true;
      sessionData.users = participants;
    } else {
      // 1-ON-1 SESSION LOGIC
      if (!requestId) return res.status(400).json({ msg: "requestId is required for 1-on-1 sessions" });

      const reqDoc = await SkillExchangeRequest.findById(requestId);
      if (!reqDoc || reqDoc.status !== "accepted") {
        return res.status(400).json({ msg: "Invalid or not accepted request" });
      }

      participants = [reqDoc.senderId.toString(), reqDoc.receiverId.toString()];
      if (!participants.includes(userId.toString())) {
        return res.status(403).json({ msg: "Only matched users can create a session" });
      }

      const existingActive = await Session.findOne({ requestId, status: "active" });
      if (existingActive) {
        return res.status(400).json({ msg: "An active session cycle already exists for this match." });
      }

      sessionData.requestId = requestId;
      sessionData.users = participants;
      sessionData.isGroupSession = false;
    }

    const session = await Session.create(sessionData);
    res.status(201).json(session);
  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getSessionsByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!requestId || requestId === "undefined") {
      return res.status(400).json({ msg: "Valid requestId is required" });
    }
    const sessions = await Session.find({ requestId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error("GET SESSIONS BY REQUEST ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getSessionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id || req.user._id;

    if (!groupId || groupId === "undefined") {
      return res.status(400).json({ msg: "Valid groupId is required" });
    }

    // Verify membership
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });
    
    // Use toString() to compare ObjectIds with strings safely
    const isMember = group.members.some(m => m.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ msg: "Only group members can view group sessions" });
    }

    const sessions = await Session.find({ groupId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error("GET SESSIONS BY GROUP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateSessionSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, timeSlot, meetLink } = req.body;
    const userId = req.user.id || req.user._id;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    // For group sessions, only creator (mentor) can update
    // For 1-on-1, either participant can update
    const isParticipant = session.users.map(String).includes(String(userId));
    if (!isParticipant) return res.status(403).json({ msg: "Access denied" });

    if (session.isGroupSession && session.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ msg: "Only the creator can update group sessions" });
    }

    if (startDate) session.startDate = startDate;
    if (timeSlot) session.timeSlot = timeSlot;
    if (meetLink) {
      if (!String(meetLink).startsWith("https://meet.google.com/")) {
        return res.status(400).json({ msg: "Invalid Google Meet link" });
      }
      session.meetLink = meetLink;
    }
    
    if (startDate || timeSlot) {
      session.schedule = buildSchedule(session.startDate, session.timeSlot, session.daysCount || 7);
    }
    
    session.updatedAt = new Date();
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getUpcomingForUser = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sessions = await Session.find({ users: userId, status: "active" })
      .populate({
        path: "requestId",
        select: "teachSkill learnSkill senderId receiverId",
        populate: [
          { path: "senderId", select: "fullName profilePic username" },
          { path: "receiverId", select: "fullName profilePic username" }
        ]
      })
      .populate("groupId", "name groupPic description")
      .populate("users", "fullName profilePic username")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    const processed = sessions.map((s) => {
      const sessionObj = s.toObject();
      sessionObj.upcoming = sessionObj.schedule.filter((item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= todayStart && item.status === "upcoming";
      });
      return sessionObj;
    });

    res.json(processed);
  } catch (err) {
    console.error("GET UPCOMING SESSIONS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
