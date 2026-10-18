import { Op } from "sequelize";
import { Sop, SopInbox, User } from "../models/index.js";
import { sendAutomatedEmail } from "./emailAutomation.js";

const getRoles = (user) => [
  ...(Array.isArray(user?.roles) ? user.roles : []),
  ...(user?.role ? [user.role] : []),
].filter(Boolean);

export const canManageSops = (user) =>
  getRoles(user).some((role) => ["superadmin", "admin"].includes(role));

export const userCanViewSop = (user, sop) => {
  if (!sop) return false;
  if (canManageSops(user)) return true;
  if (sop.status !== "published") return false;

  // Both fields exist in different SOP generations. A role only sees a
  // published SOP when its configured audience explicitly contains that role.
  const configuredRoles = [
    ...(Array.isArray(sop.targetRoles) ? sop.targetRoles : []),
    ...(Array.isArray(sop.applicableRoles) ? sop.applicableRoles : []),
  ].filter(Boolean);

  if (!configuredRoles.length) return false;

  const roles = getRoles(user);
  return roles.some((role) => configuredRoles.includes(role));
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sopUrl = (sop) => {
  const frontend = process.env.FRONTEND_URL || "https://recruweb.com";
  return `${frontend}/#/sops/${encodeURIComponent(sop.slug || sop.id)}`;
};

const emailHtml = ({ user, sop }) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:620px;margin:0 auto;padding:28px;color:#172033">
    <div style="padding:18px 20px;border-radius:18px;background:linear-gradient(135deg,#111827,#312e81);color:#fff">
      <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.75">Recruweb SOP Center</div>
      <h2 style="margin:8px 0 4px">${escapeHtml(sop.title)}</h2>
      <div style="opacity:.8">Version ${escapeHtml(sop.version)} · ${escapeHtml(sop.department || "Company Policy")}</div>
    </div>
    <p>Hi ${escapeHtml(user.name || "there")},</p>
    <p>A new Standard Operating Procedure is available for your role. Please review the complete SOP and record your acknowledgement in the Recruweb portal.</p>
    <p>
      <a href="${sopUrl(sop)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#4f46e5;color:#fff;text-decoration:none;font-weight:700">Open SOP</a>
    </p>
    <p style="font-size:13px;color:#64748b">You can also open <b>SOP Center → Inbox</b> inside your portal to Approve, Approve Later, or Reject the acknowledgement request.</p>
    <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0">
    <div style="font-size:12px;color:#94a3b8">Recruweb Resources Pvt. Ltd. · Automated SOP notification</div>
  </div>
`;

export const ensureSopAssignments = async (
  sop,
  { sendEmails = true, userId = null, resendExisting = false } = {},
) => {
  if (!sop || sop.status !== "published") return { created: 0, emails: 0 };

  const configuredRoles = [
    ...(Array.isArray(sop.targetRoles) ? sop.targetRoles : []),
    ...(Array.isArray(sop.applicableRoles) ? sop.applicableRoles : []),
  ].filter(Boolean);

  const where = { isActive: true };
  if (configuredRoles.length) {
    where.role = { [Op.in]: [...new Set(configuredRoles)] };
  }
  if (userId) where.id = userId;

  const users = await User.findAll({
    where,
    attributes: ["id", "name", "email", "role"],
  });

  let created = 0;
  let emails = 0;

  for (const user of users) {
    const [item, wasCreated] = await SopInbox.findOrCreate({
      where: { sopId: sop.id, recipientUserId: user.id },
      defaults: {
        status: "pending",
        emailSubject: `Action required: ${sop.title} v${sop.version}`,
        emailBody: generateSopEmail({ sop, recipientName: user.name }).body,
      },
    });

    if (wasCreated) {
      created += 1;
    }

    if (sendEmails && user.email && (wasCreated || resendExisting)) {
      const result = await sendAutomatedEmail({
        to: user.email,
        subject: `Action required: ${sop.title} v${sop.version}`,
        html: emailHtml({ user, sop }),
        type: "sop_notification",
        relatedType: "sop",
        relatedId: sop.id,
        triggeredBy: sop.updatedBy || sop.createdBy || null,
      });
      if (result.success) {
        emails += 1;
      }
    }
  }

  return { created, emails };
};

export const generateSopEmail = ({ sop, recipientName = "Team Member" }) => ({
  subject: `Action Required: ${sop.title} v${sop.version}`,
  body: `Hi ${recipientName},

A new Recruweb SOP is available for your role.

SOP: ${sop.title}
Department: ${sop.department || "Company Policy"}
Version: ${sop.version}

Please review it here:
${sopUrl(sop)}

After reviewing, open SOP Center → Inbox to Approve, Approve Later, or Reject the acknowledgement request.

Regards,
Recruweb Resources Pvt. Ltd.`,
  html: emailHtml({ user: { name: recipientName }, sop }),
});
