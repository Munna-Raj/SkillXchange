const User = require("../models/User");


const searchSkills = async (req, res) => {
  try {
    const { keyword, category, level } = req.query;

    // Query
    let query = {};

    if (keyword) {
      query["skillsToTeach.name"] = { $regex: keyword, $options: "i" };
    }

    if (category) {
      query["skillsToTeach.category"] = category;
    }

    if (level) {
      query["skillsToTeach.level"] = level;
    }

    // Users
    const users = await User.find(query).select("fullName username profilePic skillsToTeach bio");

    // Flatten
    const results = [];

    users.forEach(user => {
      user.skillsToTeach.forEach(skill => {
        let isMatch = true;

        if (keyword) {
          const keywordRegex = new RegExp(keyword, "i");
          if (!keywordRegex.test(skill.name) && !keywordRegex.test(skill.description)) {
            isMatch = false;
          }
        }

        if (category && skill.category !== category) {
          isMatch = false;
        }

        if (level && skill.level !== level) {
          isMatch = false;
        }

        if (isMatch) {
          results.push({
            skillName: skill.name,
            category: skill.category,
            level: skill.level,
            description: skill.description,
            user: {
              _id: user._id,
              fullName: user.fullName,
              username: user.username,
              profilePic: user.profilePic,
              bio: user.bio
            }
          });
        }
      });
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  searchSkills
};
