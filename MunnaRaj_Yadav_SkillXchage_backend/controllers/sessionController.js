const Session = require("../models/Session");
const SkillExchangeRequest = require("../models/SkillExchangeRequest");

const makeMeetLink = () => {
  const rand = Math.random().toString(36).substring(2, 6) + "-" +
               Math.random().toString(36).substring(2, 6) + "-" +
               Math.random().toString(36).substring(2, 6);
  return `https://meet.google.com/${rand}`;
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
    const { requestId, startDate, timeSlot } = req.body;
    const userId = req.user.id || req.user._id;

    const reqDoc = await SkillExchangeRequest.findById(requestId).populate(["senderId", "receiverId"]);
    if (!reqDoc || reqDoc.status !== "accepted") {
      return res.status(400).json({ msg: "Invalid or not accepted request" });
    }
    const participants = [reqDoc.senderId._id, reqDoc.receiverId._id].map(String);
    if (!participants.includes(String(userId))) {
      return res.status(403).json({ msg: "Only matched users can create a session" });
    }

    const meetLink = makeMeetLink();
    const schedule = buildSchedule(startDate, timeSlot, 7);

    const session = await Session.create({
      requestId,
      users: [reqDoc.senderId._id, reqDoc.receiverId._id],
      createdBy: userId,
      meetLink,
      startDate,
      timeSlot,
      daysCount: 7,
      schedule,
    });
    res.json(session);
  } catch (err) {
    console.error(err);
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
    const { startDate, timeSlot } = req.body;
    const userId = req.user.id || req.user._id;
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ msg: "Session not found" });
    const canEdit = session.users.map(String).includes(String(userId));
    if (!canEdit) return res.status(403).json({ msg: "Only participants can update the session" });

    session.startDate = startDate;
    session.timeSlot = timeSlot;
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
    const sessions = await Session.find({ users: userId, status: "active" });
    const upcoming = sessions.map((s) => ({
      ...s.toObject(),
      upcoming: s.schedule.filter((item) => new Date(item.date) >= now && item.status === "upcoming"),
    }));
    res.json(upcoming);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
