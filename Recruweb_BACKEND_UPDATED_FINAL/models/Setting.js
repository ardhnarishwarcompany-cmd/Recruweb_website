import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Generic key/value settings store, grouped by category so the Super Admin
// settings screen can render one tab per category (company, email, whatsapp, sms).
// `value` is JSON so each category can hold an arbitrary shaped object without
// needing a new table/migration every time a new setting is added.
const Setting = sequelize.define(
  "Setting",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category: {
      type: DataTypes.ENUM("company", "email", "whatsapp", "sms"),
      allowNull: false,
      unique: true,
    },
    value: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    updatedById: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    indexes: [{ unique: true, fields: ["category"] }],
  },
);

export default Setting;
