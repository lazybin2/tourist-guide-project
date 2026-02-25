const db = require("../config/db");
const { sendEmail } = require("../utils/emailService");

//requestbooking
exports.requestBooking = async (req, res) => {
    const { guide_id, place_id, booking_date, total_days, total_price } = req.body;
    const traveler_id = req.user.userId; 

    try {
        const bookingResult = await db.execute({
            sql: `INSERT INTO bookings (traveler_id, guide_id, place_id, booking_date, total_days, total_price, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            args: [traveler_id, guide_id, place_id, booking_date, total_days, total_price]
        });

        const infoResult = await db.execute({
            sql: `SELECT u.email as guide_email, p.name as place_name, (SELECT name FROM users WHERE id = ?) as traveler_name
                  FROM places p JOIN users u ON p.guide_id = u.id WHERE p.id = ?`,
            args: [traveler_id, place_id]
        });
        
        const data = infoResult.rows[0];
        if (data) {
            const htmlBody = `<h2>New Trip Booking!</h2><p>Destination: ${data.place_name}</p>`;
            await sendEmail(data.guide_email, "New Booking Request", "New request", htmlBody);
            
            await db.execute({
                sql: `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
                args: [guide_id, `New request from ${data.traveler_name} for ${data.place_name}`, 'booking']
            });
        }
        res.status(201).json({ message: "Booking requested!" });
    } catch (err) {
        res.status(500).json({ message: "Booking failed" });
    }
};

//get guide bookings
exports.getGuideBookings = async (req, res) => {
    try {
        const result = await db.execute({
            sql: `SELECT bookings.*, users.name as traveler_name, users.email as traveler_email, places.name as place_name 
                  FROM bookings JOIN users ON bookings.traveler_id = users.id JOIN places ON bookings.place_id = places.id 
                  WHERE bookings.guide_id = ? ORDER BY bookings.id DESC`,
            args: [req.user.userId]
        });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
};

//update booking status
exports.updateBookingStatus = async (req, res) => {
    const { bookingId, status } = req.body; 
    try {
        const check = await db.execute({
            sql: `SELECT traveler_id, (SELECT name FROM places WHERE id = place_id) as p_name FROM bookings WHERE id = ? AND guide_id = ?`,
            args: [bookingId, req.user.userId]
        });
        const booking = check.rows[0];
        if (!booking) return res.status(404).json({ message: "Not found" });

        await db.execute({
            sql: `UPDATE bookings SET status = ? WHERE id = ? AND guide_id = ?`,
            args: [status, bookingId, req.user.userId]
        });

        await db.execute({
            sql: `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
            args: [booking.traveler_id, `Your booking for ${booking.p_name} has been ${status}`, 'booking_update']
        });
        res.json({ message: `Booking ${status}` });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

//get traveler bookings
exports.getTravelerBookings = async (req, res) => {
    try {
        const result = await db.execute({
            sql: `SELECT bookings.*, users.name as guide_name, places.name as place_name 
                  FROM bookings JOIN users ON bookings.guide_id = users.id JOIN places ON bookings.place_id = places.id 
                  WHERE bookings.traveler_id = ? ORDER BY bookings.id DESC`,
            args: [req.user.userId]
        });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
};