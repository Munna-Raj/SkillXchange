const express = require("express");
const { searchUsersAndSkills, getUserProfile } = require("../controllers/searchController");

const router = express.Router();

// Search route
router.get("/search", searchUsersAndSkills);

// Public user profile route
router.get("/users/:id", getUserProfile);

module.exports = router;
