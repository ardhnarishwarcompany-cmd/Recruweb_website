import express from "express";
import {
  createSubmission,
  getSubmissions,
  getSubmission,
  updateSubmission,
  reviewSubmission,
  deleteSubmission,
} from "../controllers/candidateSubmissionController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.STAFF));

router.route("/").get(getSubmissions).post(createSubmission);
router.patch("/:id/review", authorize(ROLE_GROUPS.ADMIN_ONLY), reviewSubmission);

router
  .route("/:id")
  .get(getSubmission)
  .put(updateSubmission)
  .delete(deleteSubmission);

export default router;
