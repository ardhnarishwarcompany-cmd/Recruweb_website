import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Company branches / offices. Users (staff) can be assigned to a branch so
// Super Admin can organize recruiters/HR by location for reporting & access.
const Branch = sequelize.define(
  "Branch",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: true, unique: true }, // short code e.g. "DEL-01"
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true, defaultValue: "India" },
    pincode: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    isHeadOffice: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    indexes: [{ fields: ["isActive"] }, { fields: ["city"] }],
  },
);

export default Branch;
