import cron from "node-cron";
import { Op } from "sequelize";
import { CalendarEvent, Candidate, EmployeeJoining } from "../models/index.js";
import { sendAutomatedEmail } from "./emailAutomation.js";
import { sendWhatsAppMessage } from "./whatsapp.js";
import { sendSms } from "./sms.js";

// Phase 8 — Automation: Interview Reminders & Joining Reminders.
// Runs every 30 minutes. Sends a reminder (email + WhatsApp + SMS, each
// gracefully skipped if that channel isn't configured — see the
// respective util) for:
//   1) Interviews (CalendarEvent, eventType='interview') starting within
//      the next 24 hours that haven't been reminded yet.
//   2) New joiners (EmployeeJoining) whose joiningDate is tomorrow and
//      who haven't been reminded yet.
// Every send is recorded for real in AutomationLog by the channel utils.

const buildInterviewMessage = (candidateName, event) =>
  `Hi ${candidateName}, this is a reminder for your interview "${event.title}" ` +
  `scheduled on ${new Date(event.startAt).toLocaleString("en-IN")}` +
  (event.location ? ` at ${event.location}` : "") +
  `. Please be on time. — Recruweb`;

const buildJoiningMessage = (name, joiningDate) =>
  `Hi ${name}, this is a reminder that your joining date is ${joiningDate}. ` +
  `Please carry your original documents. — Recruweb HR`;

export const runInterviewReminders = async () => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const events = await CalendarEvent.findAll({
    where: {
      eventType: "interview",
      status: "scheduled",
      startAt: { [Op.between]: [now, in24h] },
      reminderSentAt: null,
    },
  });

  for (const event of events) {
    let candidate = null;
    if (event.relatedType === "candidate" && event.relatedId) {
      candidate = await Candidate.findByPk(event.relatedId);
    }
    const name = candidate
      ? `${candidate.firstName} ${candidate.lastName || ""}`.trim()
      : event.title;
    const message = buildInterviewMessage(name, event);

    if (candidate?.email) {
      await sendAutomatedEmail({
        to: candidate.email,
        subject: `Interview Reminder — ${event.title}`,
        html: `<p>${message}</p>`,
        type: "interview_reminder",
        relatedType: "candidate",
        relatedId: candidate.id,
      });
    }
    if (candidate?.phone) {
      await sendWhatsAppMessage({
        to: candidate.phone,
        message,
        type: "interview_reminder",
        relatedType: "candidate",
        relatedId: candidate.id,
      });
      await sendSms({
        to: candidate.phone,
        message,
        type: "interview_reminder",
        relatedType: "candidate",
        relatedId: candidate.id,
      });
    }

    await event.update({ reminderSentAt: new Date() });
  }

  return events.length;
};

export const runJoiningReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const joiners = await EmployeeJoining.findAll({
    where: {
      joiningDate: tomorrowStr,
      reminderSentAt: null,
    },
  });

  for (const joiner of joiners) {
    const name = `${joiner.firstName} ${joiner.lastName || ""}`.trim();
    const message = buildJoiningMessage(name, joiner.joiningDate);

    if (joiner.email) {
      await sendAutomatedEmail({
        to: joiner.email,
        subject: "Joining Reminder — Recruweb",
        html: `<p>${message}</p>`,
        type: "joining_reminder",
        relatedType: "employeeJoining",
        relatedId: joiner.id,
      });
    }
    if (joiner.phone) {
      await sendWhatsAppMessage({
        to: joiner.phone,
        message,
        type: "joining_reminder",
        relatedType: "employeeJoining",
        relatedId: joiner.id,
      });
      await sendSms({
        to: joiner.phone,
        message,
        type: "joining_reminder",
        relatedType: "employeeJoining",
        relatedId: joiner.id,
      });
    }

    await joiner.update({ reminderSentAt: new Date() });
  }

  return joiners.length;
};

let scheduled = false;

export const startAutomationScheduler = () => {
  if (scheduled) return;
  scheduled = true;

  // Every 30 minutes.
  cron.schedule("*/30 * * * *", async () => {
    try {
      const interviews = await runInterviewReminders();
      const joinings = await runJoiningReminders();
      if (interviews || joinings) {
        console.log(
          `[automation] Sent ${interviews} interview reminder(s), ${joinings} joining reminder(s).`,
        );
      }
    } catch (err) {
      console.error("[automation] Reminder cron failed:", err.message);
    }
  });

  console.log("[automation] Reminder scheduler started (every 30 min).");
};
