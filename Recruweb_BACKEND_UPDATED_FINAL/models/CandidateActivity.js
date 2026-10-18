import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Recruiter Workspace — a logged activity performed by a recruiter against a
// candidate (call, interview, join, etc). This is the single source of truth
// for the Recruiter Performance stats (Calls / Interviews / Joins /
// Conversion Ratio) — every count on that panel comes from real rows here,
// never from hard-coded or sample numbers.
const CandidateActivity = sequelize.define(
  "CandidateActivity",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    candidateId: { type: DataTypes.INTEGER, allowNull: false },
    recruiterId: { type: DataTypes.INTEGER, allowNull: false },
    requirementId: { type: DataTypes.INTEGER, allowNull: true },

    type: {
      type: DataTypes.ENUM(
        "call",
        "interview",
        "join",
        "email",
        "whatsapp",
        "note",
      ),
      allowNull: false,
      defaultValue: "call",
    },

    outcome: {
      type: DataTypes.ENUM(
        "connected",
        "no-answer",
        "interested",
        "not-interested",
        "callback-requested",
        "scheduled",
        "cleared",
        "rejected",
        "offer-released",
        "joined",
        "other",
      ),
      allowNull: true,
    },

    notes: { type: DataTypes.TEXT, allowNull: true },
    durationMinutes: { type: DataTypes.INTEGER, allowNull: true },
    activityDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "candidate_activities",
    indexes: [
      { fields: ["candidateId"] },
      { fields: ["recruiterId"] },
      { fields: ["type"] },
      { fields: ["activityDate"] },
    ],
  },
);

export default CandidateActivity;
