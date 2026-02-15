const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// SIGNUP 
exports.signup = async (req, res) => {
  const fullName = req.body.fullName?.trim();
  const username = req.body.username?.trim();
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  try {
    // Check email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Check username exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
   
    const user = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ msg: "Signup successful" });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// VERIFY EMAIL 
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ 
      email, 
      verificationCode: code,
      verificationCodeExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save();

    res.json({ msg: "Email verified successfully. You can now login." });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// RESEND CODE 
exports.resendCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "Account already verified" });
    }

    // Generate code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    user.verificationCode = verificationCode;
    user.verificationCodeExpire = verificationCodeExpire;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "SkillXchange - New Verification Code",
      message: `Your new verification code is: ${verificationCode}`,
      html: `<h1>SkillXchange</h1><p>Your new verification code is: <strong>${verificationCode}</strong></p>`
    });

    res.json({ msg: "Verification code resent" });
  } catch (error) {
    console.error("RESEND CODE ERROR:", error);
    res.status(500).json({ msg: "Server error: " + error.message });
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
      { user: { id: user._id, role: user.role } },
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
