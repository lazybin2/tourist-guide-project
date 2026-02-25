const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { sendEmail } = require("../utils/emailService");


//registration controller
exports.register = async (req, res) => {
  const { name, email, password, role, adminSecret } = req.body;
  const userRole = role || 'traveler';
  const adminRoles = ['admin', 'CEO', 'Manager'];

  if (adminRoles.includes(userRole)) {
    const secretKey = process.env.ADMIN_SECRET_KEY || 'nstu_admin_2026'; 
    if (adminSecret !== secretKey) return res.status(403).json({ message: "Invalid Admin Secret Key!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await db.execute({
        sql: `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        args: [name, email, hashedPassword, userRole]
    });

    const userId = Number(userResult.lastInsertRowid);
    let profileSql = "";
    let profileParams = [];

    if (userRole === 'guide') {
      profileSql = `INSERT INTO guide_profiles (user_id, bio, location, price_per_day, languages, phone, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      profileParams = [userId, 'Available for tours', 'Not set', 0, 'English, Bengali', '', 0];
    } else if (adminRoles.includes(userRole)) {
      profileSql = `INSERT INTO admin_profiles (user_id, phone, position) VALUES (?, ?, ?)`;
      profileParams = [userId, '', userRole];
    } else {
      profileSql = `INSERT INTO traveler_profiles (user_id, phone, address, profile_pic) VALUES (?, ?, ?, ?)`;
      profileParams = [userId, '', '', 'default_pic.png'];
    }

    await db.execute({ sql: profileSql, args: profileParams });
    res.status(201).json({ message: "Registration successful!", userId });
  } catch (err) {
    if (err.message.includes("UNIQUE")) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Registration failed" });
  }
};

//login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.execute({ sql: `SELECT * FROM users WHERE email = ?`, args: [email] });
    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (user.is_active === 0) return res.status(403).json({ message: "Your account is blocked." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
};

//forgot password controller
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await db.execute({ sql: `SELECT id, name FROM users WHERE email = ?`, args: [email] });
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000).toISOString();

    await db.execute({
        sql: `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`,
        args: [resetToken, expiry, user.id]
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5500";
    const resetUrl = `${frontendUrl}/frontend/auth/reset-password.html?token=${resetToken}`;
    
    await sendEmail(email, "Password Reset", `Click here to reset your password: ${resetUrl}`);
    res.json({ message: "Reset link sent to email!" });
  } catch (err) {
    res.status(500).json({ message: "Error in forgot password" });
  }
};

//reset password controller
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const currentTime = new Date().toISOString(); 
  try {
    const result = await db.execute({
        sql: `SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?`,
        args: [token, currentTime]
    });
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "Invalid or expired link" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute({
        sql: `UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
        args: [hashedPassword, user.id]
    });
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
};

//get profile controller
exports.getProfile = async (req, res) => {
  try {
    const result = await db.execute({ sql: `SELECT id, name, email, role, created_at FROM users WHERE id = ?`, args: [req.user.userId] });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
};

//update traveler profile
exports.updateTravelerProfile = async (req, res) => {
  const { phone, address, profile_pic } = req.body;
  try {
    await db.execute({
        sql: `UPDATE traveler_profiles SET phone = ?, address = ?, profile_pic = ? WHERE user_id = ?`,
        args: [phone, address, profile_pic, req.user.userId]
    });
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
};

//change password
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const result = await db.execute({ sql: `SELECT password FROM users WHERE id = ?`, args: [req.user.userId] });
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: "Old password incorrect" });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.execute({ sql: `UPDATE users SET password = ? WHERE id = ?`, args: [hashedNewPassword, req.user.userId] });
        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};