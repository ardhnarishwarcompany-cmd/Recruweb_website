import express from "express";
import {
  getActivityLogs,
  getLoginHistory,
  getChangeLogs,
} from "../controllers/auditLogController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

// Audit logs are Super Admin / Admin only.
router.use(protect, authorize(ROLE_GROUPS.ADMIN_ONLY));

router.get("/", getActivityLogs);
router.get("/login-history", getLoginHistory);
router.get("/changes", getChangeLogs);

export default router;
