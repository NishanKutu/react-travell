const express = require("express");
const router = express.Router();

const { addCity, getAllCities, updateCity, deleteCity } = require("../controllers/cityController");

const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");

router.post("/add", isLoggedIn, isAdmin, addCity);
router.get("/all", getAllCities);
router.put("/update/:id", isLoggedIn, isAdmin, updateCity); 
router.delete("/delete/:id", isLoggedIn, isAdmin, deleteCity); 
module.exports = router;
