import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Reuses the same SMTP_* credentials the main Recruweb backend already uses
// (backend/.env), so no separate mail setup is needed for this module.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.MAIL_HOST,
  port: Number(process.env.SMTP_PORT || process.env.MAIL_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER || process.env.MAIL_USER,
    pass: process.env.SMTP_PASS || process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
  },
});

export async function sendVerificationEmail({ to, verifyLink, rejectLink }) {
  const html = `
    <h2>Document Verification Request</h2>
    <p>Please verify this document.</p>
    <a href="${verifyLink}">Verify Document</a>
    <br><br>
    <a href="${rejectLink}">Reject Document</a>
  `;

  return transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.MAIL_FROM,
    to,
    subject: "Document Verification",
    html,
  });
}
