const User = require("../models/User");

// Matches
const getMatches = async (req, res) => {
  try {
    // User skills
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const myLearnSkills = (currentUser.skillsToLearn || []).map(s => s.name?.toLowerCase() || "");
    const myTeachSkills = (currentUser.skillsToTeach || []).map(s => s.name?.toLowerCase() || "");

    // Check skills
    if (myLearnSkills.length === 0) {
      return res.status(200).json([]);
    }

    // Other users
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("fullName username profilePic bio skillsToTeach skillsToLearn");

    // Scores
    const matchedUsers = users.map(user => {
      let score = 0;
      let matchingSkills = []; // They teach
      let mutualSkills = [];   // I teach

      // Match teach
      if (user.skillsToTeach && Array.isArray(user.skillsToTeach)) {
        user.skillsToTeach.forEach(skill => {
          if (skill.name && myLearnSkills.includes(skill.name.toLowerCase())) {
            score += 10;
            matchingSkills.push(skill.name);
          }
        });
      }

      // Match learn
      if (user.skillsToLearn && Array.isArray(user.skillsToLearn)) {
        user.skillsToLearn.forEach(skill => {
          if (skill.name && myTeachSkills.includes(skill.name.toLowerCase())) {
            score += 5;
            mutualSkills.push(skill.name);
          }
        });
      }

      return {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        profilePic: user.profilePic,
        bio: user.bio,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        skillsOffered: (user.skillsToTeach || []).map(s => s.name),
        skillsWanted: (user.skillsToLearn || []).map(s => s.name),
        matchScore: score,
        matchingSkills,
        mutualSkills
      };
    });

    // Sort
    const results = matchedUsers
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(results);

  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getMatches };
