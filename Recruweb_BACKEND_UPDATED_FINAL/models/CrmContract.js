import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// CRM — a commercial contract/agreement signed with a client.
const CrmContract = sequelize.define(
  "CrmContract",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    contractNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM(
        "retainer",
        "contingency",
        "rpo",
        "staffing",
        "other",
      ),
      defaultValue: "contingency",
    },
    value: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    feePercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    startDate: { type: DataTypes.DATE, allowNull: true },
    endDate: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "pending-signature",
        "active",
        "expired",
        "terminated",
      ),
      defaultValue: "draft",
    },
    terms: { type: DataTypes.TEXT, allowNull: true },
    documentUrl: { type: DataTypes.STRING, allowNull: true },
    signedBy: { type: DataTypes.STRING, allowNull: true },
    signedDate: { type: DataTypes.DATE, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "crm_contracts",
    indexes: [{ fields: ["clientId"] }, { fields: ["status"] }],
  },
);

export default CrmContract;
