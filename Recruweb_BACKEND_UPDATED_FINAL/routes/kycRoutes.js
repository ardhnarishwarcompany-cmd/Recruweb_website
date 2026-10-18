import express from "express";
import {
  uploadKycDocument,
  listMyKycDocuments,
  listAllKycDocuments,
  syncHrPartnerKyc,
  reviewKycDocument,
  deleteKycDocument,
  previewKycDocument,
} from "../controllers/kycController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";
import kycUpload from "../middleware/kycUpload.js";

// KYC / document verification routes — merged in from D RTPN.
// Mounted at /api/kyc in index.js, protected by the SAME auth/RBAC used
// by every other Recruweb route (no second login, no second session).
const router = express.Router();

router.use(protect);

router.post("/documents", kycUpload.single("document"), uploadKycDocument);
router.get("/documents/mine", listMyKycDocuments);
router.get("/documents/:id/view", previewKycDocument);
router.post(
  "/sync-hr-partner/:userId",
  authorizeRole(ROLE_GROUPS.ADMIN_ONLY),
  syncHrPartnerKyc
);
router.delete("/documents/:id", deleteKycDocument);

// Staff-only review queue
router.get("/documents", authorizeRole(ROLE_GROUPS.STAFF), listAllKycDocuments);
router.patch("/documents/:id/review", authorizeRole(ROLE_GROUPS.STAFF), reviewKycDocument);

export default router;
