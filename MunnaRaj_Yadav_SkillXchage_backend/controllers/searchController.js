const User = require("../models/User");

const searchUsersAndSkills = async (req, res) => {
  try {
    // Check both 'query' and 'q' to support different frontend versions/parameters
    let q = req.query.query || req.query.q;
    const { exclude } = req.query;
    
    console.log("----------------------------------------");
    console.log("SEARCH: Request received for query:", q);

    // 1. If query is empty, return 200 OK with empty array
    if (!q || q.trim() === "") {
      console.log("SEARCH: Empty query detected, returning empty results with 200 OK");
      return res.status(200).json([]);
    }

    q = q.trim();
    let dbQuery = {};

    // 2. Handle @ prefix for username searches
    let isUsernameSearch = false;
    if (q.startsWith('@')) {
      q = q.substring(1);
      isUsernameSearch = true;
      console.log("SEARCH: Stripped @ for username search. New q:", q);
    }

    const regexOptions = "i"; // Case-insensitive

    if (isUsernameSearch) {
      dbQuery = {
        $or: [
          { username: { $regex: `^${q}`, $options: regexOptions } },
          { username: { $regex: q, $options: regexOptions } }
        ]
      };
    } else {
      // 3. Robust multi-field search logic
      dbQuery = {
        $or: [
          { fullName: { $regex: q, $options: regexOptions } },
          { username: { $regex: q, $options: regexOptions } },
          { email: { $regex: q, $options: regexOptions } },
          { "skillsToTeach.name": { $regex: q, $options: regexOptions } },
          { "skillsToTeach.category": { $regex: q, $options: regexOptions } },
          { "skillsToLearn.name": { $regex: q, $options: regexOptions } },
          { "skillsToLearn.category": { $regex: q, $options: regexOptions } }
        ]
      };
    }

    if (exclude) {
      const excludeIds = exclude.split(',');
      dbQuery._id = { $nin: excludeIds };
    }

    const users = await User.find(dbQuery)
      .select("fullName username email profilePic skillsToTeach skillsToLearn role bio")
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`SEARCH: Found ${users.length} users. Returning 200 OK.`);
    console.log("----------------------------------------");

    return res.status(200).json(users);
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return res.status(500).json({ error: "Server Error", details: error.message });
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
