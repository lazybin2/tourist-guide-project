const db = require("../config/db");

// Create a notification for a user
const createNotification = async (userId, message, type) => {
  const sql = `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`;
  try {
    await db.execute({
      sql: sql,
      args: [userId, message, type]
    });
    console.log(`🔔 Notification Created for User ID: ${userId}`);
  } catch (err) {
    console.error("❌ Notification Error:", err.message);
  }
};

module.exports = createNotification;










// const db = require("../config/db");

// // Create a notification for a user
// const createNotification = (userId, message, type) => {
//   const sql = `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`;
//   db.run(sql, [userId, message, type], (err) => {
//     if (err) console.error("❌ Notification Error:", err.message);
//     else console.log(`🔔 Notification Created for User ID: ${userId}`);
//   });
// };

// module.exports = createNotification;