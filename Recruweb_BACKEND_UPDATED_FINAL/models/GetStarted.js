import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// This model powers the "Client Inquiry" / Get Started form on the
// public website, where prospective client companies request services.
const GetStarted = sequelize.define(
  "GetStarted",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    companyName: { type: DataTypes.STRING, allowNull: false },
    contactPerson: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("email", value ? value.toLowerCase().trim() : value);
      },
    },
    phone: { type: DataTypes.STRING, allowNull: false },
    employees: { type: DataTypes.STRING, allowNull: false }, // Changed from INTEGER to STRING
    services: { type: DataTypes.JSON, defaultValue: [] },
    message: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        "new",
        "contacted",
        "in-progress",
        "completed",
        "cancelled",
      ),
      defaultValue: "new",
    },
  },
  {
    indexes: [{ fields: ["status"] }, { fields: ["email"] }],
  },
);

export default GetStarted;