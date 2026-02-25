const db = require("../config/db");

// Create place
exports.createPlace = async (req, res) => {
    const { name, description, location, image_url, price_per_day, guide_id } = req.body;
    const final_guide_id = guide_id || req.user.userId || req.user.id; 

    if (!name || !location) {
        return res.status(400).json({ message: "Name and Location are required!" });
    }

    const sql = `INSERT INTO places (name, description, location, image_url, price_per_day, guide_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    try {
        const result = await db.execute({
            sql,
            args: [name, description, location, image_url, price_per_day, final_guide_id]
        });
        res.status(201).json({ 
            message: "Place created successfully and is now public! 🌍", 
            placeId: Number(result.lastInsertRowid) 
        });
    } catch (err) {
        console.error("❌ DB Error during insertion:", err.message); 
        res.status(500).json({ message: "Failed to save place" });
    }
};

// Get all places
exports.getAllPlaces = async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM places ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
};

// Delete place
exports.deletePlace = async (req, res) => {
    const placeId = req.params.id;
    const sql = `DELETE FROM places WHERE id = ?`;
    try {
        await db.execute({ sql, args: [placeId] });
        res.json({ message: "Place deleted successfully" });
    } catch (err) {
        console.error("❌ Delete Error:", err.message); 
        res.status(500).json({ message: "Failed to delete place" });
    }
};

// Search places
exports.searchPlaces = async (req, res) => {
    const query = req.query.q;
    const sql = `SELECT * FROM places WHERE LOWER(name) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?)`;
    const searchTerm = `%${query}%`;
    try {
        const result = await db.execute({
            sql,
            args: [searchTerm, searchTerm]
        });
        res.json(result.rows);
    } catch (err) {
        console.error("❌ SQL Error:", err.message);
        res.status(500).json({ message: "Search failed" });
    }
};

// Get place details
exports.getPlaceDetails = async (req, res) => {
    const { id } = req.params; 
    const sql = `SELECT * FROM places WHERE id = ?`;
    try {
        const result = await db.execute({ sql, args: [id] });
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Place not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ DB Error:", err.message);
        res.status(500).json({ message: "Database error" });
    }
};