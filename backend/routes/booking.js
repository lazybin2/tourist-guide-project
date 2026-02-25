const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/create", verifyToken, bookingController.requestBooking);
router.get("/my-bookings", verifyToken, bookingController.getTravelerBookings);
router.get("/guide-bookings", verifyToken, bookingController.getGuideBookings);
router.put("/update-status", verifyToken, bookingController.updateBookingStatus);

module.exports = router;