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
    ref: 'Destination', 
    required: true
  },
  // Number of people 
  travelerCount: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },

  // --- ADD-ONS SECTION ---
  hasGuide: {
    type: Boolean,
    default: false
  },
  hasPorter: {
    type: Boolean,
    default: false
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guideCost: {
    type: Number,
    default: 0
  },
  porterCost: {
    type: Number,
    default: 0
  },

  // Total price after discounts and add-ons
  totalPrice: {
    type: Number,
    required: true
  },
  // Status management for Admin Panel 
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
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
  timestamps: true 
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;