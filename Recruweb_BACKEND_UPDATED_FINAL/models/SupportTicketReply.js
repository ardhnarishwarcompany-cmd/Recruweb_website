import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Reply on a SupportTicket thread — merged in from D RTPN.
const SupportTicketReply = sequelize.define(
  "SupportTicketReply",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    ticketId: { type: DataTypes.INTEGER, allowNull: false },
    authorUserId: { type: DataTypes.INTEGER, allowNull: false },

    message: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "support_ticket_replies",
    timestamps: true,
    indexes: [{ fields: ["ticketId"] }],
  },
);

export default SupportTicketReply;
