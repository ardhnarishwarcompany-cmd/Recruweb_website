import { Op } from "sequelize";
import {
  CrmClient,
  CrmCompany,
  CrmContact,
  CrmRequirement,
  CrmContract,
  CrmNote,
  User,
  Branch,
} from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

const nextClientCode = async () => {
  const count = await CrmClient.count();
  return `CLT-${String(count + 1).padStart(5, "0")}`;
};

//
// ==========================================
// CREATE CLIENT
// ==========================================
//
export const createClient = async (req, res) => {
  try {
    const clientCode = req.body.clientCode || (await nextClientCode());
    const client = await CrmClient.create({
      ...req.body,
      clientCode,
      createdBy: req.user?.id,
    });

    await logAudit({
      req,
      action: "create",
      module: "crm_client",
      targetType: "CrmClient",
      targetId: client.id,
      description: `Client "${client.name}" created`,
      changes: { before: null, after: client.toJSON() },
    });

    res.status(201).json({ success: true, message: "Client created successfully", data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create client", error: error.message });
  }
};

//
// ==========================================
// LIST CLIENTS (search, filter, paginate)
// ==========================================
//
export const getClients = async (req, res) => {
  try {
    const { search, status, industry, accountManagerId, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (industry) where.industry = industry;
    if (accountManagerId) where.accountManagerId = accountManagerId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { clientCode: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

    const { rows, count } = await CrmClient.findAndCountAll({
      where,
      include: [
        { model: CrmCompany, as: "company", attributes: ["id", "name", "industry"] },
        { model: User, as: "accountManager", attributes: ["id", "name", "email"] },
        { model: Branch, as: "branch", attributes: ["id", "name"] },
      ],
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
    res.status(500).json({ success: false, message: "Failed to fetch clients", error: error.message });
  }
};

//
// ==========================================
// CLIENT STATS (for CRM dashboard cards)
// ==========================================
//
export const getClientStats = async (req, res) => {
  try {
    const [total, prospect, active, onHold, inactive] = await Promise.all([
      CrmClient.count(),
      CrmClient.count({ where: { status: "prospect" } }),
      CrmClient.count({ where: { status: "active" } }),
      CrmClient.count({ where: { status: "on-hold" } }),
      CrmClient.count({ where: { status: "inactive" } }),
    ]);
    const [openRequirements, activeContracts] = await Promise.all([
      CrmRequirement.count({ where: { status: "open" } }),
      CrmContract.count({ where: { status: "active" } }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, prospect, active, onHold, inactive, openRequirements, activeContracts },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch client stats", error: error.message });
  }
};

//
// ==========================================
// GET SINGLE CLIENT (full 360 view)
// ==========================================
//
export const getClient = async (req, res) => {
  try {
    const client = await CrmClient.findByPk(req.params.id, {
      include: [
        { model: CrmCompany, as: "company" },
        { model: User, as: "accountManager", attributes: ["id", "name", "email"] },
        { model: Branch, as: "branch", attributes: ["id", "name"] },
        { model: CrmContact, as: "contacts", order: [["isPrimary", "DESC"]] },
        { model: CrmRequirement, as: "requirements" },
        { model: CrmContract, as: "contracts" },
      ],
    });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const notes = await CrmNote.findAll({
      where: { entityType: "client", entityId: client.id },
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
      order: [["pinned", "DESC"], ["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: { ...client.toJSON(), notes } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch client", error: error.message });
  }
};

//
// ==========================================
// UPDATE CLIENT
// ==========================================
//
export const updateClient = async (req, res) => {
  try {
    const client = await CrmClient.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    const before = client.toJSON();
    await client.update(req.body);

    await logAudit({
      req,
      action: "update",
      module: "crm_client",
      targetType: "CrmClient",
      targetId: client.id,
      description: `Client "${client.name}" updated`,
      changes: { before, after: client.toJSON() },
    });

    res.status(200).json({ success: true, message: "Client updated successfully", data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update client", error: error.message });
  }
};

//
// ==========================================
// DELETE CLIENT
// ==========================================
//
export const deleteClient = async (req, res) => {
  try {
    const client = await CrmClient.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    await client.destroy();

    await logAudit({
      req,
      action: "delete",
      module: "crm_client",
      targetType: "CrmClient",
      targetId: req.params.id,
      description: `Client "${client.name}" deleted`,
    });

    res.status(200).json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete client", error: error.message });
  }
};
