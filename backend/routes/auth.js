const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); 
const verifyToken = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.put("/change-password", verifyToken, authController.changePassword);

router.get("/profile", verifyToken, authController.getProfile);
router.put("/update-traveler-profile", verifyToken, authController.updateTravelerProfile);

module.exports = router;