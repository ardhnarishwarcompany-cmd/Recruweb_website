import cron from "node-cron";
import { BackupLog } from "../models/index.js";
import { createBackup } from "./backupManager.js";

// Extra Module — Security: Backup System — automatic scheduled backups.
// Default: every day at 2:00 AM server time. Configure via .env:
//   BACKUP_SCHEDULE_ENABLED=false   -> disable
//   BACKUP_CRON="0 2 * * *"         -> override the cron expression
export const startBackupScheduler = () => {
  if (process.env.BACKUP_SCHEDULE_ENABLED === "false") {
    console.log("Scheduled backups disabled (BACKUP_SCHEDULE_ENABLED=false)");
    return;
  }

  const expression = process.env.BACKUP_CRON || "0 2 * * *";

  cron.schedule(expression, async () => {
    try {
      const result = await createBackup();
      await BackupLog.create({
        filename: result.filename,
        sizeBytes: result.sizeBytes,
        type: "scheduled",
        status: "success",
        durationMs: result.durationMs,
      });
      console.log(`Scheduled backup created: ${result.filename}`);
    } catch (error) {
      await BackupLog.create({
        filename: "N/A",
        type: "scheduled",
        status: "failed",
        errorMessage: error.message,
      });
      console.error("Scheduled backup failed:", error.message);
    }
  });

  console.log(`Backup scheduler started (cron: "${expression}")`);
};
