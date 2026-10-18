import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Free Hiring Resource Center — Interview Question Bank.
const InterviewQuestion = sequelize.define(
  "InterviewQuestion",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    category: { type: DataTypes.STRING, allowNull: false }, // e.g. "HR Round", "IT / Technical", "Sales", "BPO"
    question: { type: DataTypes.TEXT, allowNull: false },
    answerTips: { type: DataTypes.TEXT, allowNull: true }, // suggested/ideal answer or interviewer tip
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      defaultValue: "medium",
    },

    isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
    displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    indexes: [{ fields: ["category"] }, { fields: ["isPublished"] }],
  },
);

export default InterviewQuestion;
