import { CrmContract, CrmClient } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

const nextContractNumber = async () => {
  const count = await CrmContract.count();
  return `CTR-${String(count + 1).padStart(5, "0")}`;
};

export const createContract = async (req, res) => {
  try {
    const contractNumber = req.body.contractNumber || (await nextContractNumber());
    const contract = await CrmContract.create({
      ...req.body,
      contractNumber,
      createdBy: req.user?.id,
    });

    await logAudit({
      req,
      action: "create",
      module: "crm_contract",
      targetType: "CrmContract",
      targetId: contract.id,
      description: `Contract "${contract.title}" created`,
    });

    res.status(201).json({ success: true, message: "Contract created successfully", data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create contract", error: error.message });
  }
};

export const getContracts = async (req, res) => {
  try {
    const { clientId, status } = req.query;
    const where = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const contracts = await CrmContract.findAll({
      where,
      include: [{ model: CrmClient, as: "client", attributes: ["id", "name", "clientCode"] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, count: contracts.length, data: contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch contracts", error: error.message });
  }
};

export const getContract = async (req, res) => {
  try {
    const contract = await CrmContract.findByPk(req.params.id, {
      include: [{ model: CrmClient, as: "client" }],
    });
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }
    res.status(200).json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch contract", error: error.message });
  }
};

export const updateContract = async (req, res) => {
  try {
    const contract = await CrmContract.findByPk(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }
    await contract.update(req.body);

    await logAudit({
      req,
      action: "update",
      module: "crm_contract",
      targetType: "CrmContract",
      targetId: contract.id,
      description: `Contract "${contract.title}" updated`,
    });

    res.status(200).json({ success: true, message: "Contract updated successfully", data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update contract", error: error.message });
  }
};

export const uploadContractDocument = async (req, res) => {
  try {
    const contract = await CrmContract.findByPk(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No document uploaded" });
    }
    contract.documentUrl = `/uploads/contracts/${req.file.filename}`;
    await contract.save();

    res.status(200).json({ success: true, message: "Document uploaded successfully", data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upload document", error: error.message });
  }
};

export const deleteContract = async (req, res) => {
  try {
    const contract = await CrmContract.findByPk(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }
    await contract.destroy();
    res.status(200).json({ success: true, message: "Contract deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete contract", error: error.message });
  }
};
