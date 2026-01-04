const fs = require('fs');
const path = require('path');
const Destination = require("../models/destinationModel");

/**
 * @desc    Create a new destination
 * @route   POST /api/destinations
 * @access  Public / Admin
 */
exports.createDestination = async (req, res) => {
  try {
    // Get the filenames of the uploaded files
    const imagePaths = req.files ? req.files.map(file => file.filename) : [];

    // 2. Wrap JSON.parse in a check to prevent crash if strings are malformed
    const itinerary = req.body.itinerary ? JSON.parse(req.body.itinerary) : [];
    const inclusions = req.body.inclusions ? JSON.parse(req.body.inclusions) : { included: [], notIncluded: [] };

    const newDestination = new Destination({
      ...req.body,
      price: Number(req.body.price),
      discount: Number(req.body.discount || 0),
      groupSize: Number(req.body.groupSize),
      images: imagePaths, // Save the filenames to the DB
      itinerary: itinerary,
      inclusions: inclusions,
    });

    await newDestination.save();
    res.status(201).json({ success: true, data: newDestination });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all destinations
 * @route   GET /api/destinations
 * @access  Public
 */
exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single destination by ID
 * @route   GET /api/destinations/:id
 * @access  Public
 */
exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found"
      });
    }

    res.status(200).json({
      success: true,
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update destination
 * @route   PUT /api/destinations/:id
 * @access  Admin
 */
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get current destination to access existing images
    const currentDoc = await Destination.findById(id);
    if (!currentDoc) return res.status(404).json({ message: "Not found" });

    let updateData = { ...req.body };

    // 2. Safely parse JSON
    if (req.body.itinerary) updateData.itinerary = JSON.parse(req.body.itinerary);
    if (req.body.inclusions) updateData.inclusions = JSON.parse(req.body.inclusions);

    // 3. APPEND new images to existing ones instead of replacing
    if (req.files && req.files.length > 0) {
      const newImageNames = req.files.map(file => file.filename);
      updateData.images = [...currentDoc.images, ...newImageNames];
    }

    // 4. Update the document
    const destination = await Destination.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: destination });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDestinationImage = async (req, res) => {
  try {
      const { id, filename } = req.params;

      // 1. Remove the filename from the MongoDB array
      const destination = await Destination.findByIdAndUpdate(
          id,
          { $pull: { images: filename } }, // $pull removes the specific string from the array
          { new: true }
      );

      // 2. Delete the actual file from the 'public/uploads' folder
      const filePath = path.join(__dirname, '../public/uploads', filename);
      if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
      }

      res.status(200).json({ success: true, data: destination });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete destination
 * @route   DELETE /api/destinations/:id
 * @access  Admin
 */
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found"
      });
    }

    await destination.deleteOne();

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
