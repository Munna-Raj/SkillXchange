const User = require("../models/User");

// @desc    Get matched users based on skills
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
  try {
    // 1. Get current user's skills
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const myLearnSkills = (currentUser.skillsToLearn || []).map(s => s.name?.toLowerCase() || "");
    const myTeachSkills = (currentUser.skillsToTeach || []).map(s => s.name?.toLowerCase() || "");

    if (myLearnSkills.length === 0) {
      return res.status(200).json([]); // No matches if I don't want to learn anything
    }

    // 2. Find all other users
    // In a real production app, we would use a more specific MongoDB query to filter initially
    // But for a student project, fetching users and filtering in JS is easier to understand and debug.
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("fullName username profilePic bio skillsToTeach skillsToLearn");

    // 3. Calculate Match Score
    const matchedUsers = users.map(user => {
      let score = 0;
      let matchingSkills = []; // Skills they teach that I want
      let mutualSkills = [];   // Skills I teach that they want

      // Check for "They Teach -> I Learn" (Primary Match)
      if (user.skillsToTeach && Array.isArray(user.skillsToTeach)) {
        user.skillsToTeach.forEach(skill => {
          if (skill.name && myLearnSkills.includes(skill.name.toLowerCase())) {
            score += 10; // Base score for a match
            matchingSkills.push(skill.name);
          }
        });
      }

      // Check for "I Teach -> They Learn" (Mutual Match Bonus)
      if (user.skillsToLearn && Array.isArray(user.skillsToLearn)) {
        user.skillsToLearn.forEach(skill => {
          if (skill.name && myTeachSkills.includes(skill.name.toLowerCase())) {
            score += 5; // Bonus for mutual exchange potential
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
        matchingSkills, // What they can teach me
        mutualSkills    // What we can swap
      };
    });

    // 4. Sort (Show all users, but highest score first)
    const results = matchedUsers
      .sort((a, b) => b.matchScore - a.matchScore); // Highest score first

    res.status(200).json(results);

  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getMatches };
