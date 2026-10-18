import express from "express";
import {
  getCompanies,
  getFeaturedCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getIndustries,
} from "../controllers/companyController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";
const router = express.Router();

// NOTE: the old "/seed" endpoint that bulk-inserted ~50 fake companies
// (placeholder.com logos, *.example.com websites, made-up job counts) has
// been removed. Companies shown on the site now come exclusively from real
// rows created here via createCompany (Admin > Clients/Companies) — no
// fabricated data is ever inserted.
router.get("/industries", getIndustries);
router.get("/featured", getFeaturedCompanies);
router.get("/", getCompanies);
router.get("/:id", getCompany);
router.post(
  "/",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_CLIENTS),
  createCompany,
);
router.put(
  "/:id",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_CLIENTS),
  updateCompany,
);
router.delete(
  "/:id",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_CLIENTS),
  deleteCompany,
);

export default router;
