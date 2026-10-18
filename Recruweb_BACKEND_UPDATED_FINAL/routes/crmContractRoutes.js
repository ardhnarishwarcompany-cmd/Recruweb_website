import express from "express";
import {
  createContract,
  getContracts,
  getContract,
  updateContract,
  uploadContractDocument,
  deleteContract,
} from "../controllers/crmContractController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";
import upload from "../middleware/contractUpload.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.CLIENT_MGMT));

router.route("/").get(getContracts).post(createContract);
router.route("/:id").get(getContract).put(updateContract).delete(deleteContract);
router.post("/:id/document", upload.single("document"), uploadContractDocument);

export default router;
