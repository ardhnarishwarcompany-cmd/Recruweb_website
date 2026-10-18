import express from "express";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.js";
import { evUpload } from "../middleware/upload.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const router = express.Router();

// =========================
// UPLOAD DOCUMENT
// =========================
router.post("/upload-document", evUpload.single("file"), async (req, res) => {
  const { employee_id, document_name } = req.body;

  if (!employee_id || !document_name || !req.file) {
    return res.status(400).json({ detail: "employee_id, document_name and file are required" });
  }

  const filePath = `uploads/employee-verification/${req.file.filename}`;

  try {
    const [result] = await pool.query(
      "INSERT INTO ev_documents (employee_id, document_name, file_path, status) VALUES (?, ?, ?, 'Pending')",
      [employee_id, document_name, filePath],
    );

    await pool.query("INSERT INTO ev_audit_logs (document_id, action) VALUES (?, ?)", [
      result.insertId,
      "Document Uploaded",
    ]);

    return res.json({
      message: "Document Uploaded Successfully",
      document_id: result.insertId,
    });
  } catch (err) {
    console.error("EV UPLOAD DOCUMENT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// GET DOCUMENTS
// =========================
router.get("/documents", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ev_documents ORDER BY id DESC");
    return res.json(rows);
  } catch (err) {
    console.error("EV GET DOCUMENTS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// VERIFY / REJECT DOCUMENT DIRECTLY
// =========================
router.get("/verify-document/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  if (!["Verified", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "status must be Verified or Rejected" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM ev_documents WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Document Not Found" });
    }

    await pool.query("UPDATE ev_documents SET status = ? WHERE id = ?", [status, id]);
    await pool.query("INSERT INTO ev_audit_logs (document_id, action) VALUES (?, ?)", [id, status]);

    return res.json({ message: `Document ${status}` });
  } catch (err) {
    console.error("EV VERIFY DOCUMENT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// SECURE EMAIL SEND (TOKEN BASED)
// =========================
router.post("/send-verification-email/:document_id", async (req, res) => {
  const { document_id } = req.params;
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "email query parameter is required" });
  }

  try {
    const [docs] = await pool.query("SELECT * FROM ev_documents WHERE id = ?", [document_id]);

    if (docs.length === 0) {
      return res.json({ message: "Document Not Found" });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      "INSERT INTO ev_verification_tokens (document_id, token, expires_at, used) VALUES (?, ?, ?, 0)",
      [document_id, token, expiresAt],
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyLink = `${frontendUrl}/#/admin/employee-verification/verify/${token}?action=verify`;
    const rejectLink = `${frontendUrl}/#/admin/employee-verification/verify/${token}?action=reject`;

    await sendVerificationEmail({ to: email, verifyLink, rejectLink });

    return res.json({ message: "Verification Email Sent Successfully" });
  } catch (err) {
    console.error("EV SEND EMAIL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// SECURE VERIFY API (token from email link)
// =========================
router.get("/verify-token/:token", async (req, res) => {
  const { token } = req.params;
  const { action } = req.query;

  try {
    const [tokens] = await pool.query("SELECT * FROM ev_verification_tokens WHERE token = ?", [
      token,
    ]);

    if (tokens.length === 0) {
      return res.json({ message: "Invalid Token" });
    }

    const record = tokens[0];

    if (record.used) {
      return res.json({ message: "Token Already Used" });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.json({ message: "Token Expired" });
    }

    const newStatus = action === "reject" ? "Rejected" : "Verified";

    await pool.query("UPDATE ev_documents SET status = ? WHERE id = ?", [
      newStatus,
      record.document_id,
    ]);

    await pool.query("UPDATE ev_verification_tokens SET used = 1 WHERE id = ?", [record.id]);

    await pool.query("INSERT INTO ev_audit_logs (document_id, action) VALUES (?, ?)", [
      record.document_id,
      newStatus,
    ]);

    return res.json({ message: `Document ${newStatus}` });
  } catch (err) {
    console.error("EV VERIFY TOKEN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// DASHBOARD (live aggregate counts)
// =========================
router.get("/dashboard", async (req, res) => {
  try {
    const [[{ total_employees }]] = await pool.query(
      "SELECT COUNT(*) AS total_employees FROM ev_employees",
    );
    const [[{ total_documents }]] = await pool.query(
      "SELECT COUNT(*) AS total_documents FROM ev_documents",
    );
    const [[{ verified_documents }]] = await pool.query(
      "SELECT COUNT(*) AS verified_documents FROM ev_documents WHERE status = 'Verified'",
    );
    const [[{ pending_documents }]] = await pool.query(
      "SELECT COUNT(*) AS pending_documents FROM ev_documents WHERE status = 'Pending'",
    );
    const [[{ rejected_documents }]] = await pool.query(
      "SELECT COUNT(*) AS rejected_documents FROM ev_documents WHERE status = 'Rejected'",
    );

    return res.json({
      total_employees,
      total_documents,
      verified_documents,
      pending_documents,
      rejected_documents,
    });
  } catch (err) {
    console.error("EV DASHBOARD ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// AUDIT LOGS
// =========================
router.get("/audit-logs", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ev_audit_logs ORDER BY id DESC");
    return res.json(rows);
  } catch (err) {
    console.error("EV GET AUDIT LOGS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
