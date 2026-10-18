import express from "express";
import {
  getJobs,
  getFeaturedJobs,
  getJob,
  createJob,
  requestJob,
  updateJob,
  deleteJob,
  applyForJob,
  getJobApplications,
  getAllApplications,
  seedJobs,
} from "../controllers/jobController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";

import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";
import resumeUpload from "../middleware/resumeUpload.js";

const router = express.Router();

router.post("/seed", protect, authorize(ROLE_GROUPS.ADMIN_ONLY), seedJobs);
router.get("/featured", getFeaturedJobs);
// Public "Post a Job" form (no login) — saved as inactive/pending review.
router.post("/request", publicFormLimiter, requestJob);
router.get(
  "/applications",
  protect,
  authorize(ROLE_GROUPS.RECRUITMENT),
  checkPermission(PERMISSIONS.MANAGE_JOBS),
  getAllApplications,
);
router.get("/", getJobs);
router.get("/:id", getJob);
router.post(
  "/",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_JOBS),
  createJob,
);
router.put(
  "/:id",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_JOBS),
  updateJob,
);
router.delete(
  "/:id",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_JOBS),
  deleteJob,
);
router.post("/:id/apply", resumeUpload.single("resume"), applyForJob);
router.get(
  "/:id/applications",
  protect,
  authorize(ROLE_GROUPS.RECRUITMENT),
  checkPermission(PERMISSIONS.MANAGE_JOBS),
  getJobApplications,
);
export default router;
