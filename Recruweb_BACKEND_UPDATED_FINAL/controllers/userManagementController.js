import { Op } from "sequelize";
import { User, Branch, Role } from "../models/index.js";
import {
  ROLES,
  ALL_ROLES,
  ALL_PERMISSIONS,
  DEFAULT_PERMISSIONS_BY_ROLE,
} from "../config/roles.js";
import { logAudit } from "../utils/auditLogger.js";

// Everything here is Super Admin / Admin territory (see routes/userRoutes.js).
// This is distinct from authController.createStaffUser (kept for backward
// compatibility) — this controller adds listing, branch assignment,
// permission management, activate/deactivate and delete, all with audit logs.

const sanitizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((p) => ALL_PERMISSIONS.includes(p));
};

// GET /api/users — list + search + filter + paginate
export const getUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      branchId,
      isActive,
      page = 1,
      sort = "createdAt",
      order = "DESC",
      limit = 20,
    } = req.query;

    const where = {};
    if (role) where.role = role;
    if (branchId) where.branchId = branchId;
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const { rows, count } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "code"],
        },
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
      ],
      order: [[sort, order.toUpperCase()]],
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name", "code"],
        },
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
      ],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// POST /api/users — create a staff user (recruiter, HR, admin, ...)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, branchId, permissions } = req.body;

    if (!role || !ALL_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "A valid role is required" });
    }
    // Only a Super Admin can create another Admin/Super Admin.
    if (
      [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role) &&
      req.user.role !== ROLES.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Only a Super Admin can create Admin accounts",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    if (branchId) {
      const branch = await Branch.findByPk(branchId);
      if (!branch)
        return res
          .status(400)
          .json({ success: false, message: "Branch not found" });
    }

    const assignedPermissions = permissions
      ? sanitizePermissions(permissions)
      : DEFAULT_PERMISSIONS_BY_ROLE[role] || [];

    const user = await User.create({
      name,
      email,
      password,
      role,
      branchId: branchId || null,
      permissions: assignedPermissions,
      isEmailVerified: true,
    });
    const roleRecord = await Role.findOne({
      where: { name: role },
    });

    if (roleRecord) {
      await user.addRole(roleRecord);
    }

    await logAudit({
      req,
      action: "create",
      module: "user",
      targetType: "User",
      targetId: user.id,
      description: `Created ${role} account for ${user.email}`,
      changes: { before: null, after: user.toJSON() },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// PUT /api/users/:id — update profile fields, branch
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const before = user.toJSON();
    const { name, email, branchId } = req.body;

    if (branchId !== undefined) {
      if (branchId) {
        const branch = await Branch.findByPk(branchId);
        if (!branch)
          return res
            .status(400)
            .json({ success: false, message: "Branch not found" });
      }
      user.branchId = branchId || null;
    }
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();

    await logAudit({
      req,
      action: "update",
      module: "user",
      targetType: "User",
      targetId: user.id,
      description: `Updated user ${user.email}`,
      changes: { before, after: user.toJSON() },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// PUT /api/users/:id/role — Assign Role
export const assignRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !ALL_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "A valid role is required" });
    }
    if (
      [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role) &&
      req.user.role !== ROLES.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Only a Super Admin can assign Admin roles",
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const before = user.toJSON();
    const previousRole = user.role;
    user.role = role;
    await user.setRoles([]);

    const roleRecord = await Role.findOne({
      where: { name: role },
    });

    if (roleRecord) {
      await user.addRole(roleRecord);
    }
    // Re-baseline permissions to the new role's defaults unless caller passed
    // explicit permissions alongside the role change.
    if (Array.isArray(req.body.permissions)) {
      user.permissions = sanitizePermissions(req.body.permissions);
    } else {
      user.permissions = DEFAULT_PERMISSIONS_BY_ROLE[role] || [];
    }
    await user.save();

    await logAudit({
      req,
      action: "role_change",
      module: "user",
      targetType: "User",
      targetId: user.id,
      description: `Changed role of ${user.email} from ${previousRole} to ${role}`,
      changes: { before, after: user.toJSON() },
    });

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign role",
      error: error.message,
    });
  }
};

// PUT /api/users/:id/permissions — Permissions
export const updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ success: false, message: "permissions must be an array" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const before = user.toJSON();
    user.permissions = sanitizePermissions(permissions);
    await user.save();

    await logAudit({
      req,
      action: "permissions_change",
      module: "user",
      targetType: "User",
      targetId: user.id,
      description: `Updated permissions for ${user.email}`,
      changes: { before, after: user.toJSON() },
    });

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update permissions",
      error: error.message,
    });
  }
};

// PUT /api/users/:id/status — activate / deactivate
export const setUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isActive must be true or false" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.id === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const before = user.toJSON();
    user.isActive = isActive;
    await user.save();

    await logAudit({
      req,
      action: isActive ? "activate" : "deactivate",
      module: "user",
      targetType: "User",
      targetId: user.id,
      description: `${isActive ? "Activated" : "Deactivated"} ${user.email}`,
      changes: { before, after: user.toJSON() },
    });

    res
      .status(200)
      .json({ success: true, message: "User status updated", data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// PUT /api/users/:id/reset-password — Super Admin sets a temporary password for a user
export const adminResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.password = password; // hashed by beforeSave hook
    await user.save();

    await logAudit({
      req,
      action: "password_reset",
      module: "user",
      targetType: "User",
      targetId: user.id,
      description: `Reset password for ${user.email}`,
    });

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const before = user.toJSON();
    user.isActive = false;
    await user.save();
    await logAudit({
      req,
      action: "deactivate",
      module: "user",
      targetType: "User",
      targetId: req.params.id,
      description: `Deactivated user ${before.email}`,
      changes: { before, after: null },
    });

    res
      .status(200)
      .json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
