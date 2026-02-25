const express = require("express");
const router = express.Router();
const travelerController = require("../controllers/travelerController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/profile", verifyToken, travelerController.getProfile);
router.put("/update-profile", verifyToken, travelerController.updateProfile);

module.exports = router;