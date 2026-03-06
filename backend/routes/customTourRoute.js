const express = require("express");
const router = express.Router();


const {
  createCustomTour,
  getUserCustomTours,
  getAllCustomTours,
  deleteCustomTour,
  getGuideAssignments,
  updateCustomTourStatus,
} = require("../controllers/customTourController");

const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");


router.post("/", isLoggedIn, createCustomTour);
router.get("/my-tours", isLoggedIn, getUserCustomTours);

router.get("/guide-assignments", isLoggedIn, getGuideAssignments);

router.get("/all", isLoggedIn, getAllCustomTours);
router.delete("/:id", isLoggedIn, isAdmin, deleteCustomTour);
router.put("/status/:id", isLoggedIn, updateCustomTourStatus);

module.exports = router;
