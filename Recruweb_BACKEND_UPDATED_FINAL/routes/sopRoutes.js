import express from "express";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import Sop from "../models/Sop.js";
import SopInbox from "../models/SopInbox.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/rbac.js";
import { ROLE_GROUPS, ALL_ROLES } from "../config/roles.js";
import { userCanViewSop } from "../utils/sopService.js";

const router = express.Router();

const roleOf = (req) => req.user?.roles?.[0] || req.user?.role;
const isAdmin = (req) => [ROLE_GROUPS.ADMIN_ONLY].flat().includes(roleOf(req));

const baseUrl = () =>
  process.env.FRONTEND_URL || "https://recruweb.com";

const emailFor = (sop, recipient) => ({
  subject: `Action Required: ${sop.title} v${sop.version}`,
  body:
`Hello ${recipient?.name || "Team Member"},

A new Recruweb SOP is ready for your review.

SOP: ${sop.title}
Department: ${sop.department || "Company Policy"}
Version: ${sop.version}

Please open the SOP Center to review the complete policy:
${baseUrl()}/#/sops/${sop.id}

You can choose Approve, Approve Later, or Reject from your SOP Inbox.

Regards,
Recruweb Resources Pvt. Ltd.`,
});

async function maybeSendEmail(to, subject, text) {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const user = process.env.SMTP_USER || process.env.MAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;
  const from = process.env.FROM_EMAIL || process.env.MAIL_FROM || user;
  if (!host || !user || !pass || !from || !to) {
    return { sent: false, reason: "SMTP is not configured; internal inbox was created." };
  }
  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || process.env.MAIL_PORT) || 587,
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: { user, pass },
    });
    await transporter.sendMail({ from, to, subject, text });
    return { sent: true };
  } catch (error) {
    console.error("SOP email failed:", error.message);
    return { sent: false, reason: error.message };
  }
}

