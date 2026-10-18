import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const SopInbox = sequelize.define("SopInbox", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sopId: { type: DataTypes.INTEGER, allowNull: false },
  recipientUserId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "approved", "later", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  },
  note: { type: DataTypes.TEXT, allowNull: true },
  emailSubject: { type: DataTypes.STRING(255), allowNull: false },
  emailBody: { type: DataTypes.TEXT("long"), allowNull: false },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
  rejectedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  indexes: [
    { fields: ["recipientUserId", "status"] },
    { unique: true, fields: ["sopId", "recipientUserId"] },
  ],
});

export default SopInbox;
