import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import connectDB, { sequelize } from "./config/db.js";
import { findUploadedFile } from "./utils/findUploadedFile.js";
import { initializeAdmin } from "./controllers/authController.js";
import { initSocket } from "./socket.js";
import { ensureFinanceSchema } from "./utils/ensureFinanceSchema.js";
import { ensureCandidateSubmissionSchema } from "./utils/ensureCandidateSubmissionSchema.js";
import { ensureJobSchema } from "./utils/ensureJobSchema.js";
import { ensureEmployeeVerificationSchema } from "./utils/ensureEmployeeVerificationSchema.js";
import { ensureProjectTaskSchema } from "./utils/ensureProjectTaskSchema.js";
import { ensureEmployeeJoiningSchema } from "./utils/ensureEmployeeJoiningSchema.js";
import roleRoutes from "./routes/roleRoutes.js";

import contactRoutes from "./routes/contactRoutes.js";
import websiteChatRoutes from "./routes/websiteChatRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import getStartedRoutes from "./routes/getStartedRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import aiChatRoutes from "./routes/aiChatRoutes.js";
import employeeJoiningRoutes from "./routes/employeeJoiningRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import { seedRBAC } from "./seeders/rbacSeeder.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import crmClientRoutes from "./routes/crmClientRoutes.js";
import crmContactRoutes from "./routes/crmContactRoutes.js";
import crmCompanyRoutes from "./routes/crmCompanyRoutes.js";
import crmRequirementRoutes from "./routes/crmRequirementRoutes.js";
import crmNoteRoutes from "./routes/crmNoteRoutes.js";
import crmContractRoutes from "./routes/crmContractRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import leadFollowUpRoutes from "./routes/leadFollowUpRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import recruiterWorkspaceRoutes from "./routes/recruiterWorkspaceRoutes.js";
import candidatePortalRoutes from "./routes/candidatePortalRoutes.js";
import clientPortalRoutes from "./routes/clientPortalRoutes.js";
import candidateSubmissionRoutes from "./routes/candidateSubmissionRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import clientChatRoutes from "./routes/clientChatRoutes.js";
import candidateChatRoutes from "./routes/candidateChatRoutes.js";
import supportChatRoutes from "./routes/supportChatRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import { startAutomationScheduler } from "./utils/reminders.js";
import backupRoutes from "./routes/backupRoutes.js";
import { startBackupScheduler } from "./utils/backupScheduler.js";
import { startPayoutScheduler } from "./utils/payoutScheduler.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
import resourceCenterRoutes from "./routes/resourceCenterRoutes.js";
import { seedResourceCenter } from "./seeders/resourceCenterSeeder.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import cvScreenRoutes from "./routes/cvScreenRoutes.js";
import resumeCheckerRoutes from "./routes/resumeCheckerRoutes.js";
import coverLetterRoutes from "./routes/coverLetterRoutes.js";
import globalRoutes from "./routes/globalRoutes.js";
import { startCurrencyRefreshScheduler } from "./utils/currencyService.js";
import employeeVerificationRoutes from "./modules/employee-verification/routes/index.js";
import kycRoutes from "./routes/kycRoutes.js";
import hrPartnerRoutes from "./routes/hrPartnerRoutes.js";
import supportTicketRoutes from "./routes/supportTicketRoutes.js";
import trackerRoutes from "./routes/trackerRoutes.js";
import sopRoutes from "./routes/sopRoutes.js";
import { seedSops } from "./seeders/sopSeeder.js";
import { testEmployeeVerificationConnection } from "./modules/employee-verification/config/db.js";
import { razorpayWebhookHandler } from "./controllers/paymentController.js";
import hrmsRoutes from "./routes/hrmsRoutes.js";
import publicInterviewRoutes from "./routes/publicInterviewRoutes.js";

dotenv.config();

