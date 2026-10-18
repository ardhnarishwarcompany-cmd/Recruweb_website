import express from "express";
import {
  parseJD,
  reparseResume,
  matchCandidatesForJob,
  rankCandidatesInPipeline,
  getMatchScore,
  writeEmail,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.AI_AUTOMATION));

router.post("/parse-jd", parseJD);
router.post("/re-parse-resume/:candidateId", reparseResume);
router.get("/match/:jobId", matchCandidatesForJob);
router.get("/rank/:jobId", rankCandidatesInPipeline);
router.post("/match-score", getMatchScore);
router.post("/generate-email", writeEmail);

export default router;
