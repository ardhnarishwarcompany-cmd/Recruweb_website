import express from "express";
import {
  getSalaryGuides,
  createSalaryGuide,
  updateSalaryGuide,
  deleteSalaryGuide,
  getInterviewQuestions,
  createInterviewQuestion,
  updateInterviewQuestion,
  deleteInterviewQuestion,
  getHrTemplates,
  createHrTemplate,
  updateHrTemplate,
  deleteHrTemplate,
  downloadHrTemplate,
  getComplianceChecklists,
  createComplianceChecklist,
  updateComplianceChecklist,
  deleteComplianceChecklist,
  downloadComplianceChecklist,
  runPayrollCalculator,
  getResourceCenterStats,
} from "../controllers/resourceCenterController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";
import hrTemplateUpload from "../middleware/hrTemplateUpload.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const manage = [
  protect,
  authorize(ROLE_GROUPS.STAFF),
  checkPermission(PERMISSIONS.MANAGE_RESOURCES),
];

// ---- Public — Free Hiring Resource Center (all live DB data) ----
router.get("/stats", getResourceCenterStats);

router.get("/salary-guides", getSalaryGuides);
router.get("/interview-questions", getInterviewQuestions);
router.get("/templates", getHrTemplates);
router.get("/templates/:id/download", downloadHrTemplate);
router.get("/compliance-checklists", getComplianceChecklists);
router.get("/compliance-checklists/:id/download", downloadComplianceChecklist);

// Payroll calculator does a live calculation per request — rate limited
// like any other public form endpoint to prevent abuse.
router.post("/payroll-calculator", publicFormLimiter, runPayrollCalculator);

// ---- Admin — manage Resource Center content (MANAGE_RESOURCES) ----
router.post("/salary-guides", ...manage, createSalaryGuide);
router.put("/salary-guides/:id", ...manage, updateSalaryGuide);
router.delete("/salary-guides/:id", ...manage, deleteSalaryGuide);

router.post("/interview-questions", ...manage, createInterviewQuestion);
router.put("/interview-questions/:id", ...manage, updateInterviewQuestion);
router.delete("/interview-questions/:id", ...manage, deleteInterviewQuestion);

router.post(
  "/templates",
  ...manage,
  hrTemplateUpload.single("file"),
  createHrTemplate,
);
router.put(
  "/templates/:id",
  ...manage,
  hrTemplateUpload.single("file"),
  updateHrTemplate,
);
router.delete("/templates/:id", ...manage, deleteHrTemplate);

router.post("/compliance-checklists", ...manage, createComplianceChecklist);
router.put("/compliance-checklists/:id", ...manage, updateComplianceChecklist);
router.delete(
  "/compliance-checklists/:id",
  ...manage,
  deleteComplianceChecklist,
);

export default router;
