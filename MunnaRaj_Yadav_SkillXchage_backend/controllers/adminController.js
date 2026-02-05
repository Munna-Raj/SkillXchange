const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const SkillExchangeRequest = require("../models/SkillExchangeRequest");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "my2056875@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123";

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check Email
    if (email !== ADMIN_EMAIL) {
      return res.status(400).json({ msg: "Invalid admin credentials" });
    }

    // 2. Check Password
    if (password !== ADMIN_PASSWORD) {
       return res.status(400).json({ msg: "Invalid admin credentials" });
    }

    // 3. Generate Token
    const payload = {
      user: {
        id: "admin_id_placeholder", // No DB ID
        role: "admin",
        email: ADMIN_EMAIL
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          admin: {
            email: ADMIN_EMAIL,
            role: "admin",
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Prevent deleting the main admin if stored in DB (though currently main admin is hardcoded/env)
    if (user.email === ADMIN_EMAIL || user.role === 'admin') {
         // Optional safeguard: don't allow deleting other admins via API easily
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Users
    const totalUsers = await User.countDocuments();

    // 2. Active Requests (pending)
    const activeRequests = await SkillExchangeRequest.countDocuments({ status: "pending" });

    // 3. Total Skills (Aggregate all skillsToTeach across users)
    const skillsAggregation = await User.aggregate([
      { $project: { skillCount: { $size: { $ifNull: ["$skillsToTeach", []] } } } },
      { $group: { _id: null, total: { $sum: "$skillCount" } } }
    ]);
    const totalSkills = skillsAggregation.length > 0 ? skillsAggregation[0].total : 0;

    // 4. Pending Reports (Placeholder for now as Report model doesn't exist)
    const pendingReports = 0;

    // 5. Recent Activity (Latest 5 users joined)
    const recentUsers = await User.find()
      .select("fullName email createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivity = recentUsers.map(user => ({
      id: user._id,
      message: `New user joined: ${user.fullName} (${user.email})`,
      date: user.createdAt || user._id.getTimestamp()
    }));

    res.json({
      totalUsers,
      activeRequests,
      pendingReports,
      totalSkills,
      recentActivity
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).send("Server Error");
  }
};
