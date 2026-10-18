import express from "express";
import {
  getAutomationLogs,
  getAutomationStats,
  sendManual,
  runRemindersNow,
} from "../controllers/automationController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.AI_AUTOMATION));

router.get("/logs", getAutomationLogs);
router.get("/stats", getAutomationStats);
router.post("/send", sendManual);
router.post("/run-reminders", runRemindersNow);

export default router;
