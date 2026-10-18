import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Free Hiring Resource Center — Salary Guides (Noida, Delhi NCR, BPO, Sales, IT ...)
// Each row is one role/location/experience-band salary benchmark. Publicly
// readable; managed by Admin/HR/Recruitment Manager (MANAGE_RESOURCES).
const SalaryGuide = sequelize.define(
  "SalaryGuide",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    roleTitle: { type: DataTypes.STRING, allowNull: false }, // e.g. "Telecaller", "React Developer"
    category: { type: DataTypes.STRING, allowNull: false }, // "Noida" | "Delhi NCR" | "BPO" | "Sales" | "IT" | custom
    experienceLevel: {
      type: DataTypes.ENUM("fresher", "entry", "mid", "senior", "leadership"),
      defaultValue: "entry",
    },

    minSalary: { type: DataTypes.INTEGER, allowNull: false }, // monthly, INR
    maxSalary: { type: DataTypes.INTEGER, allowNull: false },
    avgSalary: { type: DataTypes.INTEGER, allowNull: true },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },

    notes: { type: DataTypes.TEXT, allowNull: true },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
    displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    indexes: [{ fields: ["category"] }, { fields: ["isPublished"] }],
  },
);

export default SalaryGuide;
