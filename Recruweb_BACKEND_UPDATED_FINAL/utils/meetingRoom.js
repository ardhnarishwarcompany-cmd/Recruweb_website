import crypto from "crypto";
import { send } from "./email.js";

// Free, no-API-key video meeting rooms via the public Jitsi Meet server.
// Each interview gets a unique, hard-to-guess room name so links can't be
// stumbled into by outsiders. If/when the company sets up its own Jitsi
// (or Twilio/Daily/Agora) instance, only JITSI_DOMAIN needs to change here —
// every call site in the app already goes through this one helper.
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || "meet.jit.si";

export const generateMeetingRoom = (prefix = "recruweb-interview") => {
  const token = crypto.randomBytes(6).toString("hex");
  const roomId = `${prefix}-${Date.now()}-${token}`;
  return {
    roomId,
    meetingLink: `https://${JITSI_DOMAIN}/${roomId}`,
  };
};

const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Sends a real interview-confirmation email (via the app's existing SMTP
// config) to whoever needs to know — candidate, client, or an interviewer.
// Silently no-ops if `to` is missing so callers don't need to guard.
export const sendInterviewEmail = async ({ to, name, roundName, scheduledAt, mode, meetingLink, location, jobTitle }) => {
  if (!to) return;
  const when = fmtDateTime(scheduledAt);
  const joinBlock =
    mode === "video" && meetingLink
      ? `<p><strong>Video Interview Link:</strong><br/><a href="${meetingLink}">${meetingLink}</a></p>
         <p style="color:#555;font-size:13px">No download needed — this opens directly in your browser. Please join 5 minutes early and test your camera/microphone.</p>`
      : mode === "phone"
      ? `<p>This will be a <strong>phone interview</strong>. Please keep your phone reachable at the scheduled time.</p>`
      : `<p><strong>Location:</strong> ${location || "Details will be shared by your recruiter."}</p>`;

  await send({
    to,
    subject: `Interview Scheduled${roundName ? ` — ${roundName}` : ""}${jobTitle ? ` for ${jobTitle}` : ""}`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#2E5AAC">Interview Scheduled</h2>
        <p>Hi ${name || "there"},</p>
        <p>Your interview${roundName ? ` (${roundName})` : ""}${jobTitle ? ` for <strong>${jobTitle}</strong>` : ""} has been scheduled.</p>
        <p><strong>Date & Time:</strong> ${when}</p>
        ${joinBlock}
        <p style="margin-top:24px;color:#777;font-size:12px">Recruweb Resources Pvt. Ltd. — this is an automated notification.</p>
      </div>
    `,
  });
};
