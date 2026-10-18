import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Job = sequelize.define(
  "Job",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
company: {
      // Public/admin job forms submit the company name as text. The previous
      // INTEGER definition caused the jobs listing to fail when real job
      // records contained company names.
      type: DataTypes.STRING,
      allowNull: false,
    },    location: { type: DataTypes.STRING, allowNull: false },
    jobType: {
      type: DataTypes.ENUM(
        "full-time",
        "part-time",
        "contract",
        "internship",
        "remote",
      ),
      allowNull: false,
    },
    experience: {
      type: DataTypes.ENUM(
        "fresher",
        "1-2 years",
        "3-5 years",
        "5-10 years",
        "10+ years",
      ),
      allowNull: false,
    },
    salaryMin: { type: DataTypes.FLOAT, allowNull: true },
    salaryMax: { type: DataTypes.FLOAT, allowNull: true },
    salaryCurrency: { type: DataTypes.STRING, defaultValue: "INR" },
    description: { type: DataTypes.TEXT, allowNull: false },
    requirements: { type: DataTypes.JSON, defaultValue: [] },
    responsibilities: { type: DataTypes.JSON, defaultValue: [] },
    skills: { type: DataTypes.JSON, defaultValue: [] },
    qualifications: { type: DataTypes.JSON, defaultValue: [] },
    benefits: { type: DataTypes.JSON, defaultValue: [] },
    openings: { type: DataTypes.INTEGER, defaultValue: 1 },
    department: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    applyUrl: { type: DataTypes.STRING, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
  {
    indexes: [
      { fields: ["isActive"] },
      { fields: ["featured"] },
      { fields: ["jobType"] },
      { fields: ["department"] },
      { fields: ["location"] },
    ],
  },
);

// Virtual-style getter so API responses keep the same nested "salary" shape
// the frontend already expects (salary.min / salary.max / salary.currency).
Job.prototype.toJSON = function () {
  const values = { ...this.get() };
  values.salary = {
    min: values.salaryMin,
    max: values.salaryMax,
    currency: values.salaryCurrency,
  };
  delete values.salaryMin;
  delete values.salaryMax;
  delete values.salaryCurrency;
  return values;
};

export default Job;
