const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number, required: true, default: 0 },
    places: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    description: { type: String },
    category: { type: String },
    preferredTime: {
      type: [String],
      enum: ["Morning", "Afternoon", "Evening", "Any"],
      default: ["Any"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
