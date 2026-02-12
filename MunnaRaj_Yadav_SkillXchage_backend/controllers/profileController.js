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

    // Fix for legacy users without createdAt
    let userObj = user.toObject();
    if (!userObj.createdAt) {
      userObj.createdAt = user._id.getTimestamp();
    }

    res.json(userObj);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================== UPDATE PROFILE ==================
exports.updateProfile = async (req, res) => {
  const { fullName, email, bio, contactNumber } = req.body;

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

    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (contactNumber !== undefined) user.contactNumber = contactNumber;

    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpire");
    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================== SKILL MANAGEMENT ==================

// Add Skill
exports.addSkill = async (req, res) => {
  const { type, name, category, level, description } = req.body;
  
  if (!['teach', 'learn'].includes(type)) {
    return res.status(400).json({ msg: "Invalid skill type (must be 'teach' or 'learn')" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const newSkill = { name, category, level, description };
    
    if (type === 'teach') {
      user.skillsToTeach.push(newSkill);
    } else {
      user.skillsToLearn.push(newSkill);
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpire");
    res.json(updatedUser);
  } catch (error) {
    console.error("ADD SKILL ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
  const { type, skillId } = req.params;
  
  if (!['teach', 'learn'].includes(type)) {
    return res.status(400).json({ msg: "Invalid skill type" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (type === 'teach') {
      user.skillsToTeach = user.skillsToTeach.filter(skill => skill._id.toString() !== skillId);
    } else {
      user.skillsToLearn = user.skillsToLearn.filter(skill => skill._id.toString() !== skillId);
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpire");
    res.json(updatedUser);
  } catch (error) {
    console.error("DELETE SKILL ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update Skill
exports.updateSkill = async (req, res) => {
  const { type, skillId } = req.params;
  const { name, category, level, description } = req.body;

  if (!['teach', 'learn'].includes(type)) {
    return res.status(400).json({ msg: "Invalid skill type" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    let skill;
    if (type === 'teach') {
      skill = user.skillsToTeach.id(skillId);
    } else {
      skill = user.skillsToLearn.id(skillId);
    }

    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    if (name) skill.name = name;
    if (category) skill.category = category;
    if (level) skill.level = level;
    if (description) skill.description = description;

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpire");
    res.json(updatedUser);
  } catch (error) {
    console.error("UPDATE SKILL ERROR:", error);
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
