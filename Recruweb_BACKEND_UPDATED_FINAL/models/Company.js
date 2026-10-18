import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Company = sequelize.define(
  "Company",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    logo: { type: DataTypes.STRING, allowNull: true },
    industry: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    website: { type: DataTypes.STRING, allowNull: true },
    size: {
      type: DataTypes.ENUM(
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1000+",
      ),
      allowNull: false,
    },
    location: { type: DataTypes.STRING, allowNull: false },
    founded: { type: DataTypes.INTEGER, allowNull: true },
    specialties: { type: DataTypes.JSON, defaultValue: [] },
    hiringFor: { type: DataTypes.JSON, defaultValue: [] },
    activeJobs: { type: DataTypes.INTEGER, defaultValue: 0 },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    indexes: [
      { fields: ["industry"] },
      { fields: ["featured"] },
      { fields: ["isVerified"] },
    ],
  },
);

export default Company;
