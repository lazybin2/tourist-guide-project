const db = require("../config/db");
const { sendEmail } = require('../utils/emailService');

//guide verification for email notification
exports.verifyGuide = async (req, res) => {
    const { guideId, status } = req.body; 
    try {
        await db.execute({
            sql: `UPDATE guide_profiles SET is_verified = ? WHERE user_id = ?`,
            args: [status, guideId]
        });

        const userResult = await db.execute({
            sql: `SELECT name, email FROM users WHERE id = ?`,
            args: [guideId]
        });
        
        const user = userResult.rows[0];
        if (user && status === 1) {
            const subject = "Your Guide Profile is Verified!";
            const message = `Hello ${user.name}, you are now a verified guide. You can start accepting bookings!`;
            await sendEmail(user.email, subject, message);
        }
        res.json({ message: "Guide verification status updated!" });
    } catch (err) {
        res.status(500).json({ message: "Database update failed" });
    }
};

//dashboard status
exports.getAdminStats = async (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM users) as totalUsers,
            (SELECT COUNT(*) FROM users WHERE role = 'guide') as totalGuides,
            (SELECT COUNT(*) FROM bookings) as totalBookings
    `;
    try {
        const result = await db.execute(sql);
        const row = result.rows[0];
        res.json({
            totalUsers: row.totalUsers || 0,
            totalGuides: row.totalGuides || 0,
            totalBookings: row.totalBookings || 0
        });
    } catch (err) {
        res.status(500).json({ message: "Database Error" });
    }
};

//all users list for admin panel
exports.getAllUsers = async (req, res) => {
    try {
        const result = await db.execute("SELECT id, name, email, role FROM users ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database Error" });
    }
};

//user delete for admin panel
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    if (userId == req.user.userId) {
        return res.status(400).json({ message: "You cannot delete yourself!" });
    }
    try {
        await db.execute({
            sql: "DELETE FROM users WHERE id = ?",
            args: [userId]
        });
        res.json({ message: "User removed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete operation failed" });
    }
};

//all bookings list for admin panel
exports.getAllBookings = async (req, res) => {
    const sql = `
        SELECT 
            bookings.id, 
            u1.name AS traveler_name, 
            u2.name AS guide_name, 
            places.name AS place_name, 
            bookings.status, 
            bookings.created_at
        FROM bookings
        JOIN users u1 ON bookings.traveler_id = u1.id
        JOIN users u2 ON bookings.guide_id = u2.id
        JOIN places ON bookings.place_id = places.id
        ORDER BY bookings.created_at DESC
    `;
    try {
        const result = await db.execute(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
};

//add place for admin panel
exports.addPlace = async (req, res) => {
    const { name, description, location, image_url, price_per_day, guide_id } = req.body;
    try {
        const result = await db.execute({
            sql: `INSERT INTO places (name, description, location, image_url, price_per_day, guide_id) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [name, description, location, image_url, price_per_day, guide_id]
        });
        res.status(201).json({ message: "Place added successfully", placeId: Number(result.lastInsertRowid) });
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
};

//user status toggle for admin panel
exports.toggleUserStatus = async (req, res) => {
    const { userId, isActive } = req.body;
    try {
        await db.execute({
            sql: `UPDATE users SET is_active = ? WHERE id = ?`,
            args: [isActive, userId]
        });
        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
};

//all guides list for admin panel
exports.getAllGuides = async (req, res) => {
    const sql = `
        SELECT users.id, users.id AS user_id, users.name, users.email, guide_profiles.location, 
               COALESCE(guide_profiles.is_verified, 0) AS is_verified
        FROM users 
        LEFT JOIN guide_profiles ON users.id = guide_profiles.user_id 
        WHERE users.role = 'guide'
    `;
    try {
        const result = await db.execute(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database Error" });
    }
};

//guide verification toggle for admin panel
exports.getDashboardStats = async (req, res) => {
    try {
        const users = await db.execute(`SELECT COUNT(*) as count FROM users`);
        const guides = await db.execute(`SELECT COUNT(*) as count FROM guide_profiles WHERE is_verified = 1`);
        const places = await db.execute(`SELECT COUNT(*) as count FROM places`);
        const bookings = await db.execute(`SELECT COUNT(*) as count FROM bookings`);
        
        res.json({
            totalUsers: users.rows[0].count,
            verifiedGuides: guides.rows[0].count,
            totalPlaces: places.rows[0].count,
            totalBookings: bookings.rows[0].count
        });
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
};

//public notice for admin panel
exports.sendPublicNotice = async (req, res) => {
    const { message } = req.body;
    try {
        await db.execute({
            sql: `INSERT INTO public_notices (message) VALUES (?)`,
            args: [message]
        });
        res.json({ message: "Notice published successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Database Error" });
    }
};

//get public notice for home page
exports.getPublicNotices = async (req, res) => {
    try {
        const result = await db.execute(`SELECT * FROM public_notices ORDER BY id DESC LIMIT 10`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database Error" });
    }
};

//admin profile view for admin panel
exports.getAdminProfile = async (req, res) => {
    const userId = req.user.userId; 
    const sql = `
        SELECT u.name, u.email, ap.phone, ap.position 
        FROM users u
        LEFT JOIN admin_profiles ap ON u.id = ap.user_id 
        WHERE u.id = ?
    `;
    try {
        const result = await db.execute({ sql, args: [userId] });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Database Error" });
    }
};

//admin profile update for admin panel
exports.updateAdminProfile = async (req, res) => {
    const userId = req.user.userId;
    const { phone, position } = req.body;
    const sql = `
        INSERT INTO admin_profiles (user_id, phone, position) 
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
            phone = excluded.phone, 
            position = excluded.position
    `;
    try {
        await db.execute({ sql, args: [userId, phone, position] });
        res.json({ message: "Profile updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};