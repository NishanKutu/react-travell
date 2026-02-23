const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true },
    section: {
      type: String,
      required: true,
      enum: ["Before you book", "Before your trip", "During your trip"],
    },
    order: { type: Number, default: 0 }, // To control display sequence
  },
  { timestamps: true }
);

faqSchema.index({ section: 1, category: 1, order: 1 });

module.exports = mongoose.model("Faq", faqSchema);
