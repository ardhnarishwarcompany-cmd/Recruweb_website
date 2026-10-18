import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorizeRole(...ROLE_GROUPS.STAFF),
  getDashboardStats,
);

export default router;
