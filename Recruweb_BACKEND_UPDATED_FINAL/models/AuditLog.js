import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Single table backs all three Audit Log views on the Super Admin panel:
//   - Login History   -> module = "auth", action in ("login_success","login_failed","logout")
//   - Activity Logs    -> every row (a general trail of who-did-what)
//   - Changes Tracking -> rows where `changes` is populated (create/update/delete
//                          of a record, with before/after values)
const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // Denormalized actor info so history survives even if the user is later deleted.
    userId: { type: DataTypes.INTEGER, allowNull: true },
    userName: { type: DataTypes.STRING, allowNull: true },
    userEmail: { type: DataTypes.STRING, allowNull: true },
    userRole: { type: DataTypes.STRING, allowNull: true },

    action: { type: DataTypes.STRING, allowNull: false }, // e.g. login_success, login_failed, create, update, delete, deactivate
    module: { type: DataTypes.STRING, allowNull: false }, // e.g. auth, user, branch, settings, job, application
    targetType: { type: DataTypes.STRING, allowNull: true }, // e.g. "User", "Branch"
    targetId: { type: DataTypes.STRING, allowNull: true },

    description: { type: DataTypes.STRING, allowNull: true },
    // { before: {...}, after: {...} } — only populated for change-tracking rows.
    changes: { type: DataTypes.JSON, allowNull: true },

    status: {
      type: DataTypes.ENUM("success", "failed"),
      defaultValue: "success",
    },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
    userAgent: { type: DataTypes.STRING, allowNull: true },
  },
  {
    indexes: [
      { fields: ["userId"] },
      { fields: ["action"] },
      { fields: ["module"] },
      { fields: ["createdAt"] },
    ],
  },
);

export default AuditLog;
