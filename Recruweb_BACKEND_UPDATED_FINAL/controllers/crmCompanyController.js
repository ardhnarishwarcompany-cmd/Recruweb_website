import { Op } from "sequelize";
import { CrmCompany, CrmClient, CrmContact } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

export const createCrmCompany = async (req, res) => {
  try {
    const company = await CrmCompany.create({ ...req.body, createdBy: req.user?.id });

    await logAudit({
      req,
      action: "create",
      module: "crm_company",
      targetType: "CrmCompany",
      targetId: company.id,
      description: `CRM company "${company.name}" created`,
    });

    res.status(201).json({ success: true, message: "Company created successfully", data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create company", error: error.message });
  }
};

export const getCrmCompanies = async (req, res) => {
  try {
    const { search, industry } = req.query;
    const where = {};
    if (industry) where.industry = industry;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const companies = await CrmCompany.findAll({ where, order: [["createdAt", "DESC"]] });
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch companies", error: error.message });
  }
};

export const getCrmCompany = async (req, res) => {
  try {
    const company = await CrmCompany.findByPk(req.params.id, {
      include: [
        { model: CrmClient, as: "clients", attributes: ["id", "name", "clientCode", "status"] },
        { model: CrmContact, as: "contacts" },
      ],
    });
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch company", error: error.message });
  }
};

export const updateCrmCompany = async (req, res) => {
  try {
    const company = await CrmCompany.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    await company.update(req.body);

    await logAudit({
      req,
      action: "update",
      module: "crm_company",
      targetType: "CrmCompany",
      targetId: company.id,
      description: `CRM company "${company.name}" updated`,
    });

    res.status(200).json({ success: true, message: "Company updated successfully", data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update company", error: error.message });
  }
};

export const deleteCrmCompany = async (req, res) => {
  try {
    const company = await CrmCompany.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    await company.destroy();
    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete company", error: error.message });
  }
};
