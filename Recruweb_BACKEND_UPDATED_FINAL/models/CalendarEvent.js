import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Recruiter Workspace — Calendar & Reminders.
// A single table backs both: a "reminder" is simply an event with
// isReminder=true (short standalone nudge), while meetings/interviews/calls
// use the fuller start/end time fields for the calendar view.
const CalendarEvent = sequelize.define(
  "CalendarEvent",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },

    eventType: {
      type: DataTypes.ENUM(
        "meeting",
        "interview",
        "call",
        "follow-up",
        "reminder",
        "other",
      ),
      defaultValue: "other",
    },

    isReminder: { type: DataTypes.BOOLEAN, defaultValue: false },

    startAt: { type: DataTypes.DATE, allowNull: false },
    endAt: { type: DataTypes.DATE, allowNull: true },

    relatedType: {
      type: DataTypes.ENUM("candidate", "job", "client", "general"),
      defaultValue: "general",
    },
    relatedId: { type: DataTypes.INTEGER, allowNull: true },

    location: { type: DataTypes.STRING, allowNull: true },

    // ---- Video Interview support (Phase 2 — AI Interview Scheduling) ----
    interviewMode: {
      type: DataTypes.ENUM("video", "phone", "onsite"),
      allowNull: true,
    },
    interviewRound: { type: DataTypes.STRING, allowNull: true }, // e.g. "HR Round", "Technical Round 1"
    durationMinutes: { type: DataTypes.INTEGER, defaultValue: 30 },
    meetingRoomId: { type: DataTypes.STRING, allowNull: true }, // unique Jitsi room name
    meetingLink: { type: DataTypes.STRING, allowNull: true }, // full https://meet.jit.si/<room> link
    interviewerIds: { type: DataTypes.JSON, defaultValue: [] }, // staff User ids invited to join
    feedback: { type: DataTypes.TEXT, allowNull: true }, // post-interview interviewer feedback
    rating: { type: DataTypes.INTEGER, allowNull: true }, // 1-5 interviewer rating
    clientVisible: { type: DataTypes.BOOLEAN, defaultValue: true }, // show on client portal

    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled"),
      defaultValue: "scheduled",
    },

    // Phase 8 — Automation: set once an automated reminder has actually
    // been sent for this event, so the cron job never re-sends it.
    reminderSentAt: { type: DataTypes.DATE, allowNull: true },

    // The recruiter (staff User) this event/reminder belongs to.
    ownerId: { type: DataTypes.INTEGER, allowNull: false },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "calendar_events",
    indexes: [
      { fields: ["ownerId"] },
      { fields: ["startAt"] },
      { fields: ["isReminder"] },
      { fields: ["status"] },
      { fields: ["relatedType", "relatedId"] },
    ],
  },
);

export default CalendarEvent;
