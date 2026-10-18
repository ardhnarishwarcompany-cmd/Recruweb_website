import express from "express";
import {
  listMyResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  scoreResume,
  quickScoreResume,
  importResume,
  generateSummary,
  improveBullet,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/auth.js";
import resumeUpload from "../middleware/resumeUpload.js";

const router = express.Router();

// All Resume Builder endpoints require a logged-in user (candidate, or any
// authenticated role — staff can also build/export their own resumes).
router.use(protect);

router.get("/", listMyResumes);
router.post("/", createResume);
router.post("/score", scoreResume);
router.post("/quick-score", quickScoreResume);
router.post("/import", resumeUpload.single("resume"), importResume);
router.post("/generate-summary", generateSummary);
router.post("/improve-bullet", improveBullet);
router.get("/:id", getResume);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);
router.post("/:id/duplicate", duplicateResume);

export default router;
