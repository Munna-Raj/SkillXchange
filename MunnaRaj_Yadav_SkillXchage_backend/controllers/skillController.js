const User = require("../models/User");


const searchSkills = async (req, res) => {
  try {
    const { keyword, category, level } = req.query;

    // Build the query
    let query = {};

    
    
    if (keyword) {
      // Search for keyword in skill name or description
      query["skillsToTeach.name"] = { $regex: keyword, $options: "i" };
    }

    if (category) {
      query["skillsToTeach.category"] = category;
    }

    if (level) {
      query["skillsToTeach.level"] = level;
    }

    // Find users who have matching skills
    // Select specific fields to return (avoid returning password, etc.)
    const users = await User.find(query).select("fullName username profilePic skillsToTeach bio");

    // Process results to flatten them into a list of skills with user info
    // This makes it easier for the frontend to display "Skill Cards"
    const results = [];

    users.forEach(user => {
      user.skillsToTeach.forEach(skill => {
        // Check if this specific skill matches the criteria
       
        
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
