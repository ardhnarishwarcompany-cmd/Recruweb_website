import express from "express";
import {
  getPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermission,
  removePermission,
} from "../controllers/permissionController.js";

import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";

const router = express.Router();

router.use(
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_USERS),
);

router.get("/", getPermissions);
router.get("/:id", getPermission);
router.post("/", createPermission);
router.put("/:id", updatePermission);
router.delete("/:id", deletePermission);

router.post("/assign", assignPermission);
router.post("/remove", removePermission);

export default router;
