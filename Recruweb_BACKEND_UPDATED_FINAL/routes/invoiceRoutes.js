import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoice,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";
import invoiceUpload from "../middleware/invoiceUpload.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.CLIENT_MGMT));

router
  .route("/")
  .get(getInvoices)
  .post(invoiceUpload.single("file"), createInvoice);

router.get("/:id/download", downloadInvoice);

router
  .route("/:id")
  .get(getInvoice)
  .put(invoiceUpload.single("file"), updateInvoice)
  .delete(deleteInvoice);

export default router;
