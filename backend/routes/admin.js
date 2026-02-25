const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyToken = require("../middleware/authMiddleware"); 
const adminMiddleware = require('../middleware/adminMiddleware');


router.get("/public-notices", adminController.getPublicNotices);
router.use(verifyToken, adminMiddleware);
router.get("/all-users", adminController.getAllUsers);
router.delete("/delete-user/:id", adminController.deleteUser);
router.get("/guides", adminController.getAllGuides); 
router.post("/verify-guide", adminController.verifyGuide);
router.put("/toggle-user-status", adminController.toggleUserStatus);
router.post("/add-place", adminController.addPlace);
router.get("/all-bookings", adminController.getAllBookings);
router.get("/stats", adminController.getDashboardStats);
router.post("/send-notice", adminController.sendPublicNotice);
router.get("/profile", verifyToken, adminController.getAdminProfile);
router.put("/profile/update", verifyToken, adminController.updateAdminProfile);

module.exports = router;