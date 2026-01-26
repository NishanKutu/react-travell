const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // Reference to the User who is booking
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the Trek/Destination being booked
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destinations', // Ensure this matches your model name in destinationModel.js
    required: true
  },
  // Number of people (updated dynamically from your frontend state)
  travelerCount: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  // Total price after discounts (e.g., $601 or $590)
  totalPrice: {
    type: Number,
    required: true
  },
  // Status management for Admin Panel (Pending, Confirmed, Cancelled)
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  // eSewa specific fields for tracking the transaction
  paymentMethod: {
    type: String,
    enum: ['esewa', 'stripe', 'none'],
    default: 'esewa'
  },
  // This will store the transaction_uuid sent to eSewa
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Record of when the booking was made
  bookedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;