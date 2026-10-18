import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  assignRole,
  updatePermissions,
  setUserStatus,
  adminResetPassword,
  deleteUser,
} from "../controllers/userManagementController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";
const router = express.Router();

// All user-management endpoints are Super Admin / Admin only.
router.use(
  protect,
  authorizeRole(...ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_USERS),
);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.put("/:id/role", assignRole);
router.put("/:id/permissions", updatePermissions);
router.put("/:id/status", setUserStatus);
router.put("/:id/reset-password", adminResetPassword);
router.delete("/:id", deleteUser);

export default router;
