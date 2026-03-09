const CustomTour = require("../models/customTourModel");
const Activity = require("../models/activityModel");

const createCustomTour = async (req, res) => {
  try {
    const { itinerary, travelerCount, guideId, guideCost } = req.body;

    // Validation: Ensure itinerary exists and has at least one day
    if (!itinerary || itinerary.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Itinerary is required" });
    }

    // Extract all activity IDs to calculate price
    const activityIds = [];
    itinerary.forEach((day) => {
      activityIds.push(
        ...(day.morning || []),
        ...(day.afternoon || []),
        ...(day.evening || [])
      );
    });
    // Fetch activity details from DB
    const activities = await Activity.find({ _id: { $in: activityIds } });
    const activityTotal = activities.reduce(
      (sum, act) => sum + (Number(act.cost) || 0),
      0
    );

    // Calculate final total
    const totalDays = itinerary.length;
    const totalGuideFee = (guideCost || 0) * totalDays;
    const finalTotal = (activityTotal * (travelerCount || 1)) + totalGuideFee;

    const newTour = new CustomTour({
      userId: req.user._id,
      itinerary,
      travelerCount,
      guideId,
      guideCost,
      totalPrice: finalTotal,
      status: "pending",
    });

    const savedTour = await newTour.save();
    res.status(201).json({ success: true, data: savedTour });
  } catch (error) {
    console.error("Create Tour Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserCustomTours = async (req, res) => {
  try {
    const tours = await CustomTour.find({ userId: req.user._id })
      .populate("itinerary.destinationCity", "cityname")
      .populate("itinerary.morning itinerary.afternoon itinerary.evening")
      .populate("guideId", "username email image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCustomTours = async (req, res) => {
  try {
    const tours = await CustomTour.find()
      .populate("userId", "username email")
      .populate({
        path: "itinerary.destinationCity",
        select: "cityname",
      })
      .populate("itinerary.morning itinerary.afternoon itinerary.evening")
      .populate("guideId", "username email image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCustomTour = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTour = await CustomTour.findByIdAndDelete(id);
    if (!deletedTour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Tour deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGuideAssignments = async (req, res) => {
  try {
    const assignments = await CustomTour.find({ guideId: req.user._id })
      .populate("userId", "username email image")
      .populate("itinerary.destinationCity", "cityname")
      .populate("itinerary.morning itinerary.afternoon itinerary.evening")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCustomTourStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const tour = await CustomTour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({ success: false, message: "Custom tour not found" });
    }

    tour.status = status;
    await tour.save();

    res.status(200).json({
      success: true,
      message: `Tour marked as ${status}`,
      data: tour,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCustomTour,
  getUserCustomTours,
  getAllCustomTours,
  deleteCustomTour,
  getGuideAssignments,
  updateCustomTourStatus,
};
