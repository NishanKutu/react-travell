const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: Number,
      default: 0,
      // 0-normal user, 1-admin, 2-guide, 3-porter
    },
    image: {
      type: String,
    },
    age: {
      type: Number,
    },
    // Guide and porter specific fields
    experience: {
      type: Number,
    },
    dailyRate: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
    },
    specialization: {
      type: String,
    },
    maxWeight: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Guides and porters can manually mark themselves unavailable
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
