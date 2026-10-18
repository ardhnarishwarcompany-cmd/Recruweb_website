import express from "express";
import {
  createCrmCompany,
  getCrmCompanies,
  getCrmCompany,
  updateCrmCompany,
  deleteCrmCompany,
} from "../controllers/crmCompanyController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLE_GROUPS } from "../config/roles.js";

const router = express.Router();

router.use(protect, authorize(ROLE_GROUPS.CLIENT_MGMT));

router.route("/").get(getCrmCompanies).post(createCrmCompany);
router.route("/:id").get(getCrmCompany).put(updateCrmCompany).delete(deleteCrmCompany);

export default router;
