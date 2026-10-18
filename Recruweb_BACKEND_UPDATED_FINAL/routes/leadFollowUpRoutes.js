import express from "express";
import {
  updateFollowUp,
  deleteFollowUp,
} from "../controllers/leadFollowUpController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.CLIENT_MGMT));

// Standalone update/delete by follow-up id (creation/listing happens
// nested under /api/leads/:leadId/follow-ups, see leadRoutes.js)
router.put("/:id", updateFollowUp);
router.delete("/:id", deleteFollowUp);

export default router;
