const mongoose = require("mongoose");

const customTourSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    itinerary: [
      {
        dayNumber: { type: Number, required: true },
        destinationCity: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "City",
          required: true,
        },
        bookingDate: { type: Date, required: true },
        morning: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
        afternoon: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
        evening: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: "pending",
    },
    travelerCount: { type: Number, default: 1, min: 1 },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guideCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomTour", customTourSchema);
