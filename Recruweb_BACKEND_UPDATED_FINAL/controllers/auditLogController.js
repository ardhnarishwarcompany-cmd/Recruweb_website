import { Op } from "sequelize";
import { AuditLog } from "../models/index.js";

const paginate = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 200);
  return { page, limit, offset: (page - 1) * limit };
};

const respondPaginated = (res, rows, count, page, limit) =>
  res.status(200).json({
    success: true,
    count,
    page,
    totalPages: Math.ceil(count / limit),
    data: rows,
  });

// GET /api/audit-logs — Activity Logs (every action, general trail)
export const getActivityLogs = async (req, res) => {
  try {
    const { userId, module, action, from, to, search } = req.query;
    const { page, limit, offset } = paginate(req);

    const where = {};
    if (userId) where.userId = userId;
    if (module) where.module = module;
    if (action) where.action = action;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    if (search) {
      where[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { userEmail: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    respondPaginated(res, rows, count, page, limit);
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch activity logs",
        error: error.message,
      });
  }
};

// GET /api/audit-logs/login-history — Login History
export const getLoginHistory = async (req, res) => {
  try {
    const { userId, status, from, to } = req.query;
    const { page, limit, offset } = paginate(req);

    const where = {
      module: "auth",
      action: { [Op.in]: ["login_success", "login_failed", "logout"] },
    };
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    respondPaginated(res, rows, count, page, limit);
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch login history",
        error: error.message,
      });
  }
};

// GET /api/audit-logs/changes — Changes Tracking (create/update/delete with before/after)
export const getChangeLogs = async (req, res) => {
  try {
    const { module, targetType, targetId, from, to } = req.query;
    const { page, limit, offset } = paginate(req);

    const where = { changes: { [Op.ne]: null } };
    if (module) where.module = module;
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = String(targetId);
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    respondPaginated(res, rows, count, page, limit);
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch change logs",
        error: error.message,
      });
  }
};
