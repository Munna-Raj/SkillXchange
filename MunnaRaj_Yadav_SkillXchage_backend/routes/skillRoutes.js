const express = require("express");
const { searchSkills } = require("../controllers/skillController");

const router = express.Router();

// Public route - no auth middleware required for searching (as per instructions)
router.get("/search", searchSkills);

module.exports = router;