// Public SOP library: only published documents are exposed.
router.get("/public", async (req, res) => {
  try {
    const sops = await Sop.findAll({
      where: { status: "published" },
      order: [["department", "ASC"], ["title", "ASC"]],
      attributes: { exclude: ["createdBy"] },
    });
    res.json({ success: true, data: sops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Authenticated SOP library.
// Admin/Super Admin can see every SOP; all other portals only receive SOPs
// whose configured target/applicable role matches the logged-in user.
router.get("/", protect, async (req, res) => {
  try {
    const where = isAdmin(req) ? {} : { status: "published" };
    const sops = await Sop.findAll({
      where,
      order: [["status", "ASC"], ["department", "ASC"], ["title", "ASC"]],
    });

    const visible = sops.filter((sop) => userCanViewSop(req.user, sop));
    res.json({ success: true, data: visible });
  } catch (error) {
    console.error("SOP LIST ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Real-time SOP counters used by Admin/portal dashboards.
router.get("/stats", protect, async (req, res) => {
  try {
    const isAdminUser = isAdmin(req);
    const where = isAdminUser ? {} : { status: "published" };
    const [sops, inbox] = await Promise.all([
      Sop.findAll({ where, attributes: ["id", "status"] }),
      SopInbox.findAll({ where: { recipientUserId: req.user.id }, attributes: ["status"] }),
    ]);
    const visible = sops.filter((s) => userCanViewSop(req.user, s));
    res.json({
      success: true,
      data: {
        total: visible.length,
        published: visible.filter((s) => s.status === "published").length,
        pendingApproval: visible.filter((s) => s.status === "pending_approval").length,
        pendingInbox: inbox.filter((x) => ["pending", "later"].includes(x.status)).length,
        approved: inbox.filter((x) => x.status === "approved").length,
        rejected: inbox.filter((x) => x.status === "rejected").length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load SOP stats", error: error.message });
  }
});

// Current user's SOP email/inbox.
router.get("/inbox/items", protect, async (req, res) => {
  try {
    // Always materialize pending approval requests for every active Admin/Super
    // Admin. This keeps the Admin SOP Inbox useful even when a SOP was created
    // for a narrower target role (e.g. only HR Partners).
    if (isAdmin(req)) {
      const pendingSops = await Sop.findAll({
        where: { status: "pending_approval" },
        attributes: ["id", "title", "version", "department", "status", "createdAt"],
      });
      for (const sop of pendingSops) {
        const admins = await User.findAll({
          where: { role: { [Op.in]: ROLE_GROUPS.ADMIN_ONLY }, isActive: true },
          attributes: ["id", "name", "email", "role"],
        });
        for (const admin of admins) {
          const existing = await SopInbox.findOne({
            where: { sopId: sop.id, recipientUserId: admin.id },
          });
          if (!existing) {
            const email = emailFor(sop, admin);
            await SopInbox.create({
              sopId: sop.id,
              recipientUserId: admin.id,
              status: "pending",
              emailSubject: email.subject,
              emailBody: email.body,
              note: "Pending Admin/Super Admin approval",
            });
          }
        }
      }
    }

    const items = await SopInbox.findAll({
      where: { recipientUserId: req.user.id },
      include: [{ model: Sop, as: "sop" }],
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    res.json({
      success: true,
      unread: items.filter((x) => x.status === "pending").length,
      pending: items.filter((x) => ["pending", "later"].includes(x.status)).length,
      data: items,
    });
  } catch (error) {
    console.error("SOP inbox load:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/inbox/items/:id", protect, async (req, res) => {
  try {
    const item = await SopInbox.findOne({
      where: { id: req.params.id, recipientUserId: req.user.id },
      include: [{ model: Sop, as: "sop" }],
    });
    if (!item) return res.status(404).json({ success: false, message: "Inbox item not found." });

    const action = req.body.action;
    if (!["approve", "later", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be approve, later, or reject." });
    }

    item.status = action === "approve" ? "approved" : action === "later" ? "later" : "rejected";
    item.note = req.body.note || null;
    if (action === "approve") item.approvedAt = new Date();
    if (action === "reject") item.rejectedAt = new Date();
    await item.save();

    const sop = item.sop;
    if (action === "reject") {
      sop.status = "rejected";
      sop.rejectedReason = item.note || `Rejected by ${req.user.name || req.user.email}`;
      await sop.save();
      await SopInbox.update(
        { status: "rejected", note: sop.rejectedReason, rejectedAt: new Date() },
        { where: { sopId: sop.id } },
      );
    } else if (action === "approve") {
      // Admin approval is the publishing gate. Other roles can acknowledge
      // a published SOP later, but they do not block Admin publication.
      if (isAdmin(req)) {
        sop.status = "published";
        sop.publishedAt = new Date();
        sop.rejectedReason = null;
        await sop.save();
        await SopInbox.update(
          { status: "approved", approvedAt: new Date(), rejectedAt: null },
          { where: { sopId: sop.id, recipientUserId: req.user.id } },
        );
      } else {
        const pending = await SopInbox.count({
          where: { sopId: sop.id, status: { [Op.in]: ["pending", "later"] } },
        });
        const rejected = await SopInbox.count({ where: { sopId: sop.id, status: "rejected" } });
        if (pending === 0 && rejected === 0) {
          sop.status = "published";
          sop.publishedAt = new Date();
          await sop.save();
        }
      }
    }

    res.json({ success: true, data: item, message: action === "later" ? "Saved for later." : `SOP ${action}d.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Non-admin portals can ask Admin/Super Admin to review/approve an SOP.
// The request is stored in the same SOP Approval Inbox used by admins and,
// when SMTP is configured, an email is sent to each active admin.
router.post("/:id/request-approval", protect, async (req, res) => {
  try {
    if (isAdmin(req)) {
      return res.status(400).json({
        success: false,
        message: "Admins should approve SOPs from the SOP Approval Inbox.",
      });
    }

    const sop = await Sop.findByPk(req.params.id);
    if (!sop) {
      return res.status(404).json({ success: false, message: "SOP not found." });
    }

    if (!userCanViewSop(req.user, sop)) {
      return res.status(403).json({
        success: false,
        message: "This SOP is not assigned to your role.",
      });
    }

    const admins = await User.findAll({
      where: {
        role: { [Op.in]: ROLE_GROUPS.ADMIN_ONLY },
        isActive: true,
      },
      attributes: ["id", "name", "email", "role"],
    });

    if (!admins.length) {
      return res.status(400).json({
        success: false,
        message: "No active Admin/Super Admin account is available to receive the approval request.",
      });
    }

    const requesterName = req.user?.name || req.user?.email || "Portal User";
    const requesterRole = roleOf(req) || "user";
    const roleLabel =
      requesterRole === "developer"
        ? "Developer Name"
        : requesterRole === "candidate"
          ? "Candidate Name"
          : requesterRole === "client"
            ? "Client Name"
            : "Name";

    const dateSource = req.user?.timezone
      ? new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: req.user.timezone,
        })
      : new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

    const subject = `SOP Approval Request: ${sop.title} v${sop.version}`;
    const body = `Dear Sir/Madam,

I have read and understood the ${sop.title} shared by Recruweb Resources Pvt. Ltd. I acknowledge the guidelines regarding project submission, daily reporting, communication, meeting attendance, confidentiality, work ethics, and company policies.

I agree to comply with all the terms and conditions mentioned in the SOP and will perform my responsibilities professionally and to the best of my abilities.

${roleLabel}: ${requesterName}
Agreement: I Agree
Date: ${dateSource}

Thank you.

Regards,
${requesterName}

SOP Link:
${baseUrl()}/#${isAdmin(req) ? "/admin" : ""}/sops/${sop.id}`;

    let created = 0;
    let emailSent = 0;
    const adminEmails = [];

    for (const admin of admins) {
      if (admin.email) adminEmails.push(admin.email);

      const existing = await SopInbox.findOne({
        where: { sopId: sop.id, recipientUserId: admin.id },
      });

      if (existing) {
        if (["pending", "later"].includes(existing.status)) {
          continue;
        }
        existing.status = "pending";
        existing.note = `Re-requested by ${requesterName} (${requesterRole})`;
        existing.approvedAt = null;
        existing.rejectedAt = null;
        existing.emailSubject = subject;
        existing.emailBody = body;
        await existing.save();
      } else {
        await SopInbox.create({
          sopId: sop.id,
          recipientUserId: admin.id,
          status: "pending",
          emailSubject: subject,
          emailBody: body,
          note: `Requested by ${requesterName} (${requesterRole})`,
        });
        created += 1;
      }

      if (admin.email) {
        const result = await maybeSendEmail(admin.email, subject, body);
        if (result.sent) emailSent += 1;
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        sopId: sop.id,
        requestedBy: { id: req.user.id, name: requesterName, role: requesterRole },
        adminEmails,
        created,
        emailSent,
        approvalEmail: {
          to: adminEmails.join(","),
          subject,
          body,
        },
      },
      message:
        created > 0
          ? "Approval request sent to Admin/Super Admin and added to the SOP Approval Inbox."
          : "An approval request is already pending with Admin/Super Admin.",
    });
  } catch (error) {
    console.error("SOP approval request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send SOP approval request.",
      error: error.message,
    });
  }
});

// Lets non-admin portals show whether an Admin approval request is already pending.
router.get("/:id/request-status", protect, async (req, res) => {
  try {
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found." });

    const pending = await SopInbox.findOne({
      where: {
        sopId: sop.id,
        status: { [Op.in]: ["pending", "later"] },
      },
      attributes: ["id", "status", "createdAt", "note"],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        requested: !!pending,
        status: pending?.status || null,
        createdAt: pending?.createdAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load SOP approval request status.",
      error: error.message,
    });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });
    if (!userCanViewSop(req.user, sop)) {
      return res.status(403).json({
        success: false,
        message: "This SOP is not assigned to your role.",
      });
    }
    res.json({ success: true, data: sop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: create a new SOP. Default is approval workflow; publishNow bypasses it.
router.post("/", protect, authorizeRole(ROLE_GROUPS.ADMIN_ONLY), async (req, res) => {
  try {
    const {
      title, department, summary, content, version = "1.0",
      effectiveDate, targetRoles = ALL_ROLES, publishNow = false,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and SOP content are required." });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;
    const sop = await Sop.create({
      title, slug, department, summary, content, version,
      effectiveDate: effectiveDate || null,
      targetRoles: Array.isArray(targetRoles) ? targetRoles : ALL_ROLES,
      createdBy: req.user.id,
      status: publishNow ? "published" : "pending_approval",
      publishedAt: publishNow ? new Date() : null,
    });

    let inboxCreated = 0;
    let emailsSent = 0;
    if (!publishNow) {
      const roles = Array.isArray(targetRoles) && targetRoles.length ? targetRoles : ALL_ROLES;
      const users = await User.findAll({
        where: {
          role: { [Op.in]: roles },
          isActive: true,
        },
        attributes: ["id", "name", "email", "role"],
      });

      for (const recipient of users) {
        const email = emailFor(sop, recipient);
        await SopInbox.create({
          sopId: sop.id,
          recipientUserId: recipient.id,
          status: "pending",
          emailSubject: email.subject,
          emailBody: email.body,
        });
        inboxCreated++;
        const result = await maybeSendEmail(recipient.email, email.subject, email.body);
        if (result.sent) emailsSent++;
      }
    }

    res.status(201).json({
      success: true,
      data: sop,
      meta: { inboxCreated, emailsSent },
      message: publishNow
        ? "SOP published successfully."
        : "SOP created and review requests added to the SOP Inbox.",
    });
  } catch (error) {
    console.error("Create SOP:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin can edit a draft/rejected SOP.
router.put("/:id", protect, authorizeRole(ROLE_GROUPS.ADMIN_ONLY), async (req, res) => {
  try {
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });
    const allowed = ["title", "department", "summary", "content", "version", "effectiveDate", "targetRoles"];
    for (const key of allowed) if (req.body[key] !== undefined) sop[key] = req.body[key];
    if (req.body.status && ["draft", "pending_approval", "published", "rejected"].includes(req.body.status)) {
      sop.status = req.body.status;
      if (req.body.status === "published") sop.publishedAt = new Date();
    }
    await sop.save();
    res.json({ success: true, data: sop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", protect, authorizeRole(ROLE_GROUPS.ADMIN_ONLY), async (req, res) => {
  try {
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });
    await sop.destroy();
    res.json({ success: true, message: "SOP deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: approve/publish or reject a SOP directly from its detail page.
// This is used when an admin opens an SOP without a matching inbox row.
router.patch("/:id/approval", protect, authorizeRole(ROLE_GROUPS.ADMIN_ONLY), async (req, res) => {
  try {
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });

    const action = req.body.action;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be approve or reject." });
    }

    if (action === "approve") {
      sop.status = "published";
      sop.publishedAt = new Date();
      sop.rejectedReason = null;
    } else {
      sop.status = "rejected";
      sop.rejectedReason = req.body.note || `Rejected by ${req.user.name || req.user.email || "admin"}`;
      sop.publishedAt = null;
    }

    sop.updatedBy = req.user.id;
    await sop.save();

    // Keep any admin inbox rows consistent with the SOP-level decision.
    await SopInbox.update(
      {
        status: action === "approve" ? "approved" : "rejected",
        note: req.body.note || null,
        ...(action === "approve" ? { approvedAt: new Date(), rejectedAt: null } : { rejectedAt: new Date(), approvedAt: null }),
      },
      {
        where: { sopId: sop.id },
      },
    );

    res.json({
      success: true,
      data: sop,
      message: action === "approve" ? "SOP approved and published." : "SOP rejected.",
    });
  } catch (error) {
    console.error("SOP approval:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: generate a ready-to-send email without actually sending it.
router.post("/:id/email-preview", protect, authorizeRole(ROLE_GROUPS.ADMIN_ONLY), async (req, res) => {
  try {
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });
    const recipient = { name: req.body.name || "Team Member", email: req.body.email || "" };
    res.json({ success: true, data: { ...emailFor(sop, recipient), to: recipient.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: send a generated SOP email to one address.
router.post("/:id/email-send", protect, authorizeRole(ROLE_GROUPS.ADMIN_ONLY), async (req, res) => {
  try {
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });
    if (!req.body.email) return res.status(400).json({ success: false, message: "Recipient email is required." });
    const email = emailFor(sop, { name: req.body.name, email: req.body.email });
    const result = await maybeSendEmail(req.body.email, email.subject, email.body);
    res.json({ success: result.sent, data: email, message: result.sent ? "Email sent." : result.reason });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
