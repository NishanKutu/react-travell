const express = require("express");
const router = express.Router();
const {
  createBooking,
  adminCreateBooking,
  initiateEsewaPayment,
  verifyEsewaPayment,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  cancelAndRefund,
  initiateStripePayment,
  verifyStripePayment,
  getAvailableStaff, 
} = require("../controllers/bookingController");
const { isLoggedIn } = require("../middleware/authMiddleware");

// Create a pending booking
router.post("/confirm", isLoggedIn, createBooking);

router.post("/admin-confirm", isLoggedIn, adminCreateBooking);

// Get available guides/porters for a specific date
router.get("/available-staff", getAvailableStaff);

// Get all bookings
router.get("/all", isLoggedIn, getAllBookings);

// Delete a booking
router.delete("/:id", isLoggedIn, deleteBooking);

router.put("/status/:id", isLoggedIn, updateBookingStatus);

// Initiate eSewa Signature
router.post("/initiate-esewa", isLoggedIn, initiateEsewaPayment);

// Verification route (Called by eSewa after payment)
router.get("/verify-esewa", verifyEsewaPayment);

// Initiate Stripe Payment
router.post("/initiate-stripe", isLoggedIn, initiateStripePayment);

router.get("/verify-stripe", verifyStripePayment);

router.put("/refund/:id", isLoggedIn, cancelAndRefund);

module.exports = router;
