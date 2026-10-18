import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const HrmsSubscription = sequelize.define(
  "HrmsSubscription",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    invoiceId: { type: DataTypes.INTEGER, allowNull: true, unique: true },
    planId: { type: DataTypes.STRING, allowNull: false },
    planName: { type: DataTypes.STRING, allowNull: false },
    billingType: {
      type: DataTypes.ENUM("token", "monthly"),
      allowNull: false,
      defaultValue: "token",
    },
    employeeCount: { type: DataTypes.INTEGER, allowNull: true },
    monthlyPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    tokenAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    contractMonths: { type: DataTypes.INTEGER, defaultValue: 11 },
    status: {
      type: DataTypes.ENUM("pending", "active", "cancelled", "expired"),
      defaultValue: "pending",
    },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    endsAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "hrms_subscriptions",
    indexes: [
      { fields: ["clientId"] },
      { fields: ["planId"] },
      { fields: ["status"] },
    ],
  },
);

export default HrmsSubscription;
