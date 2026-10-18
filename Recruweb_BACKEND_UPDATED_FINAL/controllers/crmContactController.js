import { Op } from "sequelize";
import { CrmContact, CrmClient, CrmCompany } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

export const createContact = async (req, res) => {
  try {
    const contact = await CrmContact.create({
      ...req.body,
      createdBy: req.user?.id,
    });

    if (contact.isPrimary && contact.clientId) {
      await CrmContact.update(
        { isPrimary: false },
        { where: { clientId: contact.clientId, id: { [Op.ne]: contact.id } } },
      );
    }

    await logAudit({
      req,
      action: "create",
      module: "crm_contact",
      targetType: "CrmContact",
      targetId: contact.id,
      description: `Contact "${contact.name}" created`,
    });

    res.status(201).json({ success: true, message: "Contact created successfully", data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create contact", error: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const { clientId, companyId, search } = req.query;
    const where = {};
    if (clientId) where.clientId = clientId;
    if (companyId) where.companyId = companyId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const contacts = await CrmContact.findAll({
      where,
      include: [
        { model: CrmClient, as: "client", attributes: ["id", "name", "clientCode"] },
        { model: CrmCompany, as: "company", attributes: ["id", "name"] },
      ],
      order: [["isPrimary", "DESC"], ["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch contacts", error: error.message });
  }
};

export const getContact = async (req, res) => {
  try {
    const contact = await CrmContact.findByPk(req.params.id, {
      include: [
        { model: CrmClient, as: "client" },
        { model: CrmCompany, as: "company" },
      ],
    });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch contact", error: error.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const contact = await CrmContact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    await contact.update(req.body);

    if (contact.isPrimary && contact.clientId) {
      await CrmContact.update(
        { isPrimary: false },
        { where: { clientId: contact.clientId, id: { [Op.ne]: contact.id } } },
      );
    }

    await logAudit({
      req,
      action: "update",
      module: "crm_contact",
      targetType: "CrmContact",
      targetId: contact.id,
      description: `Contact "${contact.name}" updated`,
    });

    res.status(200).json({ success: true, message: "Contact updated successfully", data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update contact", error: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await CrmContact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    await contact.destroy();
    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete contact", error: error.message });
  }
};
