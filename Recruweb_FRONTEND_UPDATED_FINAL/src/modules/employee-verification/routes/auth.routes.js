import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { verifyEvToken } from "../middleware/auth.js";

const router = express.Router();

// =========================
// REGISTER
// =========================
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password and role are required" });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM ev_users WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO ev_users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
    );

    return res.json({
      message: "User Registered Successfully",
      user_id: result.insertId,
    });
  } catch (err) {
    console.error("EV REGISTER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM ev_users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const access_token = jwt.sign(
      { sub: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30m" },
    );

    return res.json({
      access_token,
      token_type: "bearer",
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("EV LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// PROFILE (protected)
// =========================
router.get("/profile", verifyEvToken, (req, res) => {
  return res.json({
    message: "Protected route accessed",
    email: req.evUser.sub,
  });
});

// =========================
// ME - logged-in EV user (protected)
// =========================
router.get("/me", verifyEvToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM ev_users WHERE email = ?",
      [req.evUser.sub],
    );

    if (rows.length === 0) {
      return res.status(404).json({ detail: "User not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("EV ME ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
