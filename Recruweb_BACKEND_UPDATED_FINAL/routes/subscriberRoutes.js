import express from "express";
import {
  subscribe,
  unsubscribe,
  getSubscribers,
} from "../controllers/subscriberController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", publicFormLimiter, subscribe);
router.get("/unsubscribe/:email", unsubscribe);
router.get("/", protect, authorize(ROLE_GROUPS.ADMIN_ONLY), getSubscribers);

export default router;
