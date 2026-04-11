const Workshop = require("../models/Workshop");
const Notification = require("../models/Notification");
const User = require("../models/User");

const canManage = (user) => user?.role === "mentor" || user?.role === "admin";

exports.createWorkshop = async (req, res) => {
  try {
    if (!canManage(req.user)) {
      return res.status(403).json({ msg: "Only mentors/admin can create workshops" });
    }

    const {
      title, description, category, date, startTime, endTime,
      meetingLink, maxParticipants, thumbnail
    } = req.body;

    if (!title || !description || !category || !date || !startTime || !endTime || !meetingLink) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const w = await Workshop.create({
      title, description, category,
      date, startTime, endTime,
      meetingLink,
      maxParticipants: maxParticipants || 100,
      thumbnail: thumbnail || null,
      mentor: req.user.id
    });

    // Optional: notify all users (or followers) about new workshop
    const io = req.app.get("io");
    const note = await Notification.create({
      userId: req.user.id,
      type: "workshop_created",
      message: `New workshop created: ${w.title}`,
      relatedId: w._id
    });
    if (io && io.userSockets) {
      const s = io.userSockets.get(String(req.user.id));
      if (s) io.to(s).emit("notification", note);
    }

    res.status(201).json(w);
  } catch (err) {
    console.error("CREATE WORKSHOP ERROR:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const w = await Workshop.findById(id);
    if (!w) return res.status(404).json({ msg: "Workshop not found" });
    if (String(w.mentor) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not allowed" });
    }

    const allowed = ["title","description","category","date","startTime","endTime","meetingLink","maxParticipants","thumbnail","status"];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) w[k] = req.body[k];
    });
    await w.save();
    res.json(w);
  } catch (err) {
    console.error("UPDATE WORKSHOP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const w = await Workshop.findById(id);
    if (!w) return res.status(404).json({ msg: "Workshop not found" });
    if (String(w.mentor) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not allowed" });
    }
    await Workshop.deleteOne({ _id: id });
    res.json({ msg: "Workshop deleted" });
  } catch (err) {
    console.error("DELETE WORKSHOP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.listWorkshops = async (req, res) => {
  try {
    const { category, mentor, date, status, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (mentor) filter.mentor = mentor;
    if (date) {
      const start = new Date(date); start.setHours(0,0,0,0);
      const end = new Date(date); end.setHours(23,59,59,999);
      filter.date = { $gte: start, $lte: end };
    }
    if (q) filter.title = { $regex: new RegExp(q, "i") };

    let workshops = await Workshop.find(filter)
      .populate("mentor", "fullName username profilePic role")
      .sort({ date: 1, startTime: 1 });

    const now = new Date();
    const enriched = workshops.map((w) => {
      const obj = w.toObject();
      const computed = w.getComputedStatus();
      obj.status = status || computed; // allow explicit filter override
      obj.joinedCount = w.participants?.length || 0;
      obj.available = Math.max(0, (w.maxParticipants || 0) - obj.joinedCount);
      return obj;
    }).filter((w) => !status || w.status === status);

    res.json(enriched);
  } catch (err) {
    console.error("LIST WORKSHOPS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getWorkshop = async (req, res) => {
  try {
    const w = await Workshop.findById(req.params.id)
      .populate("mentor", "fullName username profilePic role")
      .populate("participants", "fullName username profilePic");
    if (!w) return res.status(404).json({ msg: "Workshop not found" });
    const obj = w.toObject();
    obj.status = w.getComputedStatus();
    obj.joinedCount = w.participants?.length || 0;
    obj.available = Math.max(0, (w.maxParticipants || 0) - obj.joinedCount);
    res.json(obj);
  } catch (err) {
    console.error("GET WORKSHOP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.joinWorkshop = async (req, res) => {
  try {
    const w = await Workshop.findById(req.params.id);
    if (!w) return res.status(404).json({ msg: "Workshop not found" });
    const userId = req.user.id;
    if (w.participants.some((p) => String(p) === String(userId))) {
      return res.status(400).json({ msg: "Already joined" });
    }
    if ((w.participants?.length || 0) >= (w.maxParticipants || 0)) {
      return res.status(400).json({ msg: "Workshop is full" });
    }
    w.participants.push(userId);
    await w.save();

    // Notify mentor
    const io = req.app.get("io");
    const note = await Notification.create({
      userId: w.mentor,
      type: "workshop_join",
      message: "A user joined your workshop",
      relatedId: w._id
    });
    if (io && io.userSockets) {
      const s = io.userSockets.get(String(w.mentor));
      if (s) io.to(s).emit("notification", note);
    }

    res.json({ msg: "Joined successfully", workshopId: w._id });
  } catch (err) {
    console.error("JOIN WORKSHOP ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

