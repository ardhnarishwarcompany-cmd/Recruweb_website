import { Op } from "sequelize";
import { Sop, SopInbox, User } from "../models/index.js";
import {
  canManageSops,
  ensureSopAssignments,
  generateSopEmail,
  userCanViewSop,
} from "../utils/sopService.js";
import { sendAutomatedEmail } from "../utils/emailAutomation.js";

const rolesOf = (user) => [
  ...(Array.isArray(user?.roles) ? user.roles : []),
  ...(user?.role ? [user.role] : []),
].filter(Boolean);

const isAdmin = (user) => canManageSops(user);

const normalizeSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

export const listSops = async (req, res) => {
  try {
    const isAdminUser = isAdmin(req.user);
    const where = isAdminUser ? {} : { status: "published" };
    const sops = await Sop.findAll({ where, order: [["updatedAt", "DESC"]] });
    return res.json({
      success: true,
      data: sops.filter((sop) => userCanViewSop(req.user, sop)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load SOPs", error: error.message });
  }
};

export const getSop = async (req, res) => {
  try {
    const where = /^\d+$/.test(req.params.idOrSlug)
      ? { id: Number(req.params.idOrSlug) }
      : { slug: req.params.idOrSlug };
    const sop = await Sop.findOne({ where });
    if (!sop || !userCanViewSop(req.user, sop)) {
      return res.status(404).json({ success: false, message: "SOP not found" });
    }
    return res.json({ success: true, data: sop });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load SOP", error: error.message });
  }
};

export const createSop = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only Admin/Super Admin can create SOPs." });

    const {
      title,
      department = "General",
      description = "",
      applicableRoles = [],
      targetRoles,
      version = "1.0",
      effectiveDate,
      status = "draft",
      content = "",
    } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Title and SOP content are required." });
    }

    const baseSlug = normalizeSlug(title);
    let slug = baseSlug || `sop-${Date.now()}`;
    let suffix = 1;
    while (await Sop.findOne({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const audience = Array.isArray(targetRoles)
      ? targetRoles
      : Array.isArray(applicableRoles)
        ? applicableRoles
        : [];

    const sop = await Sop.create({
      title: title.trim(),
      slug,
      department,
      description,
      summary: req.body.summary || description,
      applicableRoles: audience,
      targetRoles: audience,
      version,
      effectiveDate: effectiveDate || null,
      status,
      content,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      publishedAt: status === "published" ? new Date() : null,
    });

    const notification =
      status === "published" ? await ensureSopAssignments(sop) : { created: 0, emails: 0 };

    return res.status(201).json({ success: true, data: sop, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create SOP", error: error.message });
  }
};

export const updateSop = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only Admin/Super Admin can edit SOPs." });
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });

    const allowed = ["title", "department", "description", "summary", "applicableRoles", "targetRoles", "version", "effectiveDate", "status", "content"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) sop[key] = req.body[key];
    }
    if (req.body.applicableRoles !== undefined && req.body.targetRoles === undefined) {
      sop.targetRoles = req.body.applicableRoles;
    }
    if (req.body.targetRoles !== undefined && req.body.applicableRoles === undefined) {
      sop.applicableRoles = req.body.targetRoles;
    }
    sop.updatedBy = req.user.id;
    if (sop.status === "published" && !sop.publishedAt) sop.publishedAt = new Date();
    await sop.save();

    const notification =
      sop.status === "published" ? await ensureSopAssignments(sop) : { created: 0, emails: 0 };
    return res.json({ success: true, data: sop, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update SOP", error: error.message });
  }
};

export const archiveSop = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only Admin/Super Admin can archive SOPs." });
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });
    sop.status = "archived";
    sop.updatedBy = req.user.id;
    await sop.save();
    return res.json({ success: true, data: sop });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to archive SOP", error: error.message });
  }
};

export const getInbox = async (req, res) => {
  try {
    const published = await Sop.findAll({ where: { status: "published" } });
    for (const sop of published) {
      if (userCanViewSop(req.user, sop)) {
        await ensureSopAssignments(sop, { sendEmails: true, userId: req.user.id });
      }
    }
    const data = await SopInbox.findAll({
      where: { recipientUserId: req.user.id },
      include: [{ model: Sop, as: "sop" }],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
    return res.json({
      success: true,
      unread: data.filter((x) => x.status === "pending").length,
      pending: data.filter((x) => ["pending", "later"].includes(x.status)).length,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load SOP inbox", error: error.message });
  }
};

export const actionOnAssignment = async (req, res) => {
  try {
    const { action, rejectionReason = null } = req.body;
    if (!["approved", "later", "rejected"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid SOP action" });
    }
    const item = await SopInbox.findOne({
      where: { id: req.params.id, recipientUserId: req.user.id },
    });
    if (!item) return res.status(404).json({ success: false, message: "SOP acknowledgement not found" });

    item.status = action;
    item.note = action === "rejected" ? rejectionReason : null;
    if (action === "approved") item.approvedAt = new Date();
    if (action === "rejected") item.rejectedAt = new Date();
    await item.save();
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update SOP acknowledgement", error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const sops = await Sop.findAll({ where: isAdmin(req.user) ? {} : { status: "published" } });
    const visible = sops.filter((s) => userCanViewSop(req.user, s));
    const inbox = await SopInbox.findAll({ where: { recipientUserId: req.user.id } });
    return res.json({
      success: true,
      data: {
        total: visible.length,
        published: visible.filter((s) => s.status === "published").length,
        drafts: isAdmin(req.user) ? visible.filter((s) => s.status === "draft").length : 0,
        archived: isAdmin(req.user) ? visible.filter((s) => s.status === "archived").length : 0,
        pending: inbox.filter((x) => ["pending", "later"].includes(x.status)).length,
        approved: inbox.filter((x) => x.status === "approved").length,
        rejected: inbox.filter((x) => x.status === "rejected").length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load SOP stats", error: error.message });
  }
};

export const generateEmail = async (req, res) => {
  try {
    const sop = await Sop.findByPk(req.params.id);
    if (!sop || !userCanViewSop(req.user, sop)) return res.status(404).json({ success: false, message: "SOP not found" });
    return res.json({ success: true, data: generateSopEmail({ sop, recipientName: req.body?.recipientName || "Team Member" }) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to generate email", error: error.message });
  }
};

export const sendEmailForSop = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only Admin/Super Admin can send SOP emails." });
    const sop = await Sop.findByPk(req.params.id);
    if (!sop) return res.status(404).json({ success: false, message: "SOP not found" });
    if (!req.body.to) return res.status(400).json({ success: false, message: "Recipient email is required." });
    const generated = generateSopEmail({ sop, recipientName: req.body.recipientName });
    const result = await sendAutomatedEmail({
      to: req.body.to,
      subject: req.body.subject || generated.subject,
      html: generated.html,
      type: "sop_manual",
      relatedType: "sop",
      relatedId: sop.id,
      triggeredBy: req.user.id,
    });
    return res.status(result.success ? 200 : 400).json({
      success: !!result.success,
      message: result.success ? "SOP email sent" : "Email was not delivered.",
      data: { ...result, body: req.body.body || generated.body },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send SOP email", error: error.message });
  }
};
