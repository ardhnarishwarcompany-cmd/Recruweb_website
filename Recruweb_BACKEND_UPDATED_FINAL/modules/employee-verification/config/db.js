import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Employee Verification module uses its own MySQL connection pool object,
// but talks to the SAME database as the main Recruweb app (DB_NAME) — one
// single merged database, just table names prefixed with "ev_" so nothing
// clashes with Recruweb's own Sequelize tables (Users, AuditLogs, etc).
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "recruweb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export async function testEmployeeVerificationConnection() {
  try {
    const conn = await pool.getConnection();
    console.log(
      "Employee Verification tables connected on database:",
      process.env.DB_NAME || "recruweb",
    );
    conn.release();
  } catch (err) {
    console.error("Employee Verification MySQL connection FAILED:", err.message);
    console.error(
      "Check DB_HOST/DB_USER/DB_PASSWORD/DB_NAME in backend/.env and make sure " +
        "you have run backend/modules/employee-verification/sql/schema.sql against that database.",
    );
  }
}
