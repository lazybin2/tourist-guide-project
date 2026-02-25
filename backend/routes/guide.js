const express = require("express");
const router = express.Router();
const guideController = require("../controllers/guideController");
const verifyToken = require("../middleware/authMiddleware"); // নিশ্চিত করুন ফোল্ডার নাম 'middlewares' কি না

router.get("/profile", verifyToken, guideController.getProfile);
router.put("/update-profile", verifyToken, guideController.updateProfile);
router.get("/all", guideController.getAllGuides);

module.exports = router;