import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS, ROLES } from "../config/roles.js";
import {
  getStaffTracker,
  getClientTracker,
  getHrPartnerTracker,
} from "../controllers/trackerController.js";

const router = express.Router();

router.use(protect);

router.get(
  "/staff",
  authorizeRole(...ROLE_GROUPS.STAFF),
  getStaffTracker,
);

router.get(
  "/client",
  authorizeRole(ROLES.CLIENT),
  getClientTracker,
);

router.get(
  "/hr-partner",
  authorizeRole(ROLES.HR_PARTNER),
  getHrPartnerTracker,
);

export default router;
