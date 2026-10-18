import express from "express";
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";

import { protect } from "../middleware/auth.js";
import { authorizeRole, authorizePermission } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";

const router = express.Router();

// Get All Roles
router.get(
  "/",
  protect,
  authorizeRole(...ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_USERS),
  getRoles,
);

// Get Single Role
router.get(
  "/:id",
  protect,
  authorizeRole(...ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_USERS),
  getRole,
);

// Create Role
router.post(
  "/",
  protect,
  authorizeRole(...ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_USERS),
  createRole,
);

// Update Role
router.put(
  "/:id",
  protect,
  authorizeRole(...ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_USERS),
  updateRole,
);

// Delete Role
router.delete(
  "/:id",
  protect,
  authorizeRole(...ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_USERS),
  deleteRole,
);

export default router;
