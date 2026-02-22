const mongoose = require("mongoose");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// GET PROFILE 
exports.getProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ msg: "Invalid user" });
    }

    const user = await User.findById(req.user.id)
      .select("-password -resetToken -resetTokenExpire")
      .populate("followers", "fullName username profilePic")
      .populate("following", "fullName username profilePic");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Legacy user fix
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

// UPDATE PROFILE 
exports.updateProfile = async (req, res) => {
  const { fullName, email, bio, contactNumber } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Email update check
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ msg: "Email already registered" });
      }
      user.email = email;
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (contactNumber !== undefined) user.contactNumber = contactNumber;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpire");
    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// SKILL MANAGEMENT 

// Add Skill
exports.addSkill = async (req, res) => {
  const { type, name, category, level, description } = req.body;
  
  if (!['teach', 'learn'].includes(type)) {
    return res.status(400).json({ msg: "Invalid skill type" });
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

exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user.id;

    if (targetId === currentUserId) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetId }
    });

    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: currentUserId }
    });

    const follower = await User.findById(currentUserId).select("fullName");

    const { createNotification } = require("./notificationController");
    await createNotification(
      targetId,
      "follow",
      `${follower.fullName} started following you.`,
      currentUserId
    );

    res.json({ msg: "Followed successfully" });
  } catch (error) {
    console.error("FOLLOW USER ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user.id;

    if (targetId === currentUserId) {
      return res.status(400).json({ msg: "You cannot unfollow yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetId }
    });

    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: currentUserId }
    });

    res.json({ msg: "Unfollowed successfully" });
  } catch (error) {
    console.error("UNFOLLOW USER ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE PROFILE PICTURE 
exports.updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete old pic
    if (user.profilePic) {
      const oldPicPath = path.join(__dirname, "..", "uploads", user.profilePic);
      if (fs.existsSync(oldPicPath)) {
        fs.unlinkSync(oldPicPath);
      }
    }

    // Set new pic
    user.profilePic = req.file.filename;
    await user.save();

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
