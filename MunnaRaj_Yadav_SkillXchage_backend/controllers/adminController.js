const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const SkillExchangeRequest = require("../models/SkillExchangeRequest");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "my2056875@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123";

// Login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Email
    if (email !== ADMIN_EMAIL) {
      return res.status(400).json({ msg: "Invalid admin credentials" });
    }

    // Password
    if (password !== ADMIN_PASSWORD) {
       return res.status(400).json({ msg: "Invalid admin credentials" });
    }

    // Token
    const payload = {
      user: {
        id: "admin_id_placeholder", // Placeholder
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

// All users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Delete
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check role
    if (user.email === ADMIN_EMAIL || user.role === 'admin') {
         // Guard
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

// Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Users
    const totalUsers = await User.countDocuments();

    // Requests
    const activeRequests = await SkillExchangeRequest.countDocuments({ status: "pending" });

    // Skills
    const skillsAggregation = await User.aggregate([
      { $project: { skillCount: { $size: { $ifNull: ["$skillsToTeach", []] } } } },
      { $group: { _id: null, total: { $sum: "$skillCount" } } }
    ]);
    const totalSkills = skillsAggregation.length > 0 ? skillsAggregation[0].total : 0;

    // Reports
    const pendingReports = 0;

    // Activity
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

// All skills (extracted from User models)
exports.getAllSkills = async (req, res) => {
  try {
    const users = await User.find().select("fullName skillsToTeach skillsToLearn");
    
    let allSkills = [];
    
    users.forEach(user => {
      // Teaching skills
      if (user.skillsToTeach && user.skillsToTeach.length > 0) {
        user.skillsToTeach.forEach(skill => {
          allSkills.push({
            id: skill._id,
            name: skill.name,
            category: skill.category,
            level: skill.level,
            type: 'teach',
            ownerName: user.fullName,
            ownerId: user._id
          });
        });
      }
      
      // Learning skills
      if (user.skillsToLearn && user.skillsToLearn.length > 0) {
        user.skillsToLearn.forEach(skill => {
          allSkills.push({
            id: skill._id,
            name: skill.name,
            category: skill.category,
            level: skill.level,
            type: 'learn',
            ownerName: user.fullName,
            ownerId: user._id
          });
        });
      }
    });

    // Sort by name
    allSkills.sort((a, b) => a.name.localeCompare(b.name));

    res.json(allSkills);
  } catch (err) {
    console.error("GET ALL SKILLS ERROR:", err);
    res.status(500).send("Server Error");
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const { skillId, ownerId, type } = req.params;

    const user = await User.findById(ownerId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (type === 'teach') {
      user.skillsToTeach = user.skillsToTeach.filter(s => s._id.toString() !== skillId);
    } else {
      user.skillsToLearn = user.skillsToLearn.filter(s => s._id.toString() !== skillId);
    }

    await user.save();
    res.json({ msg: "Skill removed successfully" });
  } catch (err) {
    console.error("DELETE SKILL ERROR:", err);
    res.status(500).send("Server Error");
  }
};
