const User = require("../models/User");

const searchUsersAndSkills = async (req, res) => {
  try {
    const { q, exclude } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const regex = new RegExp(q, "i");

    let query = {
      $or: [
        { fullName: regex },
        { username: regex },
        { email: regex }, // Also search by email
        { "skillsToTeach.name": regex },
        { "skillsToLearn.name": regex }
      ]
    };

    // Exclude existing members if an array of IDs is provided
    if (exclude) {
      const excludeIds = exclude.split(',');
      query._id = { $nin: excludeIds };
    }

    const users = await User.find(query)
      .select("fullName username email profilePic")
      .limit(10); // Limit results for performance

    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetToken -resetTokenExpire")
      .populate("followers", "fullName username profilePic")
      .populate("following", "fullName username profilePic");

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

const getFeaturedUsers = async (req, res) => {
  try {
    const users = await User.find({ "skillsToTeach.0": { $exists: true } })
      .select("fullName username profilePic bio skillsToTeach skillsToLearn createdAt")
      .sort({ createdAt: -1 })
      .limit(9);

    const featured = users.map((user) => {
      const skillsOffered = (user.skillsToTeach || [])
        .map((s) => s.name)
        .filter(Boolean);
      const skillsWanted = (user.skillsToLearn || [])
        .map((s) => s.name)
        .filter(Boolean);

      const baseScore = 60;
      const scoreFromTeach = skillsOffered.length * 4;
      const scoreFromLearn = skillsWanted.length * 2;
      const matchScore = Math.max(
        70,
        Math.min(98, baseScore + scoreFromTeach + scoreFromLearn)
      );

      return {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        profilePic: user.profilePic,
        bio: user.bio,
        skillsOffered,
        skillsWanted,
        matchScore,
      };
    });

    res.status(200).json(featured);
  } catch (error) {
    console.error("Get featured users error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  searchUsersAndSkills,
  getUserProfile,
  getFeaturedUsers
};
