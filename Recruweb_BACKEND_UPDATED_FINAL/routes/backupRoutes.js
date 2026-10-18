import express from "express";
import {
  listBackups,
  triggerBackup,
  downloadBackup,
  deleteBackup,
  restoreFromBackup,
  getBackupStatus,
} from "../controllers/backupController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { ROLES } from "../config/roles.js";

const router = express.Router();

// Extra Module — Security: Backup System. Full DB dumps are as sensitive as
// it gets, so this is Super Admin only (not the wider ADMIN_ONLY group).
router.use(protect, authorize([ROLES.SUPER_ADMIN]));

router.get("/", listBackups);
router.get("/status", getBackupStatus);
router.post("/", triggerBackup);
router.get("/:filename/download", downloadBackup);
router.post("/:filename/restore", restoreFromBackup);
router.delete("/:filename", deleteBackup);

export default router;
