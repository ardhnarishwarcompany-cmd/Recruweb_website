import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Stores every resume a candidate builds with the Resume Builder (Enhancv-style
// template + wizard tool). `data` holds the full structured resume content
// (personal info, summary, experience, education, skills, projects,
// certifications, languages, achievements) as real, user-entered JSON —
// never placeholder/dummy content. `atsScore` / `atsSummary` / `atsSuggestions`
// are populated by the real OpenAI-backed scoring pass (or the deterministic
// keyword-based fallback when no OPENAI_API_KEY is configured).
const Resume = sequelize.define(
  "Resume",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    userId: { type: DataTypes.INTEGER, allowNull: false },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "My Resume",
    },

    templateId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "modern-sidebar",
    },

    accentColor: { type: DataTypes.STRING, allowNull: true, defaultValue: "#2E5AAC" },

    // Full structured resume content — see resumeController.js for shape.
    data: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },

    targetJobTitle: { type: DataTypes.STRING, allowNull: true },
    targetJobDescription: { type: DataTypes.TEXT, allowNull: true },

    atsScore: { type: DataTypes.INTEGER, allowNull: true },
    atsSummary: { type: DataTypes.TEXT, allowNull: true },
    atsSuggestions: { type: DataTypes.JSON, defaultValue: [] },
    atsKeywordMatches: { type: DataTypes.JSON, defaultValue: [] },
    atsMissingKeywords: { type: DataTypes.JSON, defaultValue: [] },
    atsScoredAt: { type: DataTypes.DATE, allowNull: true },

    isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "Resumes",
    timestamps: true,
  },
);

export default Resume;
