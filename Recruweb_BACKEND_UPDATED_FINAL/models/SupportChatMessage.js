import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Direct live support conversation between an HR Partner and the agency's
// Admin/Support team. Only real messages are stored; there is no seeded data.
const SupportChatMessage = sequelize.define(
  "SupportChatMessage",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    participantUserId: { type: DataTypes.INTEGER, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    senderRole: {
      type: DataTypes.ENUM("hr_partner", "support"),
      allowNull: false,
    },
    message: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "support_chat_messages",
    indexes: [
      { fields: ["participantUserId"] },
      { fields: ["createdAt"] },
    ],
  },
);

export default SupportChatMessage;
