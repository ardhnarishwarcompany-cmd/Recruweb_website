import express from "express";
import {
  getNewJoinerForms,
  getNewJoinerForm,
  updateNewJoinerFormStatus,
} from "../controllers/employeeJoiningController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

// New Joiners are submitted by the authenticated candidate portal endpoint.
// This admin API is intentionally read/manage-only so it cannot mix with
// Candidate Onboarding or accept anonymous submissions.
router.get("/", protect, authorize(ROLE_GROUPS.HR_OPS), getNewJoinerForms);
router.get("/:id", protect, authorize(ROLE_GROUPS.HR_OPS), getNewJoinerForm);
router.put(
  "/:id",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  updateNewJoinerFormStatus,
);

export default router;
