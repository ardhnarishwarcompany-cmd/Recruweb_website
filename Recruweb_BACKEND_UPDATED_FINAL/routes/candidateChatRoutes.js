import express from "express";
import {
  getCandidateThreads,
  getCandidateThreadMessages,
  replyToCandidate,
  startCallWithCandidate,
} from "../controllers/candidateChatController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.CHAT));

router.get("/threads", getCandidateThreads);
router.get("/threads/:candidateId", getCandidateThreadMessages);
router.post("/threads/:candidateId", replyToCandidate);
router.post("/threads/:candidateId/call", startCallWithCandidate);

export default router;
