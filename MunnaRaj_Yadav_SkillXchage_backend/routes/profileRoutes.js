const express = require("express");
const { getProfile, updateProfile, updateProfilePicture } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// All profile routes require authentication
router.use(authMiddleware);

router.get("/", getProfile);
router.put("/", updateProfile);
router.post("/picture", upload.single("profilePic"), updateProfilePicture);

module.exports = router;
