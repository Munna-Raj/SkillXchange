const Session = require("../models/Session");
const SkillExchangeRequest = require("../models/SkillExchangeRequest");
const { createMeetEvent } = require("../utils/googleMeet");

const makeMeetLink = () => {
  return "https://meet.google.com/new";
};

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
    const { requestId, startDate, timeSlot, meetLink } = req.body;
    const userId = req.user.id || req.user._id;

    // 1. Verify Request exists and is accepted
    const reqDoc = await SkillExchangeRequest.findById(requestId).populate(["senderId", "receiverId"]);
    if (!reqDoc || reqDoc.status !== "accepted") {
      return res.status(400).json({ msg: "Invalid or not accepted request" });
    }

    // 2. Check if user is a participant
    const participants = [reqDoc.senderId._id.toString(), reqDoc.receiverId._id.toString()];
    if (!participants.includes(userId.toString())) {
      return res.status(403).json({ msg: "Only matched users can create a session" });
    }

    // 3. Prevent Duplicate Active Sessions
    const existingActive = await Session.findOne({ requestId, status: "active" });
    if (existingActive) {
      return res.status(400).json({ msg: "An active 7-day session cycle already exists for this match." });
    }

    // 4. Validate Meet Link
    if (!meetLink || !String(meetLink).startsWith("https://meet.google.com/")) {
      return res.status(400).json({ msg: "Valid Google Meet link is required" });
    }

    // 5. Build 7-day Schedule
    const schedule = buildSchedule(startDate, timeSlot, 7);

    // 6. Create Session
    const session = await Session.create({
      requestId,
      users: [reqDoc.senderId._id, reqDoc.receiverId._id],
      createdBy: userId,
      meetLink,
      startDate,
      timeSlot,
      daysCount: 7,
      schedule,
      status: "active"
    });

    res.status(201).json(session);
  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getSessionsByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const sessions = await Session.find({ requestId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
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
    const canEdit = session.users.map(String).includes(String(userId));
    if (!canEdit) return res.status(403).json({ msg: "Only participants can update the session" });

    if (startDate) session.startDate = startDate;
    if (timeSlot) session.timeSlot = timeSlot;
    if (meetLink) {
      if (!String(meetLink).startsWith("https://meet.google.com/")) {
        return res.status(400).json({ msg: "Invalid Google Meet link" });
      }
      session.meetLink = meetLink;
    }
    session.schedule = buildSchedule(startDate, timeSlot, session.daysCount || 7);
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
    // Reset 'now' to start of day for date comparisons
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sessions = await Session.find({ users: userId, status: "active" })
      .populate("requestId", "teachSkill learnSkill")
      .populate("users", "fullName profilePic")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    const processed = sessions.map((s) => {
      const sessionObj = s.toObject();
      // Filter schedule to show today and future dates
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
