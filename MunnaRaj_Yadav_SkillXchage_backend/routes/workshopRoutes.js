const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  listWorkshops,
  getWorkshop,
  joinWorkshop
} = require("../controllers/workshopController");

router.use(auth);

router.get("/", listWorkshops);
router.get("/:id", getWorkshop);
router.post("/", createWorkshop);
router.put("/:id", updateWorkshop);
router.delete("/:id", deleteWorkshop);
router.post("/:id/join", joinWorkshop);

module.exports = router;

