import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const SopAssignment = sequelize.define(
  "SopAssignment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sopId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "approved", "later", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    readAt: { type: DataTypes.DATE, allowNull: true },
    actionAt: { type: DataTypes.DATE, allowNull: true },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
    emailSentAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "sop_assignments",
    indexes: [
      { unique: true, fields: ["sopId", "userId"] },
      { fields: ["userId", "status"] },
    ],
  },
);

export default SopAssignment;
