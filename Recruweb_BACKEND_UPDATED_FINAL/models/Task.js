import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Recruiter task / reminder (simple CRM operations feature)
const Task = sequelize.define(
  "Task",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    relatedType: {
      type: DataTypes.ENUM("candidate", "client", "job", "general", "project"),
      defaultValue: "general",
    },
    relatedId: { type: DataTypes.INTEGER, allowNull: true },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("pending", "in-progress", "done"),
      defaultValue: "pending",
    },
    // Legacy free-text assignee (kept for backward compatibility with existing data).
    assignedTo: { type: DataTypes.STRING, allowNull: true },
    // Proper FK to the staff User this task is assigned to (see models/index.js).
    assignedToId: { type: DataTypes.INTEGER, allowNull: true },
    taskType: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "recruiter_task",
    },
    projectName: { type: DataTypes.STRING(180), allowNull: true },
    instructions: { type: DataTypes.TEXT, allowNull: true },
    estimatedMinutes: { type: DataTypes.INTEGER, allowNull: true },
    interviewId: { type: DataTypes.INTEGER, allowNull: true },
    submissionUrl: { type: DataTypes.STRING(1000), allowNull: true },
    submissionNotes: { type: DataTypes.TEXT, allowNull: true },
    candidateStatus: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "assigned",
    },
    assignedAt: { type: DataTypes.DATE, allowNull: true },
    submittedAt: { type: DataTypes.DATE, allowNull: true },
    reviewedAt: { type: DataTypes.DATE, allowNull: true },
    reviewerFeedback: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    indexes: [
      { fields: ["status"] },
      { fields: ["priority"] },
      { fields: ["assignedToId"] },
      { fields: ["relatedType", "relatedId"] },
    ],
  },
);

export default Task;
