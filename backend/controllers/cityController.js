const City = require("../models/cityModel");

const addCity = async (req, res) => {
  try {
    const { cityname } = req.body; 

    if (!cityname) {
      return res
        .status(400)
        .json({ success: false, message: "City name is required" });
    }

    const cityExists = await City.findOne({
      cityname: new RegExp(`^${cityname}$`, "i"), 
    });

    if (cityExists) {
      return res
        .status(400)
        .json({ success: false, message: "City already exists" });
    }

    const newCity = new City({ cityname }); 
    await newCity.save();
    res.status(201).json({ success: true, data: newCity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ cityname: 1 });
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { cityname } = req.body;

    const updatedCity = await City.findByIdAndUpdate(
      id,
      { cityname }, 
      { new: true, runValidators: true }
    );

    if (!updatedCity)
      return res
        .status(404)
        .json({ success: false, message: "City not found" });
    res.status(200).json({ success: true, data: updatedCity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCity = await City.findByIdAndDelete(id);
    if (!deletedCity)
      return res
        .status(404)
        .json({ success: false, message: "City not found" });
    res
      .status(200)
      .json({ success: true, message: "City deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addCity, getAllCities, updateCity, deleteCity };
