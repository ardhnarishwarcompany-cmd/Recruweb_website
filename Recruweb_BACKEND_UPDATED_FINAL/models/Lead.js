import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Lead CRM — inbound inquiries captured from the public "New Inquiry" form
// (and other sources), tracked through the sales funnel until they are
// either converted into a CrmClient or marked lost.
const Lead = sequelize.define(
  "Lead",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    leadCode: { type: DataTypes.STRING, allowNull: true, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue(
          "email",
          value ? value.toLowerCase().trim() : value,
        );
      },
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    companyName: { type: DataTypes.STRING, allowNull: true },
    designation: { type: DataTypes.STRING, allowNull: true },
    industry: { type: DataTypes.STRING, allowNull: true },
    requirement: { type: DataTypes.TEXT, allowNull: true },
    positionsNeeded: { type: DataTypes.INTEGER, allowNull: true },
    budget: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
    source: {
      type: DataTypes.ENUM(
        "website",
        "referral",
        "cold-call",
        "social-media",
        "email-campaign",
        "event",
        "job-portal",
        "other",
      ),
      defaultValue: "website",
    },
    status: {
      type: DataTypes.ENUM(
        "new",
        "contacted",
        "qualified",
        "proposal-sent",
        "negotiation",
        "converted",
        "lost",
      ),
      defaultValue: "new",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    assignedToId: { type: DataTypes.INTEGER, allowNull: true },
    assignedAt: { type: DataTypes.DATE, allowNull: true },
    lastContactedAt: { type: DataTypes.DATE, allowNull: true },
    nextFollowUpDate: { type: DataTypes.DATE, allowNull: true },
    lostReason: { type: DataTypes.STRING, allowNull: true },
    convertedClientId: { type: DataTypes.INTEGER, allowNull: true },
    convertedAt: { type: DataTypes.DATE, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "leads",
    indexes: [
      { fields: ["status"] },
      { fields: ["priority"] },
      { fields: ["assignedToId"] },
      { fields: ["email"] },
      { fields: ["source"] },
    ],
  },
);

export default Lead;
