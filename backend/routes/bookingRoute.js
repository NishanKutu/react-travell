const express = require("express");
const router = express.Router();
const { 
    createBooking, 
    initiateEsewaPayment, 
    verifyEsewaPayment 
} = require("../controllers/bookingController");
const { isLoggedIn } = require("../middleware/authMiddleware");

// Create a pending booking
router.post("/confirm", isLoggedIn, createBooking);

// Initiate eSewa Signature
router.post("/initiate-esewa", isLoggedIn, initiateEsewaPayment);

// Verification route (Called by eSewa after payment)
router.get("/verify-esewa", verifyEsewaPayment);

module.exports = router;