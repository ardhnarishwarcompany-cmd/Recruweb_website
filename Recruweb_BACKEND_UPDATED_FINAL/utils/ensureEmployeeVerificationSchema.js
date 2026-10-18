import { pool } from "../modules/employee-verification/config/db.js";

export const ensureEmployeeVerificationSchema = async () => {
  const statements = [
    `CREATE TABLE IF NOT EXISTS ev_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(60) NOT NULL DEFAULT 'hr',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS ev_employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(60) NOT NULL,
      department VARCHAR(160) NOT NULL,
      designation VARCHAR(160) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS ev_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      document_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      status ENUM('Pending','Verified','Rejected') NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ev_documents_employee (employee_id),
      INDEX idx_ev_documents_status (status)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS ev_audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      document_id INT NULL,
      action VARCHAR(160) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ev_audit_document (document_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS ev_verification_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      document_id INT NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ev_token_document (document_id)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS ev_background_verifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      previous_company VARCHAR(255) NOT NULL,
      hr_email VARCHAR(255) NOT NULL,
      feedback TEXT NOT NULL,
      rehire_eligible VARCHAR(80) NOT NULL,
      criminal_record VARCHAR(80) NOT NULL,
      status VARCHAR(80) NOT NULL DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ev_background_employee (employee_id)
    ) ENGINE=InnoDB`,
  ];
  for (const sql of statements) {
    await pool.query(sql);
  }
};
