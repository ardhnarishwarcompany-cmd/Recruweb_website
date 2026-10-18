import express from "express";
import {
  getSupportThreads,
  getMySupportMessages,
  getSupportMessages,
  sendSupportMessage,
} from "../controllers/supportChatController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLES } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.HR_PARTNER,
]));

router.get("/threads", getSupportThreads);
router.get("/me", getMySupportMessages);
router.get("/threads/:userId", getSupportMessages);
router.post("/me", sendSupportMessage);
router.post("/threads/:userId", sendSupportMessage);

export default router;
