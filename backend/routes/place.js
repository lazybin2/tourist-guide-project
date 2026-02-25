const express = require("express");
const router = express.Router();
const placeController = require("../controllers/placeController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/add", verifyToken, placeController.createPlace);
router.get("/all", placeController.getAllPlaces);
router.delete("/delete/:id", verifyToken, placeController.deletePlace);
router.get("/search", placeController.searchPlaces);
router.get("/details/:id", placeController.getPlaceDetails);

module.exports = router;