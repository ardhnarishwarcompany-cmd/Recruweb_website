import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Client Portal (Phase 7) — "Chat With Recruiter". A single real-time-ish
// thread per client account, between the client's own login and their
// assigned account manager/recruiter (staff). Every row is a real message
// either party actually sent — no simulated conversation.
const ClientMessage = sequelize.define(
  "ClientMessage",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    clientId: { type: DataTypes.INTEGER, allowNull: false },

    senderId: { type: DataTypes.INTEGER, allowNull: false }, // Users.id
    senderRole: {
      type: DataTypes.ENUM("client", "staff", "ai"),
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("text", "call_invite", "ai"),
      defaultValue: "text",
    },
    meetingLink: { type: DataTypes.STRING, allowNull: true }, // set when type = call_invite

    message: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "client_messages",
    indexes: [{ fields: ["clientId"] }, { fields: ["createdAt"] }],
  },
);

export default ClientMessage;
