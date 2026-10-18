import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// =========================
// ADD EMPLOYEE
// =========================
router.post("/add-employee", async (req, res) => {
  const { name, email, phone, department, designation } = req.body;

  if (!name || !email || !phone || !department || !designation) {
    return res.status(400).json({ detail: "All fields are required" });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM ev_employees WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(400).json({ detail: "Employee already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO ev_employees (name, email, phone, department, designation) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, department, designation],
    );

    return res.json({
      message: "Employee Added Successfully",
      employee_id: result.insertId,
    });
  } catch (err) {
    console.error("EV ADD EMPLOYEE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// LIST EMPLOYEES
// =========================
router.get("/employees", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ev_employees ORDER BY id DESC");
    return res.json(rows);
  } catch (err) {
    console.error("EV GET EMPLOYEES ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// GET SINGLE EMPLOYEE
// =========================
router.get("/employees/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ev_employees WHERE id = ?", [req.params.id]);

    if (rows.length === 0) {
      return res.json({ message: "Employee Not Found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("EV GET EMPLOYEE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// UPDATE EMPLOYEE
// =========================
router.put("/employees/:id", async (req, res) => {
  const { name, email, phone, department, designation } = req.body;

  try {
    const [existing] = await pool.query("SELECT id FROM ev_employees WHERE id = ?", [req.params.id]);

    if (existing.length === 0) {
      return res.json({ message: "Employee Not Found" });
    }

    await pool.query(
      "UPDATE ev_employees SET name = ?, email = ?, phone = ?, department = ?, designation = ? WHERE id = ?",
      [name, email, phone, department, designation, req.params.id],
    );

    return res.json({ message: "Employee Updated Successfully" });
  } catch (err) {
    console.error("EV UPDATE EMPLOYEE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// DELETE EMPLOYEE
// =========================
router.delete("/employees/:id", async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT id FROM ev_employees WHERE id = ?", [req.params.id]);

    if (existing.length === 0) {
      return res.json({ message: "Employee Not Found" });
    }

    await pool.query("DELETE FROM ev_employees WHERE id = ?", [req.params.id]);

    return res.json({ message: "Employee Deleted Successfully" });
  } catch (err) {
    console.error("EV DELETE EMPLOYEE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
