import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Candidate Portal — "Chat With Recruiter". Mirrors ClientMessage but for
// candidates. Also carries real-time video/voice call invites (type=
// "call_invite") generated through the same free Jitsi rooms used by
// Interview Scheduling (Phase 2), and AI-drafted messages (type="ai") when
// either side asks the in-chat AI assistant a question.
const CandidateMessage = sequelize.define(
  "CandidateMessage",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    candidateId: { type: DataTypes.INTEGER, allowNull: false }, // Candidates.id

    senderId: { type: DataTypes.INTEGER, allowNull: false }, // Users.id (or 0 for the AI assistant)
    senderRole: {
      type: DataTypes.ENUM("candidate", "staff", "ai"),
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("text", "call_invite", "ai"),
      defaultValue: "text",
    },
    message: { type: DataTypes.TEXT, allowNull: false },
    meetingLink: { type: DataTypes.STRING, allowNull: true }, // set when type = call_invite

    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "candidate_messages",
    indexes: [{ fields: ["candidateId"] }, { fields: ["createdAt"] }],
  },
);

export default CandidateMessage;
