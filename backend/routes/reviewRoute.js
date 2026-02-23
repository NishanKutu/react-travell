const router = require("express").Router();
const { 
    postReview, 
    getAllReviews, 
    deleteReview,
    updateReview,
} = require("../controllers/reviewController");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../utils/multer"); // For handling review images

// Post a new review
router.post("/add", isLoggedIn, upload.array('images', 5), postReview);

// Get all reviews
router.get("/all", getAllReviews);

router.put("/update/:id", isLoggedIn, upload.array("images", 5), updateReview);

// 3. Delete a review (Only for Admins)
router.delete("/delete/:id", isLoggedIn, isAdmin, deleteReview);

module.exports = router;