import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Free Hiring Resource Center — HR Compliance Checklists (e.g. New Employee
// Onboarding, PF & ESI, POSH, Exit Formalities). `items` is a JSON array of
// { text, description } checklist rows, edited from the admin panel and
// rendered/downloaded on the public site.
const ComplianceChecklist = sequelize.define(
  "ComplianceChecklist",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: true }, // e.g. "Onboarding", "Statutory", "POSH", "Exit"
    description: { type: DataTypes.TEXT, allowNull: true },
    items: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },

    downloadCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
    displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    indexes: [{ fields: ["category"] }, { fields: ["isPublished"] }],
  },
);

export default ComplianceChecklist;
