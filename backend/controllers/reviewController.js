const Review = require("../models/reviewModel");
const mongoose = require("mongoose");

exports.postReview = async (req, res) => {
  try {
    const { rating, comment, user, destination, guide } = req.body;
    const imagePaths = req.files ? req.files.map((file) => file.filename) : [];

    const review = await Review.create({
      rating,
      comment,
      user,
      destination,
      guide,
      images: imagePaths,
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "destinations",
          localField: "destination",
          foreignField: "_id",
          as: "destinationDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "guide",
          foreignField: "_id",
          as: "guideDetails",
        },
      },
      // Convert arrays to objects
      { $unwind: "$userDetails" },
      { $unwind: "$destinationDetails" },
      { $unwind: { path: "$guideDetails", preserveNullAndEmptyArrays: true } },
      // Project the specific fields the frontend needs
      {
        $project: {
          rating: 1,
          comment: 1,
          images: 1,
          createdAt: 1,
          user: 1,
          destination: 1,
          guide: 1,
          "userDetails.username": 1,
          "userDetails.image": 1,
          "destinationDetails.title": 1,
          "guideDetails.username": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.rating) {
      updateData.rating = Number(updateData.rating);
    }

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.filename);
    }

    const updatedReview = await Review.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, data: updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
