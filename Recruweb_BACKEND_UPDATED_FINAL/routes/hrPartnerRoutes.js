import express from "express";
import {
  getMyProfile,
  createOrGetMyProfile,
  updateMyProfile,
  getMyDashboard,
  getOpenVacancies,
  getMySubmissions,
  createMySubmission,
  listHrPartners,
  reviewHrPartner,
  getMyWallet,
  creditWallet,
  releaseWalletTransaction,
  listPendingPayouts,
} from "../controllers/hrPartnerController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS, ROLES } from "../config/roles.js";

// HR Partner + payout routes — merged in from D RTPN.
// Mounted at /api/hr-partners in index.js, protected by the SAME
// auth/RBAC as every other Recruweb route (no second login/session).
const router = express.Router();

router.use(protect);

// HR Partner self-service
router.get("/profile", authorizeRole(ROLES.HR_PARTNER), getMyProfile);
router.post("/profile", authorizeRole(ROLES.HR_PARTNER), createOrGetMyProfile);
router.put("/profile", authorizeRole(ROLES.HR_PARTNER), updateMyProfile);
router.get("/dashboard", authorizeRole(ROLES.HR_PARTNER), getMyDashboard);
router.get("/vacancies", authorizeRole(ROLES.HR_PARTNER), getOpenVacancies);
router.get("/submissions", authorizeRole(ROLES.HR_PARTNER), getMySubmissions);
router.post("/submissions", authorizeRole(ROLES.HR_PARTNER), createMySubmission);
router.get("/wallet", authorizeRole(ROLES.HR_PARTNER), getMyWallet);

// Staff (HR/Finance) oversight
router.get("/", authorizeRole(ROLE_GROUPS.HR_PARTNER_MGMT), listHrPartners);
router.patch("/:id/approve", authorizeRole(ROLE_GROUPS.HR_PARTNER_MGMT), reviewHrPartner);
router.post("/wallet/credit", authorizeRole(ROLE_GROUPS.HR_PARTNER_MGMT), creditWallet);
router.get("/wallet/transactions/pending", authorizeRole(ROLE_GROUPS.HR_PARTNER_MGMT), listPendingPayouts);
router.patch("/wallet/transactions/:id/release", authorizeRole(ROLE_GROUPS.HR_PARTNER_MGMT), releaseWalletTransaction);

export default router;
