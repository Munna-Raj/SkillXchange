const mongoose = require("mongoose");
const SkillExchangeRequest = require("../models/SkillExchangeRequest");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// Send skill exchange request
exports.sendRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ msg: "Invalid user" });
    }
    const { receiverId, teachSkill, learnSkill } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ msg: "You cannot send a request to yourself" });
    }

    // Check duplicate pending requests
    const existingRequest = await SkillExchangeRequest.findOne({
      senderId,
      receiverId,
      teachSkill,
      learnSkill,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ msg: "Request already sent and pending" });
    }

    const newRequest = new SkillExchangeRequest({
      senderId,
      receiverId,
      teachSkill,
      learnSkill,
    });

    await newRequest.save();

    // Notify receiver
    const sender = await User.findById(senderId);
    await createNotification(
      receiverId,
      "request_received",
      `${sender.fullName} wants to learn ${learnSkill} from you.`,
      newRequest._id
    );

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get sent requests
exports.getSentRequests = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ msg: "Invalid user" });
    }

    const requests = await SkillExchangeRequest.find({ senderId: req.user.id })
      .populate("receiverId", "fullName username profilePic")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get received requests
exports.getReceivedRequests = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ msg: "Invalid user" });
    }

    const requests = await SkillExchangeRequest.find({ receiverId: req.user.id })
      .populate("senderId", "fullName username profilePic")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Accept or Reject request
exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const requestId = req.params.id;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const request = await SkillExchangeRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    // Check auth
    if (request.receiverId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized to respond to this request" });
    }

    request.status = status;
    await request.save();

    // Notify sender
    const receiver = await User.findById(req.user.id);
    await createNotification(
      request.senderId,
      `request_${status}`,
      `${receiver.fullName} ${status} your request to learn ${request.learnSkill}.`,
      request._id
    );

    res.json(request);
    } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
