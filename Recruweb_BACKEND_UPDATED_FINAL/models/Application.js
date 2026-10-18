import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jobId: { type: DataTypes.INTEGER, allowNull: false },
    // FK to the staff User (recruiter/HR) who last reviewed this application (see models/index.js).
    reviewedById: { type: DataTypes.INTEGER, allowNull: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("email", value ? value.toLowerCase().trim() : value);
      },
    },
    phone: { type: DataTypes.STRING, allowNull: false },
    resume: { type: DataTypes.STRING, allowNull: true },
    linkedIn: { type: DataTypes.STRING, allowNull: true },
    portfolio: { type: DataTypes.STRING, allowNull: true },
    coverLetter: { type: DataTypes.TEXT, allowNull: true },
    experience: { type: DataTypes.STRING, allowNull: true },
    currentCompany: { type: DataTypes.STRING, allowNull: true },
    currentPosition: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        "new",
        "reviewed",
        "shortlisted",
        "interview",
        "offered",
        "rejected",
      ),
      defaultValue: "new",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },

    // ---- Candidate Assignment (Applied Candidate Module) ----
    // FK to the staff User (recruiter/HR) this application is assigned to
    // for follow-up. Populated via PUT /api/applications/:id/assign.
    assignedToId: { type: DataTypes.INTEGER, allowNull: true },

    // ---- Resume Screening (Applied Candidate Module) ----
    // Computed automatically at apply-time (if a resume file was uploaded)
    // and re-computable on demand via POST /api/applications/:id/screen.
    // resumeScore: 0-100 composite score (keyword match + AI, when configured).
    resumeScore: { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
    resumeSkills: { type: DataTypes.JSON, defaultValue: [] },
    resumeSummary: { type: DataTypes.TEXT, allowNull: true },
    screeningMethod: { type: DataTypes.STRING, allowNull: true }, // 'keyword' | 'ai' | 'ai+keyword'
    screenedAt: { type: DataTypes.DATE, allowNull: true },

    // ---- Status Tracking (Applied Candidate Module) ----
    // Append-only history of every stage change:
    // [{ status, notes, changedById, changedByName, changedAt }]
    statusHistory: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    indexes: [
      { fields: ["jobId"] },
      { fields: ["status"] },
      { fields: ["email"] },
      { fields: ["reviewedById"] },
      { fields: ["assignedToId"] },
    ],
  },
);

export default Application;
