const db = require("../config/db");

// Get profile 
exports.getProfile = async (req, res) => {
    const userId = req.user.userId; 
    const sql = `
        SELECT u.name, u.email, tp.phone, tp.address 
        FROM users u
        LEFT JOIN traveler_profiles tp ON u.id = tp.user_id 
        WHERE u.id = ?
    `;
    try {
        const result = await db.execute({ sql, args: [userId] });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Database Error" });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { phone, address } = req.body;

    const sql = `
        INSERT INTO traveler_profiles (user_id, phone, address) 
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
            phone = excluded.phone, 
            address = excluded.address
    `;
    try {
        await db.execute({
            sql,
            args: [userId, phone, address]
        });
        res.json({ message: "Profile updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};