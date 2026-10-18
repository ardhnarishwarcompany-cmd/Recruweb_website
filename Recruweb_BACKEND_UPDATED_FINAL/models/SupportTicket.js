import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Support ticket — merged in from D RTPN. A lightweight help-desk thread,
// separate from Recruweb's existing Client Chat / Candidate Chat (those are
// live conversations with a recruiter about a specific submission/job;
// this is a formal issue/request with a status and priority, same
// distinction D drew between SupportTicket and its Message model).
export const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"];
export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"];

const SupportTicket = sequelize.define(
  "SupportTicket",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    raisedByUserId: { type: DataTypes.INTEGER, allowNull: false },
    assignedToUserId: { type: DataTypes.INTEGER, allowNull: true },

    subject: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: true }, // e.g. "Billing", "Vacancy", "Technical", "Other"

    status: {
      type: DataTypes.ENUM(...TICKET_STATUSES),
      defaultValue: "open",
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM(...TICKET_PRIORITIES),
      defaultValue: "medium",
      allowNull: false,
    },

    resolvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "support_tickets",
    timestamps: true,
    indexes: [{ fields: ["raisedByUserId"] }, { fields: ["status"] }],
  },
);

export default SupportTicket;
