const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// ================== GET PROFILE ==================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpire");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================== UPDATE PROFILE ==================
exports.updateProfile = async (req, res) => {
  const { fullName, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ msg: "Email already registered" });
      }
      user.email = email;
    }

    // Update fullName if provided
    if (fullName) {
      user.fullName = fullName;
    }

    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpire");
    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================== UPDATE PROFILE PICTURE ==================
exports.updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete old profile picture if it exists
    if (user.profilePic) {
      const oldPicPath = path.join(__dirname, "..", "uploads", user.profilePic);
      if (fs.existsSync(oldPicPath)) {
        fs.unlinkSync(oldPicPath);
      }
    }

    // Update user with new profile picture filename
    user.profilePic = req.file.filename;
    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpire");
    res.json({ 
      msg: "Profile picture updated successfully", 
      user: updatedUser,
      profilePicUrl: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error("UPDATE PROFILE PICTURE ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
