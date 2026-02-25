const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    
    try {
        const token = authHeader.split(" ")[1]; 
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: verified.userId || verified.id, 
            role: verified.role
        };

        next();
    } catch (err) {
        console.error("❌ Auth Error:", err.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};














// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//     const authHeader = req.header("Authorization");

//     if (!authHeader) {
//         return res.status(401).json({ message: "Access denied. No token provided." });
//     }

//     try {
//         const token = authHeader.split(" ")[1]; 
//         const verified = jwt.verify(token, process.env.JWT_SECRET);

//         // নিশ্চিত করা হচ্ছে যে userId এবং role দুইটাই অবজেক্টে আছে [cite: 2026-02-17]
//         // আপনার টোকেন যদি { id: user.id } এভাবে থাকে, তবে নিচের লাইনটি সব ফিক্স করে দেবে
//         req.user = {
//             userId: verified.id || verified.userId, 
//             role: verified.role
//         };

//         next();
//     } catch (err) {
//         console.error("❌ Auth Error:", err.message);
//         res.status(400).json({ message: "Invalid token" });
//     }
// };



// // const jwt = require("jsonwebtoken");

// // module.exports = (req, res, next) => {
// //   const authHeader = req.header("Authorization");

// //   if (!authHeader) {
// //     return res.status(401).json({ message: "Access denied. No token provided." });
// //   }

// //   try {
// //     const token = authHeader.split(" ")[1]; 
// //     const verified = jwt.verify(token, process.env.JWT_SECRET); // .env থেকে সিক্রেট কী
// //     req.user = verified; // এখানে এখন userId এবং role দুইটাই থাকবে
// //     next();
// //   } catch (err) {
// //     res.status(400).json({ message: "Invalid token" });
// //   }
// // };
