import express from "express";
import {
  createGetStarted,
  getGetStartedSubmissions,
  getGetStarted,
  updateGetStartedStatus,
} from "../controllers/getStartedController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Client inquiry form (public submit)
router.post("/", publicFormLimiter, createGetStarted);
router.get(
  "/",
  protect,
  authorize(ROLE_GROUPS.CLIENT_MGMT),
  getGetStartedSubmissions,
);
router.get("/:id", protect, authorize(ROLE_GROUPS.CLIENT_MGMT), getGetStarted);
router.put(
  "/:id",
  protect,
  authorize(ROLE_GROUPS.CLIENT_MGMT),
  updateGetStartedStatus,
);

export default router;
