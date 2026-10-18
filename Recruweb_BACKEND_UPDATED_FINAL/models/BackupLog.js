import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Extra Module — Security: Backup System.
// One row per backup attempt (manual or scheduled). The actual .sql file
// lives on disk under backend/backups/ — this table is the searchable
// history/audit trail shown on the Super Admin > Backups screen.
const BackupLog = sequelize.define(
  "BackupLog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    filename: { type: DataTypes.STRING, allowNull: false },
    sizeBytes: { type: DataTypes.BIGINT, allowNull: true },

    type: {
      type: DataTypes.ENUM("manual", "scheduled"),
      defaultValue: "manual",
    },
    status: {
      type: DataTypes.ENUM("success", "failed"),
      defaultValue: "success",
    },
    errorMessage: { type: DataTypes.TEXT, allowNull: true },
    durationMs: { type: DataTypes.INTEGER, allowNull: true },

    // Denormalized actor info, same pattern as AuditLog.
    triggeredById: { type: DataTypes.INTEGER, allowNull: true },
    triggeredByName: { type: DataTypes.STRING, allowNull: true },
  },
  {
    indexes: [{ fields: ["createdAt"] }, { fields: ["status"] }],
  },
);

export default BackupLog;
