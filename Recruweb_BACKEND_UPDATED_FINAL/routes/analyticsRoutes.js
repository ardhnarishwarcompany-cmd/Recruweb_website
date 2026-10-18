import express from "express";
import {
  getDashboardStats,
  getSuperAdminStats,
  getCEODashboard,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize(ROLE_GROUPS.ANALYTICS),
  checkPermission(PERMISSIONS.VIEW_REVENUE),
  getDashboardStats,
);

router.get(
  "/super-admin",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.VIEW_REVENUE),
  getSuperAdminStats,
);

// Extra Module — Analytics Module: CEO Dashboard (revenue trend, hiring
// funnel, recruiter leaderboard, top clients). Admin/Super Admin only.
router.get(
  "/ceo",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.VIEW_REVENUE),
  getCEODashboard,
);

export default router;
