import express from "express";
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branchController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";
const router = express.Router();

// Any staff member can view branches (e.g. to pick their own branch in a
// profile screen); only Super Admin / Admin can create, edit or delete.
router.get("/", protect, authorize(ROLE_GROUPS.STAFF), getBranches);
router.get("/:id", protect, authorize(ROLE_GROUPS.STAFF), getBranchById);

router.post(
  "/",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_BRANCHES),
  createBranch,
);
router.put(
  "/:id",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_BRANCHES),
  updateBranch,
);
router.delete(
  "/:id",
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_BRANCHES),
  deleteBranch,
);
export default router;
