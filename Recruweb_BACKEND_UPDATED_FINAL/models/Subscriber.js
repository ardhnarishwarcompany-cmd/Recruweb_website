import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Subscriber = sequelize.define(
  "Subscriber",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("email", value ? value.toLowerCase().trim() : value);
      },
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    subscribedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    indexes: [{ unique: true, fields: ["email"] }, { fields: ["isActive"] }],
  },
);

export default Subscriber;
