const db = require('./config/db'); 
const bcrypt = require('bcrypt');

const createFirstAdmin = async () => {
    try {
        console.log("⏳ Creating Super Admin in Turso...");
        
        const hashedPassword = await bcrypt.hash('admin123', 10); 
        
        const userResult = await db.execute({
            sql: `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
            args: ['Mia Fahad', 'miafahadck@gmail.com', hashedPassword, 'admin']
        });

        const userId = Number(userResult.lastInsertRowid); 
        
        await db.execute({
            sql: `INSERT INTO admin_profiles (user_id, phone, position) VALUES (?, ?, ?)`,
            args: [userId, '01700000000', 'Super Admin']
        });

        console.log('✅ Super Admin and Profile created successfully in Cloud!');
        process.exit(0);
    } catch (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
            console.error("❌ Error: A user with this email already exists. Please use a different email.");
        } else {
            console.error("❌ Error:", err.message);
        }
        process.exit(1);
    }
};

createFirstAdmin();