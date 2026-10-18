import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// CRM — a contact person belonging to a client (and/or company).
const CrmContact = sequelize.define(
  "CrmContact",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER, allowNull: true },
    companyId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    designation: { type: DataTypes.STRING, allowNull: true },
    department: { type: DataTypes.STRING, allowNull: true },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        this.setDataValue(
          "email",
          value ? value.toLowerCase().trim() : value,
        );
      },
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    alternatePhone: { type: DataTypes.STRING, allowNull: true },
    linkedin: { type: DataTypes.STRING, allowNull: true },
    isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "crm_contacts",
    indexes: [{ fields: ["clientId"] }, { fields: ["companyId"] }, { fields: ["email"] }],
  },
);

export default CrmContact;
