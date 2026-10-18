import { Op } from "sequelize";
   import { sendToHrms } from "../utils/hrmsBridge.js";
import nodemailer from "nodemailer";
import {
  Lead,
  LeadFollowUp,
  User,
  CrmClient,
  CrmCompany,
  CrmContact,
  CrmRequirement,
} from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const nextLeadCode = async () => {
  const count = await Lead.count();
  return `LEAD-${String(count + 1).padStart(5, "0")}`;
};

//
// ==========================================
// NEW INQUIRY FORM (public submission)
// ==========================================
//
export const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      designation,
      industry,
      requirement,
      positionsNeeded,
      budget,
      source,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const leadCode = await nextLeadCode();
    const lead = await Lead.create({
      leadCode,
      name,
      email,
      phone,
      companyName,
      designation,
      industry,
      requirement,
      positionsNeeded: positionsNeeded || null,
      budget: budget || null,
      source: source || "website",
    });
       // Sync to HRMS Website Forms (non-blocking, never breaks the form)
       sendToHrms({
         kind: "lead",
         externalId: lead.leadCode || `lead-${lead.id}`,
         name,
         email,
         phone,
         company: companyName,
         designation,
         industry,
         positionsNeeded,
         budget,
         requirement,
         source: "inquiry",
       });
    try {
      await transporter.sendMail({
        from: `"Recruweb Website" <${process.env.FROM_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Inquiry (${lead.leadCode}) from ${name}`,
        html: `
          <h2>New Lead Inquiry</h2>
          <p><strong>Lead Code:</strong> ${lead.leadCode}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Company:</strong> ${companyName || "N/A"}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Requirement:</strong></p>
          <p>${requirement || "N/A"}</p>
        `,
      });
    } catch (emailError) {
      console.log("Lead notification email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Thank you for your inquiry! Our team will get back to you shortly.",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit inquiry", error: error.message });
  }
};

