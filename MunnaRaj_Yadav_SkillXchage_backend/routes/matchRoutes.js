const express = require("express");
const { getMatches } = require("../controllers/matchController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All match routes require authentication
router.use(authMiddleware);

router.get("/", getMatches);

module.exports = router;
