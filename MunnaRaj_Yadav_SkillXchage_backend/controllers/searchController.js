const User = require("../models/User");

// Search
const searchUsersAndSkills = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const regex = new RegExp(query, "i");

    // Query
    const users = await User.find({
      $or: [
        { fullName: regex },
        { username: regex },
        { "skillsToTeach.name": regex },
        { "skillsToLearn.name": regex }
      ]
    }).select("fullName username profilePic skillsToTeach skillsToLearn bio");

    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Public profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetToken -resetTokenExpire");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fix legacy
    let userObj = user.toObject();
    if (!userObj.createdAt) {
      userObj.createdAt = user._id.getTimestamp();
    }

    res.status(200).json(userObj);
  } catch (error) {
    console.error("Get user profile error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  searchUsersAndSkills,
  getUserProfile
};
