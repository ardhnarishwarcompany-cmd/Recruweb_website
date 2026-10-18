import express from "express";
import {
  getInbox,
  getApplication,
  updateApplicationStatus,
  assignApplication,
  screenResume,
  deleteApplication,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS, ROLES } from "../config/roles.js";

const router = express.Router();

router.use(protect);

// Candidate Inbox — list/search/filter every applied candidate.
router.get("/", authorize(ROLE_GROUPS.RECRUITMENT, ROLES.HR), getInbox);

router.get(
  "/:id",
  authorize(ROLE_GROUPS.RECRUITMENT, ROLES.HR),
  getApplication,
);

// Status Tracking — move an applicant through the pipeline.
router.put(
  "/:id",
  authorize(ROLE_GROUPS.RECRUITMENT, ROLES.HR),
  updateApplicationStatus,
);

// Candidate Assignment — assign/unassign to a recruiter.
router.put(
  "/:id/assign",
  authorize(ROLE_GROUPS.RECRUITMENT, ROLES.HR),
  assignApplication,
);

// Resume Screening — (re)run keyword + AI screening on demand.
router.post(
  "/:id/screen",
  authorize(ROLE_GROUPS.RECRUITMENT, ROLES.HR),
  screenResume,
);

router.delete("/:id", authorize(ROLE_GROUPS.ADMIN_ONLY), deleteApplication);

export default router;
