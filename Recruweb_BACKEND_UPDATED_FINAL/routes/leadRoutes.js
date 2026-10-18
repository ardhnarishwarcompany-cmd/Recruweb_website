import express from "express";
import {
  createLead,
  getLeads,
  getLeadDashboard,
  getLead,
  updateLead,
  assignLead,
  convertLead,
  markLeadLost,
  deleteLead,
} from "../controllers/leadController.js";
import {
  createFollowUp,
  getFollowUps,
  getDueFollowUps,
} from "../controllers/leadFollowUpController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

// Public — the "New Inquiry" form on the marketing site submits here.
router.post("/", createLead);

// Everything else is internal (Inquiry Dashboard, assignment, follow-ups,
// conversion tracking).
router.use(protect, authorize(ROLE_GROUPS.CLIENT_MGMT));

router.get("/dashboard", getLeadDashboard);
router.get("/follow-ups/due", getDueFollowUps);
router.get("/", getLeads);
router.get("/:id", getLead);
router.put("/:id", updateLead);
router.put("/:id/assign", assignLead);
router.post("/:id/convert", convertLead);
router.put("/:id/lost", markLeadLost);
router.delete("/:id", deleteLead);

// Follow-ups nested under a lead
router.get("/:leadId/follow-ups", getFollowUps);
router.post("/:leadId/follow-ups", createFollowUp);

export default router;
