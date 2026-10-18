import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Message = sequelize.define(
  "Message",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "assistant"), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    metadata: { type: DataTypes.JSON, allowNull: true },
  },
  {
    indexes: [{ fields: ["sessionId"] }],
  },
);

export default Message;
