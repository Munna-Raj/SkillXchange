const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

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
