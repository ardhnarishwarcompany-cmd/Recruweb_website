import { Permission, Role } from "../models/index.js";

// Get All Permissions
export const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      count: permissions.length,
      data: permissions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Permission
export const getPermission = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    res.json({
      success: true,
      data: permission,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Create Permission
export const createPermission = async (req, res) => {
  try {
    const permission = await Permission.create(req.body);

    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Permission
export const updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    await permission.update(req.body);

    res.json({
      success: true,
      data: permission,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Permission
export const deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    await permission.destroy();

    res.json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Assign Permission to Role
export const assignPermission = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    const role = await Role.findByPk(roleId);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      return res.status(404).json({
        success: false,
        message: "Role or Permission not found",
      });
    }

    await role.addPermission(permission);

    res.json({
      success: true,
      message: "Permission assigned successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Remove Permission from Role
export const removePermission = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    const role = await Role.findByPk(roleId);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      return res.status(404).json({
        success: false,
        message: "Role or Permission not found",
      });
    }

    await role.removePermission(permission);

    res.json({
      success: true,
      message: "Permission removed successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
