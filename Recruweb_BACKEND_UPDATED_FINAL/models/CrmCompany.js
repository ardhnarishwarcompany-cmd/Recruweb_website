import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// CRM — a company/organization record used to group clients & contacts.
// Distinct from the public-facing `Company` model (careers page listings).
const CrmCompany = sequelize.define(
  "CrmCompany",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    industry: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    size: {
      type: DataTypes.ENUM(
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1000+",
      ),
      allowNull: true,
    },
    gstNumber: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "crm_companies",
    indexes: [{ fields: ["name"] }, { fields: ["industry"] }],
  },
);

export default CrmCompany;
