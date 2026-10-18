import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRole(...ROLE_GROUPS.ADMIN_ONLY),
  getAuditLogs,
);

export default router;
