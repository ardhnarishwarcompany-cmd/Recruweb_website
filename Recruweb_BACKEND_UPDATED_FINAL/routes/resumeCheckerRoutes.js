import express from "express";
import { checkResume } from "../controllers/resumeCheckerController.js";
import resumeUpload from "../middleware/resumeUpload.js";

const router = express.Router();

// Public tool — no login required, matches the public "Resume Checker" page.
router.post("/analyze", resumeUpload.single("resume"), checkResume);

export default router;
