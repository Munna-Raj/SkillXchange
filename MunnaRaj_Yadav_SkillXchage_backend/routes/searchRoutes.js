const express = require("express");
const { searchUsersAndSkills, getUserProfile, getFeaturedUsers } = require("../controllers/searchController");

const router = express.Router();

router.get("/search", searchUsersAndSkills);
router.get("/users/:id", getUserProfile);
router.get("/featured-users", getFeaturedUsers);

module.exports = router;
