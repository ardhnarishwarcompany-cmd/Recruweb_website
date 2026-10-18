import fs from "fs";
import { BackupLog } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  createBackup,
  listBackupFiles,
  getBackupPath,
  deleteBackupFile,
  restoreBackup,
} from "../utils/backupManager.js";

// GET /api/backups — merges files on disk with their BackupLog history so
// backups created outside this run (e.g. before a server restart) still show.
export const listBackups = async (req, res) => {
  try {
    const files = listBackupFiles();
    const logs = await BackupLog.findAll({ order: [["createdAt", "DESC"]] });

    const logByFilename = new Map(logs.map((l) => [l.filename, l]));
    const data = files.map((f) => {
      const log = logByFilename.get(f.filename);
      return {
        filename: f.filename,
        sizeBytes: f.sizeBytes,
        createdAt: log?.createdAt || f.createdAt,
        type: log?.type || "manual",
        status: log?.status || "success",
        durationMs: log?.durationMs ?? null,
        triggeredByName: log?.triggeredByName ?? null,
      };
    });

    // Include failed attempts too, even though they left no file.
    const failedOnly = logs.filter(
      (l) =>
        l.status === "failed" && !files.find((f) => f.filename === l.filename),
    );

    const totalSizeBytes = files.reduce(
      (sum, f) => sum + Number(f.sizeBytes || 0),
      0,
    );

    res.status(200).json({
      success: true,
      count: data.length,
      totalSizeBytes,
      lastBackupAt: data[0]?.createdAt || null,
      data: [
        ...data,
        ...failedOnly.map((l) => ({
          filename: l.filename,
          sizeBytes: 0,
          createdAt: l.createdAt,
          type: l.type,
          status: l.status,
          durationMs: l.durationMs,
          triggeredByName: l.triggeredByName,
          errorMessage: l.errorMessage,
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to list backups",
      error: error.message,
    });
  }
};

// POST /api/backups — trigger an on-demand backup.
export const triggerBackup = async (req, res) => {
  try {
    const result = await createBackup();

    const log = await BackupLog.create({
      filename: result.filename,
      sizeBytes: result.sizeBytes,
      type: "manual",
      status: "success",
      durationMs: result.durationMs,
      triggeredById: req.user?.id ?? null,
      triggeredByName: req.user?.name ?? null,
    });

    await logAudit({
      req,
      action: "create",
      module: "backup",
      targetType: "BackupLog",
      targetId: log.id,
      description: `Created database backup ${result.filename}`,
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    await BackupLog.create({
      filename: "N/A",
      status: "failed",
      errorMessage: error.message,
      type: "manual",
      triggeredById: req.user?.id ?? null,
      triggeredByName: req.user?.name ?? null,
    });

    await logAudit({
      req,
      action: "create",
      module: "backup",
      description: "Database backup failed",
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: "Failed to create backup",
      error: error.message,
    });
  }
};

// GET /api/backups/:filename/download
export const downloadBackup = async (req, res) => {
  const filePath = getBackupPath(req.params.filename);
  if (!filePath) {
    return res
      .status(404)
      .json({ success: false, message: "Backup not found" });
  }

  await logAudit({
    req,
    action: "download",
    module: "backup",
    description: `Downloaded backup ${req.params.filename}`,
  });

  res.download(filePath, req.params.filename);
};

// DELETE /api/backups/:filename
export const deleteBackup = async (req, res) => {
  try {
    const deleted = deleteBackupFile(req.params.filename);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Backup not found" });
    }

    await BackupLog.destroy({ where: { filename: req.params.filename } });

    await logAudit({
      req,
      action: "delete",
      module: "backup",
      description: `Deleted backup ${req.params.filename}`,
    });

    res.status(200).json({ success: true, message: "Backup deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete backup",
      error: error.message,
    });
  }
};

// POST /api/backups/:filename/restore — DESTRUCTIVE. Requires { confirm: true }.
export const restoreFromBackup = async (req, res) => {
  if (req.body?.confirm !== true) {
    return res.status(400).json({
      success: false,
      message:
        'Restoring will overwrite the live database. Resend with { "confirm": true }.',
    });
  }

  try {
    await restoreBackup(req.params.filename);

    await logAudit({
      req,
      action: "restore",
      module: "backup",
      description: `Restored database from backup ${req.params.filename}`,
    });

    res.status(200).json({
      success: true,
      message: `Database restored from ${req.params.filename}`,
    });
  } catch (error) {
    await logAudit({
      req,
      action: "restore",
      module: "backup",
      description: `Restore from ${req.params.filename} failed`,
      status: "failed",
    });

    res.status(500).json({
      success: false,
      message: "Failed to restore backup",
      error: error.message,
    });
  }
};

// GET /api/backups/status — quick summary for the Security Center dashboard.
export const getBackupStatus = async (req, res) => {
  try {
    const files = listBackupFiles();
    const totalSizeBytes = files.reduce(
      (sum, f) => sum + Number(f.sizeBytes || 0),
      0,
    );
    const lastFailed = await BackupLog.findOne({
      where: { status: "failed" },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        totalBackups: files.length,
        totalSizeBytes,
        lastBackupAt: files[0]?.createdAt || null,
        lastFailedAt: lastFailed?.createdAt || null,
        scheduleEnabled: process.env.BACKUP_SCHEDULE_ENABLED !== "false",
        scheduleCron: process.env.BACKUP_CRON || "0 2 * * *",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load backup status",
      error: error.message,
    });
  }
};
