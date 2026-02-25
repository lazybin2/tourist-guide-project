const db = require("./db");

const initDatabase = async () => {
  try {
    console.log("⏳ Creating tables in Turso Cloud...");

    //Users Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'traveler',
        is_active INTEGER DEFAULT 1,
        reset_token TEXT,
        reset_token_expiry DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    //Guide Profile Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS guide_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        bio TEXT,
        location TEXT,
        price_per_day REAL,
        languages TEXT,
        phone TEXT,
        is_verified INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    //Traveler Profile Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS traveler_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        phone TEXT,
        address TEXT,
        profile_pic TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    //Places Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        image_url TEXT,
        price_per_day REAL,
        guide_id INTEGER, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guide_id) REFERENCES users (id)
      )
    `);

    //Bookings Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        traveler_id INTEGER,
        guide_id INTEGER, 
        place_id INTEGER,
        booking_date TEXT, 
        total_days INTEGER, 
        total_price REAL, 
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (traveler_id) REFERENCES users (id),
        FOREIGN KEY (guide_id) REFERENCES users (id),
        FOREIGN KEY (place_id) REFERENCES places (id)
      )
    `);

    //Admin Profile Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        phone TEXT,
        position TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    //Notifications Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    //Public Notices Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS public_notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ All Tables Created Successfully in Turso!");
  } catch (err) {
    console.error("❌ Database Initialization Error:", err.message);
  }
};

initDatabase();




// const db = require("./db");

// db.serialize(() => {
  
//   //users table
// db.run(`
//   CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     email TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL,
//     role TEXT DEFAULT 'traveler',
//     is_active INTEGER DEFAULT 1,
//     reset_token TEXT,             -- পাসওয়ার্ড রিসেট টোকেন কলাম ✅
//     reset_token_expiry DATETIME,   -- টোকেন মেয়াদের কলাম ✅
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//   )
// `, (err) => {
//   if (err) console.error("❌ Users Table Error:", err.message);
//   else console.log("✅ Users Table Ready with Reset Columns");
// });

//   //guide profile table
//   db.run(`
//   CREATE TABLE IF NOT EXISTS guide_profiles (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     user_id INTEGER UNIQUE,
//     bio TEXT,
//     location TEXT,
//     price_per_day REAL,
//     languages TEXT,
//     phone TEXT,
//     is_verified INTEGER DEFAULT 0, -- নতুন যোগ করা হয়েছে
//     FOREIGN KEY (user_id) REFERENCES users (id)
//   )
// `);

// //traveler profile table
// db.run(`
//   CREATE TABLE IF NOT EXISTS traveler_profiles (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     user_id INTEGER UNIQUE,
//     phone TEXT,
//     address TEXT,
//     profile_pic TEXT,
//     FOREIGN KEY (user_id) REFERENCES users (id)
//   )
// `);

// // places table
// db.run(`
//   CREATE TABLE IF NOT EXISTS places (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     description TEXT,
//     location TEXT,
//     image_url TEXT,
//     price_per_day REAL,
//     guide_id INTEGER, 
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (guide_id) REFERENCES users (id) -- ফরেন কি আপডেট করা হয়েছে
//   )
// `);

// // bookings table
// db.run(`
//   CREATE TABLE IF NOT EXISTS bookings (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     traveler_id INTEGER,
//     guide_id INTEGER,         
//     place_id INTEGER,
//     booking_date TEXT,        
//     total_days INTEGER,       
//     total_price REAL,         
//     status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (traveler_id) REFERENCES users (id),
//     FOREIGN KEY (guide_id) REFERENCES users (id),
//     FOREIGN KEY (place_id) REFERENCES places (id)
//   )
// `);

// // admin profile table
// db.run(`
//   CREATE TABLE IF NOT EXISTS admin_profiles (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     user_id INTEGER UNIQUE,
//     phone TEXT,
//     position TEXT, -- যেমন: 'Super Admin' বা 'Manager'
//     FOREIGN KEY (user_id) REFERENCES users (id)
//   )
// `);

// //notifications table
// db.run(`
//   CREATE TABLE IF NOT EXISTS notifications (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     user_id INTEGER NOT NULL,          
//     message TEXT NOT NULL,             
//     type TEXT NOT NULL,                
//     status TEXT DEFAULT 'unread',      
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
//   )
// `);

// //public notices
// db.run(`
//   CREATE TABLE IF NOT EXISTS public_notices (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     message TEXT NOT NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//   )
// `);
//   console.log("✅ Public Notices Table Created");
//   console.log("✅ Reviews Table Created");
//   console.log("✅ Admin Profile Table Created");
//   console.log("✅ Traveler Profile Table Created");
//   console.log("✅ Booking Table Created");
//   console.log("✅ Places Table Created");
//   console.log("✅ Database Tables Updated");
// });

