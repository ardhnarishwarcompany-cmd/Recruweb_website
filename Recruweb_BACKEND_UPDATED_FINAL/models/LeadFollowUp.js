import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Lead CRM — a follow-up activity (call, email, meeting, note) logged
// against a lead, used to build the follow-up history/timeline.
const LeadFollowUp = sequelize.define(
  "LeadFollowUp",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    leadId: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM("call", "email", "meeting", "whatsapp", "note"),
      defaultValue: "call",
    },
    notes: { type: DataTypes.TEXT, allowNull: false },
    outcome: {
      type: DataTypes.ENUM(
        "no-answer",
        "interested",
        "not-interested",
        "callback-requested",
        "info-shared",
        "other",
      ),
      allowNull: true,
    },
    followUpDate: { type: DataTypes.DATE, allowNull: false },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "lead_follow_ups",
    indexes: [
      { fields: ["leadId"] },
      { fields: ["followUpDate"] },
      { fields: ["completed"] },
    ],
  },
);

export default LeadFollowUp;
