import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const AutomationDraft = sequelize.define(
  "AutomationDraft",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    channel: {
      type: DataTypes.ENUM("email", "whatsapp", "sms"),
      allowNull: false,
    },

    // Candidate selected from the system.
    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Used when manually entering a number/email.
    recipient: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    message: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },

    type: {
      type: DataTypes.ENUM(
        "manual",
        "custom",
        "interview_invite",
        "offer",
        "rejection",
        "follow_up",
      ),
      defaultValue: "manual",
      allowNull: false,
    },

    // WhatsApp can use normal text or approved template.
    messageMode: {
      type: DataTypes.ENUM("text", "template"),
      defaultValue: "text",
      allowNull: false,
    },

    // WhatsApp template fields.
    templateName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    templateLanguage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    templateVariables: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // User who created the draft.
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // User who last edited the draft.
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "automation_drafts",

    timestamps: true,

    indexes: [
      { fields: ["channel"] },
      { fields: ["candidateId"] },
      { fields: ["createdBy"] },
      { fields: ["createdAt"] },
    ],
  },
);

export default AutomationDraft;