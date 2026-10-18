import { Op } from "sequelize";
import { LeadFollowUp, Lead, User } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

// Follow-ups are created under a lead: POST /api/leads/:leadId/follow-ups
export const createFollowUp = async (req, res) => {
  try {
    const { leadId } = req.params;
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const followUp = await LeadFollowUp.create({
      ...req.body,
      leadId,
      createdBy: req.user?.id,
    });

    // Keep the lead's "last contacted" / "next follow-up" fields in sync so
    // the Inquiry Dashboard can surface overdue follow-ups without joining.
    const updates = { lastContactedAt: new Date() };
    if (!followUp.completed) updates.nextFollowUpDate = followUp.followUpDate;
    if (lead.status === "new") updates.status = "contacted";
    await lead.update(updates);

    await logAudit({
      req,
      action: "create",
      module: "lead_follow_up",
      targetType: "LeadFollowUp",
      targetId: followUp.id,
      description: `Follow-up logged for lead "${lead.name}" (${lead.leadCode})`,
    });

    const withCreator = await LeadFollowUp.findByPk(followUp.id, {
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
    });

    res.status(201).json({ success: true, message: "Follow-up logged successfully", data: withCreator });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create follow-up", error: error.message });
  }
};

export const getFollowUps = async (req, res) => {
  try {
    const { leadId } = req.params;
    const followUps = await LeadFollowUp.findAll({
      where: { leadId },
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
      order: [["followUpDate", "DESC"]],
    });
    res.status(200).json({ success: true, count: followUps.length, data: followUps });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch follow-ups", error: error.message });
  }
};

// Cross-lead "my follow-ups today / overdue" list, used by the dashboard.
export const getDueFollowUps = async (req, res) => {
  try {
    const { assignedToId, upto } = req.query;
    const where = { completed: false };
    where.followUpDate = { [Op.lte]: upto ? new Date(upto) : new Date() };

    const leadWhere = {};
    if (assignedToId) leadWhere.assignedToId = assignedToId;

    const followUps = await LeadFollowUp.findAll({
      where,
      include: [
        {
          model: Lead,
          as: "lead",
          where: Object.keys(leadWhere).length ? leadWhere : undefined,
          attributes: ["id", "leadCode", "name", "companyName", "status", "assignedToId"],
        },
        { model: User, as: "creator", attributes: ["id", "name"] },
      ],
      order: [["followUpDate", "ASC"]],
    });

    res.status(200).json({ success: true, count: followUps.length, data: followUps });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch due follow-ups", error: error.message });
  }
};

export const updateFollowUp = async (req, res) => {
  try {
    const followUp = await LeadFollowUp.findByPk(req.params.id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }
    const updates = { ...req.body };
    if (updates.completed && !followUp.completed) {
      updates.completedAt = new Date();
    }
    await followUp.update(updates);
    res.status(200).json({ success: true, message: "Follow-up updated successfully", data: followUp });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update follow-up", error: error.message });
  }
};

export const deleteFollowUp = async (req, res) => {
  try {
    const followUp = await LeadFollowUp.findByPk(req.params.id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: "Follow-up not found" });
    }
    await followUp.destroy();
    res.status(200).json({ success: true, message: "Follow-up deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete follow-up", error: error.message });
  }
};
