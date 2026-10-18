import { send } from "./email.js";
import { AutomationLog } from "../models/index.js";

// Phase 8 — Email Automation. Thin wrapper around the existing SMTP
// transporter (utils/email.js) that additionally records every send in
// AutomationLog so the Admin > Automation screen has a real, queryable
// history — reminders, interview invites, offers, rejections, follow-ups.
//
// utils/email.js falls back to nodemailer's jsonTransport (no real delivery)
// when SMTP_HOST/USER/PASS aren't set in .env, so this wrapper checks that
// same condition first and logs 'skipped_not_configured' instead of 'sent'
// — matching the honest-by-default behaviour of whatsapp.js/sms.js.
const isSmtpConfigured = () =>
  !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export const sendAutomatedEmail = async ({
  to,
  subject,
  html,
  type = "manual",
  relatedType = "general",
  relatedId = null,
  triggeredBy = null,
}) => {
  if (!isSmtpConfigured()) {
    await AutomationLog.create({
      channel: "email",
      type,
      relatedType,
      relatedId,
      recipient: to,
      subject,
      message: html,
      status: "skipped_not_configured",
      error: "SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing in .env)",
      triggeredBy,
    });
    return { success: false, skipped: true, reason: "not_configured" };
  }

  try {
    await send({ to, subject, html });
    await AutomationLog.create({
      channel: "email",
      type,
      relatedType,
      relatedId,
      recipient: to,
      subject,
      message: html,
      status: "sent",
      triggeredBy,
    });
    return { success: true };
  } catch (err) {
    await AutomationLog.create({
      channel: "email",
      type,
      relatedType,
      relatedId,
      recipient: to,
      subject,
      message: html,
      status: "failed",
      error: err.message,
      triggeredBy,
    });
    return { success: false, error: err.message };
  }
};
