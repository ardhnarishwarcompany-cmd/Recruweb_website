import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  uploadResume,
  updatePipelineStage,
  updateRating,
  addCandidateNote,
  getCandidateTimeline,
  uploadCandidateDocument,
  verifyCandidateDocument,
  getCandidateTracker,
  previewResume,
  previewCandidateDocument,
  previewOfferLetter,
  uploadOfferLetter,
  rejectCandidate,
  unrejectCandidate,
} from "../controllers/candidateController.js";
import { generateAndSendOfferLetter } from "../controllers/offerLetterController.js";

import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";
const router = express.Router();

// Absolute path anchored to this file's own directory (backend/uploads/...)
// instead of a "uploads/..." path, which multer would otherwise resolve
// relative to process.cwd(). A relative path here silently wrote uploads
// to the wrong folder whenever the server was started from a different
// working directory than /backend — this is exactly why previews of
// resumes / offer letters / documents could 404 ("Stored file not found")
// even right after a successful-looking upload: the file was saved
// somewhere other than backend/uploads, while previews always read from
// backend/uploads.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "resume") {
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
});

// The ATS pipeline is an internal tool — only staff (Recruiter, HR, HR
// Manager, Recruitment Manager, Admin, Super Admin, Finance Manager) may
// view or manage candidates. Clients and candidates are never authenticated
// against this router.
router.use(protect, authorizeRole(...ROLE_GROUPS.STAFF));

router.route("/").get(getCandidates).post(createCandidate);

router
  .route("/:id")
  .get(getCandidate)
  .put(updateCandidate)
  .delete(deleteCandidate);

router.put("/:id/pipeline", updatePipelineStage);

router.put("/:id/rating", updateRating);

router.post("/:id/resume", upload.single("resume"), uploadResume);

router.post(
  "/:id/document",
  upload.single("document"),
  uploadCandidateDocument,
);

router.post("/:id/note", addCandidateNote);

router.get("/:id/timeline", getCandidateTimeline);
router.get("/:id/resume", previewResume);
router.get("/:id/document/:index/view", previewCandidateDocument);
router.get("/:id/offer-letter/view", previewOfferLetter);
router.post(
  "/:id/offer-letter",
  upload.single("offerLetter"),
  uploadOfferLetter,
);

// New Joiner Module — Verification: HR/Admin approves or rejects a
// candidate-submitted document.
router.put("/:id/document/:index/verify", verifyCandidateDocument);

// Reject / restore a candidate (performance-based rejection, any stage)
router.put("/:id/reject", rejectCandidate);
router.put("/:id/unreject", unrejectCandidate);

// Auto-generate the branded Offer Letter PDF + email it to the candidate
// (attaches the PDF, uses the same template Recruweb sends manually today)
router.post("/:id/offer-letter/generate", generateAndSendOfferLetter);

// New Joiner Module — Joining Tracker: end-to-end progress timeline.
router.get("/:id/tracker", getCandidateTracker);

export default router;