const app = express();
// Tracks DB availability so /api/health can report it (the server now starts
// listening before the DB connects, so a DB problem shows up in the logs and
// health check instead of a generic Hostinger 404 page).
const dbState = { connected: false };
// Hostinger runs Node behind a reverse proxy. Trust exactly one proxy hop so rate limiting and client IP detection work correctly.
app.set("trust proxy", 1);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// If express.static above didn't find an exact match, the file may simply
// have been written into a different uploads/<subfolder> than the one now
// referenced (older deploy, moved disk, renamed folder, etc.) — the same
// class of bug that used to cause a false "Stored file not found" on the
// authenticated preview endpoints. Before giving up, try a basename search
// across the whole uploads/ tree (see utils/findUploadedFile.js) so links
// that were generated straight from a stored DB path (e.g. KYC document
// links) keep working even when the exact recorded path has gone stale.
app.use("/uploads/:folder/:filename", (req, res, next) => {
  const fallback = findUploadedFile(`${req.params.folder}/${req.params.filename}`);
  if (fallback) {
    return res.sendFile(fallback);
  }
  next();
});
// If a request under /uploads still doesn't match a real file anywhere,
// stop right here with a proper 404 instead of falling through every route
// below and ending up on the SPA catch-all (which used to print the
// confusing "Frontend build not found. Run `npm run build`..." message for
// what is really just a missing/renamed uploaded file).
app.use("/uploads", (req, res) => {
  res.status(404).type("html").send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>File not found · Recruweb</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;
    background:radial-gradient(circle at 78% 22%,rgba(99,102,241,.22),transparent 40%),
      radial-gradient(circle at 15% 40%,rgba(14,165,233,.14),transparent 40%),
      linear-gradient(135deg,#091326,#111c3d 52%,#24205a);color:#fff;padding:24px;box-sizing:border-box;}
  .box{text-align:center;max-width:380px;padding:36px 40px;border-radius:20px;
    border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);
    backdrop-filter:blur(18px);box-shadow:0 25px 60px rgba(0,0,0,.35);}
  .code{display:inline-block;margin-bottom:14px;font-size:12px;letter-spacing:.14em;
    text-transform:uppercase;color:#a78bfa;font-weight:800;}
  .box h1{margin:0 0 10px;font-size:21px;}
  .box p{margin:0;color:#cbd5e1;font-size:13.5px;line-height:1.6;}
</style>
</head>
<body>
  <div class="box">
    <span class="code">404 · Recruweb</span>
    <h1>File not found</h1>
    <p>This document isn't available anymore, or the link has expired. Please go back and try again.</p>
  </div>
</body>
</html>`);
});
// CORS: allow configured production domains plus local Vite development origins.
// For credentialed requests we MUST return the exact requesting Origin, never '*'.
const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "").split(","),
  ...(process.env.CORS_ORIGINS || "").split(","),
].map((v) => String(v || "").trim()).filter(Boolean);

// Always allow the production domain (and www) even if the .env on the server
// is missing/misconfigured, so the site never breaks because of CORS.
const defaultOrigins = ["https://recruweb.com", "https://www.recruweb.com"];
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // local development (Vite)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    // Do not throw (that turned into a 500 with no CORS headers) - just
    // withhold the CORS headers so the browser blocks the cross-origin call.
    console.warn(`[CORS] blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "Cache-Control", "Pragma"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
// Razorpay webhook MUST be mounted with a raw body parser, BEFORE
// express.json() below, because signature verification (utils/razorpay.js)
// needs the exact raw bytes Razorpay signed — parsing it as JSON first
// would make every signature check fail.
app.post(
  "/api/payments/webhook/razorpay",
  express.raw({ type: "*/*" }),
  razorpayWebhookHandler,
);

app.use(express.json());

// ================= API ROUTES =================

app.use("/api", apiLimiter);

// Public HRMS / commercial pricing catalogue.
app.use("/api/hrms", hrmsRoutes);

app.use("/api/roles", roleRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/website-chat", websiteChatRoutes);

app.use("/api/candidates", candidateRoutes);
app.use("/api/applications", applicationRoutes);

app.use("/api/audit", auditRoutes);
app.use("/api/audit-logs", auditLogRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/permissions", permissionRoutes);

app.use("/api/subscribers", subscriberRoutes);
app.use("/api/get-started", getStartedRoutes);
app.use("/api/client-inquiry", getStartedRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/jobs", jobRoutes);

// Public interview scheduler (availability + booking).
app.use("/api/interviews", publicInterviewRoutes);

app.use("/api/employee-verification", employeeVerificationRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/hr-partners", hrPartnerRoutes);
app.use("/api/support-tickets", supportTicketRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/sops", sopRoutes);

app.use("/api/companies", companyRoutes);
app.use("/api/ai-chat", aiChatRoutes);

app.use("/api/employee-joining", employeeJoiningRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/users", userRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/settings", settingsRoutes);

app.use("/api/backups", backupRoutes);
app.use("/api/resource-center", resourceCenterRoutes);

app.use("/api/resumes", resumeRoutes);
app.use("/api/cv-screen", cvScreenRoutes);
app.use("/api/resume-checker", resumeCheckerRoutes);
app.use("/api/cover-letter", coverLetterRoutes);

app.use("/api/crm/clients", crmClientRoutes);
app.use("/api/crm/contacts", crmContactRoutes);
app.use("/api/crm/companies", crmCompanyRoutes);
app.use("/api/crm/requirements", crmRequirementRoutes);
app.use("/api/crm/notes", crmNoteRoutes);
app.use("/api/crm/contracts", crmContractRoutes);

app.use("/api/leads", leadRoutes);
app.use("/api/lead-follow-ups", leadFollowUpRoutes);

app.use("/api/team", teamRoutes);
app.use("/api/recruiter", recruiterWorkspaceRoutes);

app.use("/api/candidate-portal", candidatePortalRoutes);
app.use("/api/client-portal", clientPortalRoutes);

app.use("/api/crm/submissions", candidateSubmissionRoutes);
app.use("/api/crm/invoices", invoiceRoutes);

app.use("/api/crm/client-chat", clientChatRoutes);
app.use("/api/crm/candidate-chat", candidateChatRoutes);
app.use("/api/support-chat", supportChatRoutes);

app.use("/api/finance", financeRoutes);
app.use("/api/finance/payments", paymentRoutes);

app.use("/api/ai", aiRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/global", globalRoutes);

// ================= HEALTH CHECK =================

app.get("/api/health", (req, res) => {
  res.status(dbState.connected ? 200 : 503).json({
    status: dbState.connected ? "OK" : "DB_UNAVAILABLE",
    message: "Recruweb API is running (MySQL)",
    db: dbState.connected ? "connected" : "not connected - check DB_* variables and Runtime logs",
  });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");

// Production same-origin frontend assets. Keep these explicit so Hostinger's
// reverse proxy always serves the SPA assets from the same live domain.
app.get("/api-config.js", (req, res) => {
  res.type("application/javascript").send(`(function(){var origin=window.location.origin.replace(/\/+$/,"");window.__RECRUWEB_API_BASE__=origin+"/api";window.__RECRUWEB_SOCKET_BASE__=origin;window.__RECRUWEB_SAME_ORIGIN__=true;})();`);
});
app.use("/assets", express.static(path.join(FRONTEND_DIST, "assets"), { fallthrough: true, maxAge: "1h" }));
app.use("/media", express.static(path.join(FRONTEND_DIST, "media"), { fallthrough: true, maxAge: "1h" }));
app.use(express.static(FRONTEND_DIST, { index: "index.html" }));

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.get("/*path", (req, res) => {
  const indexHtml = path.join(FRONTEND_DIST, "index.html");

  res.sendFile(indexHtml, (err) => {
    if (err) {
      res
        .status(404)
        .send(
          "Frontend build not found. Run `npm run build` in /frontend, or use `npm run dev` for local development.",
        );
    }
  });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
const PORT = process.env.PORT || 5000;

const start = async () => {
  // Listen FIRST so the site/API are reachable (and /api/health answers) even
  // if the database is misconfigured. Previously a DB error killed the process
  // before it ever listened, which Hostinger shows as a plain 404 page.
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} (HTTP + Socket.IO real-time chat/calling)`,
    );
  });

  dbState.connected = await connectDB();
  if (!dbState.connected) {
    console.error(
      "[startup] Database NOT connected. Set DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD to your Hostinger MySQL values and restart. API routes that need the DB will fail until then.",
    );
    return;
  }

  // Sync models (creates missing tables only — no per-column ALTER diffing).
  // This is what was making every restart slow: alter:true was making
  // Sequelize DESCRIBE + diff all 47 tables on every boot.
  // If you add/change a model field, run this ONE TIME with alter:true
  // (e.g. `SYNC_ALTER=true npm run dev`) to apply the change, then go
  // back to normal `npm run dev`. Better long-term: use migrations.
  try {
    if (sequelize) {
      const shouldAlter = process.env.SYNC_ALTER === "true";
await sequelize.sync({ alter: shouldAlter });
      // SOP approval workflow uses pending_approval/rejected statuses.
      // Fast sync does not alter existing ENUM columns, so make the existing
      // MySQL column compatible on every boot. This is idempotent.
      try {
        await sequelize.query(
          "ALTER TABLE `Sops` MODIFY COLUMN `status` ENUM('draft','pending_approval','published','archived','rejected') NOT NULL DEFAULT 'draft'"
        );
      } catch (sopSchemaErr) {
        console.warn("[SOP schema] status ENUM check/update skipped:", sopSchemaErr.message);
      }
      await ensureCandidateSubmissionSchema();
      await ensureJobSchema();
      await ensureEmployeeVerificationSchema();
      await ensureProjectTaskSchema();
      await ensureEmployeeJoiningSchema();
      await ensureFinanceSchema();
      console.log(
        shouldAlter
          ? "Database models auto-synced (alter) with MySQL schema successfully!"
          : "Database models synced with MySQL schema (fast mode).",
      );
    }
  } catch (syncErr) {
console.error("DATABASE SYNC FULL ERROR:");
console.error(syncErr);
console.error("STACK:");
console.error(syncErr.stack);  }

  await seedRBAC();
  await seedResourceCenter();
  await seedSops();
  await initializeAdmin();
  await testEmployeeVerificationConnection();

  startAutomationScheduler();
  startBackupScheduler();
  startPayoutScheduler();
  startCurrencyRefreshScheduler();
};

start();

// Safety net: log unexpected errors instead of letting them crash the whole
// server. This does NOT replace fixing the root cause (see
// utils/documentVerification.js / middleware/idDocumentUpload.js for the
// Tesseract+PDF issue) — some errors thrown inside worker threads (e.g. by
// tesseract.js) bypass normal try/catch and promise rejection handling
// entirely, so this is the last line of defense against those.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});