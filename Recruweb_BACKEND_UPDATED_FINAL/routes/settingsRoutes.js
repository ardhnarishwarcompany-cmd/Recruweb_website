import express from "express";
import {
  getAllSettings,
  getSettingsByCategory,
  updateSettingsByCategory,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { checkPermission } from "../middleware/permission.js";
import { ROLE_GROUPS, PERMISSIONS } from "../config/roles.js";

const router = express.Router();

// Settings are Super Admin / Admin only.
router.use(
  protect,
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  checkPermission(PERMISSIONS.MANAGE_SETTINGS),
);

router.get("/", getAllSettings);
router.get("/:category", getSettingsByCategory);
router.put("/:category", updateSettingsByCategory);

export default router;
