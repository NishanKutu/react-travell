const express = require("express");
const router = express.Router();
const upload = require('../utils/multer');
const { isAdmin } = require("../middleware/authMiddleware");

const {
    createDestination,
    getAllDestinations,
    getDestinationById,
    updateDestination,
    deleteDestination,
    deleteDestinationImage
} = require("../controllers/destinationController");


router.post('/createdestination', isAdmin, upload.array('images'), createDestination);
router.get('/getalldestination', getAllDestinations);
router.get('/getdestination/:id', getDestinationById);

router.put('/updatedestination/:id', isAdmin, upload.array("images"), updateDestination);

router.delete('/deletedestination/:id', isAdmin, deleteDestination);
router.delete('/deleteimage/:id/:filename', isAdmin, deleteDestinationImage);

module.exports = router;