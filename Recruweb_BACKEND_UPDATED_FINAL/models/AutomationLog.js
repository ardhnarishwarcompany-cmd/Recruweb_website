import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const AutomationLog = sequelize.define(
  "AutomationLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // =====================================================
    // NEW SYSTEM — Logged-in user who initiated the message
    // =====================================================
    senderUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // =====================================================
    // RECIPIENT DETAILS
    // =====================================================

    recipientName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    recipientPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Invalid recipient email",
        },
      },
    },

    // =====================================================
    // CHANNEL
    // Existing system supports email + new WhatsApp/SMS
    // =====================================================

    channel: {
      type: DataTypes.ENUM("email", "whatsapp", "sms"),
      allowNull: false,
    },

    // =====================================================
    // EXISTING AUTOMATION TYPE
    // =====================================================

    type: {
      type: DataTypes.ENUM(
        "interview_reminder",
        "joining_reminder",
        "interview_invite",
        "offer",
        "rejection",
        "follow_up",
        "manual",
        "custom"
      ),
      allowNull: true,
      defaultValue: "manual",
    },

    // =====================================================
    // EXISTING RELATED RECORD
    // =====================================================

    relatedType: {
      type: DataTypes.ENUM(
        "candidate",
        "employeeJoining",
        "client",
        "general"
      ),
      allowNull: true,
      defaultValue: "general",
    },

    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // =====================================================
    // LEGACY / GENERAL RECIPIENT
    // Existing automation code may still use this field.
    // =====================================================

    recipient: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // =====================================================
    // MESSAGE
    // =====================================================

    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // =====================================================
    // DELIVERY STATUS
    // =====================================================

    status: {
      type: DataTypes.ENUM(
        "queued",
        "sending",
        "sent",
        "delivered",
        "failed",
        "skipped_not_configured"
      ),
      allowNull: false,
      defaultValue: "queued",
    },

    // =====================================================
    // PROVIDER INFORMATION
    // =====================================================

    provider: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    providerMessageId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    providerResponse: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // =====================================================
    // ERROR INFORMATION
    // =====================================================

    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Existing automation error field
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // =====================================================
    // DRAFT
    // =====================================================

    draftId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // =====================================================
    // SCHEDULING
    // =====================================================

    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // =====================================================
    // EXISTING AUTOMATION USER
    // =====================================================

    triggeredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },

  {
    tableName: "automation_logs",

    timestamps: true,

    indexes: [
      {
        fields: ["senderUserId"],
      },
      {
        fields: ["recipientPhone"],
      },
      {
        fields: ["recipient"],
      },
      {
        fields: ["channel"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["relatedType"],
      },
      {
        fields: ["triggeredBy"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

export default AutomationLog;