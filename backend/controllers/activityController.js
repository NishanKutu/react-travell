const Activity = require("../models/activityModel");

const createActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    // Populate after saving so the response includes the city details
    const populatedActivity = await activity.populate("places");
    res.status(201).json({ success: true, data: populatedActivity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getActivitiesByPlaces = async (req, res) => {
  try {
    const { places } = req.params; // This is now expected to be a City ObjectId

    // Changed: Direct ID match instead of RegExp
    const activities = await Activity.find({ places: places })
      .populate("places") // Shows cityname instead of just ID
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllActivities = async (req, res) => {
  try {
    // Populate ensures we can see cityname in the admin list
    const activities = await Activity.find()
      .populate("places")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Activity
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate("places");

    if (!updatedActivity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }
    res.status(200).json({ success: true, data: updatedActivity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Activity
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedActivity = await Activity.findByIdAndDelete(id);
    
    if (!deletedActivity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }
    res.status(200).json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createActivity,
  getActivitiesByPlaces,
  getAllActivities,
  updateActivity,
  deleteActivity,
  
};
