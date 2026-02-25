const db = require("../config/db");

// Get profile
exports.getProfile = async (req, res) => {
    const userId = req.user.userId;
    const sql = `
        SELECT u.name, u.email, gp.bio, gp.location, gp.price_per_day, gp.languages, gp.phone, gp.is_verified 
        FROM users u
        LEFT JOIN guide_profiles gp ON u.id = gp.user_id 
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
    const { bio, location, price_per_day, languages, phone } = req.body;

    const sql = `
        INSERT INTO guide_profiles (user_id, bio, location, price_per_day, languages, phone) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
            bio = excluded.bio, 
            location = excluded.location,
            price_per_day = excluded.price_per_day,
            languages = excluded.languages,
            phone = excluded.phone
    `;
    try {
        await db.execute({
            sql,
            args: [userId, bio, location, price_per_day, languages, phone]
        });
        res.json({ message: "Profile updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};

// Get all guides
exports.getAllGuides = async (req, res) => {
    const sql = `
        SELECT users.id as user_id, users.name, users.email, guide_profiles.location, guide_profiles.is_verified 
        FROM users 
        LEFT JOIN guide_profiles ON users.id = guide_profiles.user_id 
        WHERE users.role = 'guide'
    `;
    try {
        const result = await db.execute(sql);
        res.json(result.rows);
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ message: "Database error" });
    }
};

