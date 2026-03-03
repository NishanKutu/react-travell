const router = require("express").Router();
const {
  createFaq,
  getAllFaqs,
  updateFaq,
  deleteFaq,
} = require("../controllers/faqController");

const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");

// PUBLIC: To show on your main website FAQ page
router.get("/getallfaqs", getAllFaqs);

// PROTECTED: Only Admin (role 1) can perform these
router.post("/createfaq", isLoggedIn, isAdmin, createFaq);
router.put("/updatefaq/:id", isLoggedIn, isAdmin, updateFaq);
router.delete("/deletefaq/:id", isLoggedIn, isAdmin, deleteFaq);

module.exports = router;
