import express from "express";
import { analyzeCV } from "../controllers/cvScreenController.js";
import resumeUpload from "../middleware/resumeUpload.js";

const router = express.Router();

// Public tool — no login required, matching the existing public CV Screen page.
router.post("/analyze", resumeUpload.array("resumes", 10), analyzeCV);

export default router;
