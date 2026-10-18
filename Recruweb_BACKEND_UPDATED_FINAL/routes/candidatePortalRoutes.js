import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
  getMyProfile,
  updateMyProfile,
  uploadMyResume,
  getMyResume,
  getMyDocuments,
  uploadMyDocument,
  getMyApplications,
  bookInterview,
  getMyInterviews,
  getMyOfferLetter,
  submitOnboarding,
  getMyOnboarding,
  getMyJoiningForm,
  submitMyJoiningForm,
  getMyTracker,
  getMyCandidateMessages,
  sendMyCandidateMessage,
  startCallFromCandidate,
  askAIInCandidateThread,
  getMyTasks,
  updateMyTask,
} from "../controllers/candidatePortalController.js";

import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLES } from "../config/roles.js";

const router = express.Router();

// Absolute path anchored to this file's own directory (backend/uploads/...)
// instead of a "uploads/..." path, which multer would otherwise resolve
// relative to process.cwd(). A relative path here silently wrote uploads
// to the wrong folder whenever the server was started from a different
// working directory than /backend, making previously-uploaded resumes /
// documents "disappear" (404 / "Stored file not found") even though the
// upload itself reported success.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const JOINING_UPLOAD_DIR = path.join(BACKEND_ROOT, "uploads", "joining-forms");
fs.mkdirSync(JOINING_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (req.path.includes("/onboarding") || req.path.includes("/joining-form")) {
      cb(null, JOINING_UPLOAD_DIR);
    } else if (file.fieldname === "resume") {
      cb(null, path.join(BACKEND_ROOT, "uploads", "resumes"));
    } else {
      cb(null, path.join(BACKEND_ROOT, "uploads", "documents"));
    }
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { files: 40, fileSize: 10 * 1024 * 1024 },
});

// Every route below is the logged-in candidate acting on their own record —
// never another candidate's, and never accessible to staff/client roles.
router.use(protect, authorizeRole(ROLES.CANDIDATE));

// Profile
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);

// Resume
router.get("/me/resume", getMyResume);
router.post("/me/resume", upload.single("resume"), uploadMyResume);

// Documents
router.get("/me/documents", getMyDocuments);
router.post("/me/documents", upload.single("document"), uploadMyDocument);

// Interview project/task workspace
router.get("/me/tasks", getMyTasks);
router.put("/me/tasks/:id", updateMyTask);

// Applications (Applied Jobs / Interview / Offer / Joining status)
router.get("/me/applications", getMyApplications);

// Book Interview
router.get("/me/interviews", getMyInterviews);
router.post("/me/interviews", bookInterview);

// Offer Letter
router.get("/me/offer-letter", getMyOfferLetter);

// Onboarding Forms
router.get("/me/onboarding", getMyOnboarding);
router.post("/me/onboarding", upload.any(), submitOnboarding);

// NEW JOINER FORM — separate from onboarding and available without approval gate
router.get("/me/joining-form", getMyJoiningForm);
router.post("/me/joining-form", upload.any(), submitMyJoiningForm);

// Joining Tracker (New Joiner Module)
router.get("/me/tracker", getMyTracker);

// Chat With Recruiter (Phase 4 — real-time chat + calling + AI assist)
router.get("/me/messages", getMyCandidateMessages);
router.post("/me/messages", sendMyCandidateMessage);
router.post("/me/messages/call", startCallFromCandidate);
router.post("/me/messages/ask-ai", askAIInCandidateThread);

export default router;
