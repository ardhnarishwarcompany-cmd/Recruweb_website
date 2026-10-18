import express from "express";
import {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.FINANCE));

router.route("/").get(getPayments).post(createPayment);
router.route("/:id").get(getPayment).put(updatePayment).delete(deletePayment);

export default router;
