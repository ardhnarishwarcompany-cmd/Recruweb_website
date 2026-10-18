import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// CRM — a hiring requirement/vacancy raised by a client.
const CrmRequirement = sequelize.define(
  "CrmRequirement",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    department: { type: DataTypes.STRING, allowNull: true },
    positions: { type: DataTypes.INTEGER, defaultValue: 1 },
    positionsFilled: { type: DataTypes.INTEGER, defaultValue: 0 },
    skillsRequired: { type: DataTypes.JSON, defaultValue: [] },
    experienceLevel: { type: DataTypes.STRING, allowNull: true },
    employmentType: {
      type: DataTypes.ENUM(
        "full-time",
        "part-time",
        "contract",
        "internship",
        "temporary",
      ),
      defaultValue: "full-time",
    },
    location: { type: DataTypes.STRING, allowNull: true },
    salaryMin: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    salaryMax: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("open", "on-hold", "closed", "filled", "cancelled"),
      defaultValue: "open",
    },
    targetDate: { type: DataTypes.DATE, allowNull: true },
    assignedRecruiterId: { type: DataTypes.INTEGER, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "crm_requirements",
    indexes: [
      { fields: ["clientId"] },
      { fields: ["status"] },
      { fields: ["priority"] },
      { fields: ["assignedRecruiterId"] },
    ],
  },
);

export default CrmRequirement;