//
// ==========================================
// INQUIRY DASHBOARD — list + filters + pagination
// ==========================================
//
export const getLeads = async (req, res) => {
  try {
    const { search, status, priority, source, assignedToId, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (source) where.source = source;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } },
        { leadCode: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

    const { rows, count } = await Lead.findAndCountAll({
      where,
      include: [{ model: User, as: "assignedTo", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    res.status(200).json({
      success: true,
      count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch leads", error: error.message });
  }
};

//
// ==========================================
// INQUIRY DASHBOARD — funnel & conversion stats
// ==========================================
//
export const getLeadDashboard = async (req, res) => {
  try {
    const statuses = ["new", "contacted", "qualified", "proposal-sent", "negotiation", "converted", "lost"];
    const counts = await Promise.all(statuses.map((status) => Lead.count({ where: { status } })));
    const byStatus = statuses.reduce((acc, status, idx) => ({ ...acc, [status]: counts[idx] }), {});

    const total = await Lead.count();
    const unassigned = await Lead.count({ where: { assignedToId: null } });
    const overdueFollowUps = await LeadFollowUp.count({
      where: { completed: false, followUpDate: { [Op.lt]: new Date() } },
    });

    const bySource = await Lead.findAll({
      attributes: ["source", [Lead.sequelize.fn("COUNT", Lead.sequelize.col("id")), "count"]],
      group: ["source"],
      raw: true,
    });

    const converted = byStatus.converted || 0;
    const lost = byStatus.lost || 0;
    const closed = converted + lost;
    const conversionRate = closed > 0 ? Number(((converted / closed) * 100).toFixed(1)) : 0;

    const recentLeads = await Lead.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [{ model: User, as: "assignedTo", attributes: ["id", "name"] }],
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        unassigned,
        overdueFollowUps,
        byStatus,
        bySource,
        conversionRate,
        recentLeads,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch lead dashboard", error: error.message });
  }
};

//
// ==========================================
// GET SINGLE LEAD (with follow-up history)
// ==========================================
//
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
        { model: CrmClient, as: "convertedClient", attributes: ["id", "name", "clientCode"] },
        {
          model: LeadFollowUp,
          as: "followUps",
          include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
        },
      ],
      order: [[{ model: LeadFollowUp, as: "followUps" }, "followUpDate", "DESC"]],
    });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch lead", error: error.message });
  }
};

//
// ==========================================
// UPDATE LEAD (status, priority, details)
// ==========================================
//
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    const before = lead.toJSON();
    const updates = { ...req.body };

    if (updates.status === "contacted" && !lead.lastContactedAt) {
      updates.lastContactedAt = new Date();
    }

    await lead.update(updates);

    await logAudit({
      req,
      action: "update",
      module: "lead",
      targetType: "Lead",
      targetId: lead.id,
      description: `Lead "${lead.name}" (${lead.leadCode}) updated`,
      changes: { before, after: lead.toJSON() },
    });

    res.status(200).json({ success: true, message: "Lead updated successfully", data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update lead", error: error.message });
  }
};

//
// ==========================================
// LEAD ASSIGNMENT
// ==========================================
//
export const assignLead = async (req, res) => {
  try {
    const { assignedToId } = req.body;
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (assignedToId) {
      const user = await User.findByPk(assignedToId);
      if (!user) {
        return res.status(404).json({ success: false, message: "Assignee user not found" });
      }
    }

    await lead.update({
      assignedToId: assignedToId || null,
      assignedAt: assignedToId ? new Date() : null,
    });

    await logAudit({
      req,
      action: "update",
      module: "lead",
      targetType: "Lead",
      targetId: lead.id,
      description: assignedToId
        ? `Lead "${lead.name}" assigned to user #${assignedToId}`
        : `Lead "${lead.name}" unassigned`,
    });

    const updated = await Lead.findByPk(lead.id, {
      include: [{ model: User, as: "assignedTo", attributes: ["id", "name", "email"] }],
    });

    res.status(200).json({ success: true, message: "Lead assignment updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to assign lead", error: error.message });
  }
};

//
// ==========================================
// CONVERSION TRACKING — convert lead to client
// ==========================================
//
export const convertLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    if (lead.status === "converted" && lead.convertedClientId) {
      return res.status(400).json({ success: false, message: "Lead has already been converted" });
    }

    const {
      accountManagerId = lead.assignedToId,
      industry = lead.industry,
      createCompany = true,
    } = req.body || {};

    let companyId = null;
    if (createCompany && lead.companyName) {
      const company = await CrmCompany.create({
        name: lead.companyName,
        industry,
        createdBy: req.user?.id,
      });
      companyId = company.id;
    }

    const clientCount = await CrmClient.count();
    const client = await CrmClient.create({
      clientCode: `CLT-${String(clientCount + 1).padStart(5, "0")}`,
      name: lead.companyName || lead.name,
      companyId,
      industry,
      email: lead.email,
      phone: lead.phone,
      status: "active",
      source: "lead-conversion",
      accountManagerId: accountManagerId || null,
      createdBy: req.user?.id,
    });

    await CrmContact.create({
      clientId: client.id,
      companyId,
      name: lead.name,
      designation: lead.designation,
      email: lead.email,
      phone: lead.phone,
      isPrimary: true,
      createdBy: req.user?.id,
    });

    if (lead.requirement) {
      await CrmRequirement.create({
        clientId: client.id,
        title: `Requirement from ${lead.leadCode}`,
        description: lead.requirement,
        positions: lead.positionsNeeded || 1,
        assignedRecruiterId: accountManagerId || null,
        createdBy: req.user?.id,
      });
    }

    await lead.update({
      status: "converted",
      convertedClientId: client.id,
      convertedAt: new Date(),
    });

    await logAudit({
      req,
      action: "update",
      module: "lead",
      targetType: "Lead",
      targetId: lead.id,
      description: `Lead "${lead.name}" (${lead.leadCode}) converted to client "${client.name}" (${client.clientCode})`,
    });

    res.status(200).json({
      success: true,
      message: "Lead converted to client successfully",
      data: { lead, client },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to convert lead", error: error.message });
  }
};

//
// ==========================================
// MARK LEAD LOST
// ==========================================
//
export const markLeadLost = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    await lead.update({ status: "lost", lostReason: req.body.lostReason || null });

    await logAudit({
      req,
      action: "update",
      module: "lead",
      targetType: "Lead",
      targetId: lead.id,
      description: `Lead "${lead.name}" (${lead.leadCode}) marked as lost`,
    });

    res.status(200).json({ success: true, message: "Lead marked as lost", data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update lead", error: error.message });
  }
};

//
// ==========================================
// DELETE LEAD
// ==========================================
//
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    await lead.destroy();
    res.status(200).json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete lead", error: error.message });
  }
};
