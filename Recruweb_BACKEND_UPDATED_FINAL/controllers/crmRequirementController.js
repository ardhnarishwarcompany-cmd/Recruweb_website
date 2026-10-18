import { CrmRequirement, CrmClient, User } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

export const createRequirement = async (req, res) => {
  try {
    const requirement = await CrmRequirement.create({
      ...req.body,
      createdBy: req.user?.id,
    });

    await logAudit({
      req,
      action: "create",
      module: "crm_requirement",
      targetType: "CrmRequirement",
      targetId: requirement.id,
      description: `Requirement "${requirement.title}" created`,
    });

    res.status(201).json({ success: true, message: "Requirement created successfully", data: requirement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create requirement", error: error.message });
  }
};

export const getRequirements = async (req, res) => {
  try {
    const { clientId, status, priority, assignedRecruiterId } = req.query;
    const where = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedRecruiterId) where.assignedRecruiterId = assignedRecruiterId;

    const requirements = await CrmRequirement.findAll({
      where,
      include: [
        { model: CrmClient, as: "client", attributes: ["id", "name", "clientCode"] },
        { model: User, as: "assignedRecruiter", attributes: ["id", "name", "email"] },
      ],
      order: [["priority", "DESC"], ["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, count: requirements.length, data: requirements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch requirements", error: error.message });
  }
};

export const getRequirement = async (req, res) => {
  try {
    const requirement = await CrmRequirement.findByPk(req.params.id, {
      include: [
        { model: CrmClient, as: "client" },
        { model: User, as: "assignedRecruiter", attributes: ["id", "name", "email"] },
      ],
    });
    if (!requirement) {
      return res.status(404).json({ success: false, message: "Requirement not found" });
    }
    res.status(200).json({ success: true, data: requirement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch requirement", error: error.message });
  }
};

export const updateRequirement = async (req, res) => {
  try {
    const requirement = await CrmRequirement.findByPk(req.params.id);
    if (!requirement) {
      return res.status(404).json({ success: false, message: "Requirement not found" });
    }
    await requirement.update(req.body);

    await logAudit({
      req,
      action: "update",
      module: "crm_requirement",
      targetType: "CrmRequirement",
      targetId: requirement.id,
      description: `Requirement "${requirement.title}" updated`,
    });

    res.status(200).json({ success: true, message: "Requirement updated successfully", data: requirement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update requirement", error: error.message });
  }
};

export const deleteRequirement = async (req, res) => {
  try {
    const requirement = await CrmRequirement.findByPk(req.params.id);
    if (!requirement) {
      return res.status(404).json({ success: false, message: "Requirement not found" });
    }
    await requirement.destroy();
    res.status(200).json({ success: true, message: "Requirement deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete requirement", error: error.message });
  }
};
