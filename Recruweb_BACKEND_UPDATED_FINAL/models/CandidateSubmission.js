import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Client Portal (Phase 7) — a candidate a recruiter has submitted against a
// client's open requirement, awaiting the client's review/approval. This is
// the real backing table for "Candidate Submissions" and the
// "Approve Candidates" / "Approve Offers" features on the Client Dashboard —
// every row here is created by a recruiter/staff action and updated by the
// client's own decisions, never mock data.
export const SUBMISSION_STATUSES = [
  "pending-admin-approval", // HR Partner/recruiter submitted; internal approval required before client sees it
  "admin-approved", // internal approval recorded; immediately forwarded to the client
  "admin-rejected", // internal review rejected the submission
  "submitted", // recruiter submitted candidate to client, awaiting client review
  "client-approved", // client approved the candidate for interview
  "client-rejected", // client rejected the candidate
  "interview-scheduled",
  "interview-completed",
  "offer-extended", // staff extended an offer, awaiting client's offer approval
  "offer-approved", // client approved the offer
  "offer-rejected", // client rejected the offer
  "withdrawn",
];

const CandidateSubmission = sequelize.define(
  "CandidateSubmission",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    candidateId: { type: DataTypes.INTEGER, allowNull: false },
    requirementId: { type: DataTypes.INTEGER, allowNull: false },
    clientId: { type: DataTypes.INTEGER, allowNull: false },

    status: {
      type: DataTypes.ENUM(...SUBMISSION_STATUSES),
      defaultValue: "submitted",
    },

    // Recruiter/staff notes shown to the client alongside the candidate.
    submissionNotes: { type: DataTypes.TEXT, allowNull: true },

    // Client's own remarks when approving/rejecting the candidate or offer.
    clientRemarks: { type: DataTypes.TEXT, allowNull: true },

    // Offer details — filled in by staff once an offer is extended, and
    // shown to the client for their Approve Offer decision.
    offerAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    offerCurrency: { type: DataTypes.STRING, defaultValue: "INR" },
    offerJoiningDate: { type: DataTypes.DATE, allowNull: true },
    offerNotes: { type: DataTypes.TEXT, allowNull: true },

    respondedAt: { type: DataTypes.DATE, allowNull: true },

    submittedById: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "candidate_submissions",
    indexes: [
      { fields: ["candidateId"] },
      { fields: ["requirementId"] },
      { fields: ["clientId"] },
      { fields: ["status"] },
    ],
  },
);

export default CandidateSubmission;
