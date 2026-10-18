import express from "express";
import { getFinanceSummary, getRevenueReport } from "../controllers/financeController.js";
import { getCollections } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.FINANCE.concat(ROLE_GROUPS.ANALYTICS)));

router.get("/summary", getFinanceSummary);
router.get("/revenue-reports", getRevenueReport);
router.get("/collections", getCollections);

export default router;
