import { Branch, User } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "staff", attributes: ["id"] }],
    });

    const data = branches.map((b) => {
      const json = b.toJSON();
      return { ...json, staffCount: json.staff?.length || 0, staff: undefined };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch branches",
        error: error.message,
      });
  }
};

export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "staff",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });
    if (!branch)
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch branch",
        error: error.message,
      });
  }
};

export const createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);

    await logAudit({
      req,
      action: "create",
      module: "branch",
      targetType: "Branch",
      targetId: branch.id,
      description: `Created branch ${branch.name}`,
      changes: { before: null, after: branch.toJSON() },
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Branch created successfully",
        data: branch,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create branch",
        error: error.message,
      });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch)
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });

    const before = branch.toJSON();
    await branch.update(req.body);

    await logAudit({
      req,
      action: "update",
      module: "branch",
      targetType: "Branch",
      targetId: branch.id,
      description: `Updated branch ${branch.name}`,
      changes: { before, after: branch.toJSON() },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Branch updated successfully",
        data: branch,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update branch",
        error: error.message,
      });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch)
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });

    const before = branch.toJSON();
    // Un-assign any staff first (FK is SET NULL on delete, but do it explicitly
    // so the response the admin sees is immediately consistent).
    await User.update({ branchId: null }, { where: { branchId: branch.id } });
    await branch.destroy();

    await logAudit({
      req,
      action: "delete",
      module: "branch",
      targetType: "Branch",
      targetId: req.params.id,
      description: `Deleted branch ${before.name}`,
      changes: { before, after: null },
    });

    res
      .status(200)
      .json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete branch",
        error: error.message,
      });
  }
};
