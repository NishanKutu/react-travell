const express = require("express");
const router = express.Router();
const {
  createActivity,
  getActivitiesByPlaces,
  getAllActivities,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");


router.post("/add", isLoggedIn, isAdmin, createActivity);

router.get("/places/:places", getActivitiesByPlaces);
router.get("/", getAllActivities);
router.put("/:id", isLoggedIn, isAdmin, updateActivity);
router.delete("/:id", isLoggedIn, isAdmin, deleteActivity);

module.exports = router;
