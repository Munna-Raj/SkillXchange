const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// SIGNUP 
exports.signup = async (req, res) => {
  const { fullName, username, email, password, contactNumber } = req.body;

  try {
    // 1. Validate input
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      return res.status(400).json({ msg: "Please enter a valid email address." });
    }

    // 2. Check if user already exists
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Check username exists
    const usernameExists = await User.findOne({ username: username?.trim() });
    if (usernameExists) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    // Validate contact number if provided
    if (contactNumber && !/^(\+977|\+91)\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ msg: "Contact number must be a valid 10-digit number with +977 or +91 prefix" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
   
    const user = new User({
      fullName: fullName?.trim(),
      username: username?.trim(),
      email: email?.toLowerCase().trim(),
      password: hashedPassword,
      contactNumber: contactNumber
    });

    await user.save();
    res.status(201).json({ msg: "Signup successful" });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ msg: "Server error: " + error.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id; // From auth middleware

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ msg: "New passwords do not match" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect old password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// LOGIN 
exports.login = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const token = jwt.sign(
      { user: { id: user._id, role: user.role, email: user.email } },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// FORGOT PASSWORD 
exports.forgotPassword = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const token = Math.random().toString(36).substring(2);

    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    console.log(`Reset Link: http://localhost:5000/reset/${token}`);
    res.json({ msg: "Password reset link sent (check console)" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

//  RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.newPassword;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
