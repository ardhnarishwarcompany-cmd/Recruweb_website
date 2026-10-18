import { User, Role, Permission } from "../models/index.js";
import { ROLES } from "../config/roles.js";

export const checkPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Super Admin has all permissions
      if (req.user.role === ROLES.SUPER_ADMIN) {
        return next();
      }

      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: "roles",
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { attributes: [] },
              },
            ],
          },
        ],
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account is disabled",
        });
      }

      const permissions = [
        ...(user.permissions || []), // old JSON permissions
        ...user.roles.flatMap((role) =>
          role.permissions.map((permission) => permission.name),
        ),
      ];

      const uniquePermissions = [...new Set(permissions)];
      const allowed = requiredPermissions.every((permission) =>
        uniquePermissions.includes(permission),
      );
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
};
