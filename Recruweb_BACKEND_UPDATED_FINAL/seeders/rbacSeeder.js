import { Role, Permission } from "../models/index.js";

import {
  ALL_ROLES,
  ALL_PERMISSIONS,
  DEFAULT_PERMISSIONS_BY_ROLE,
} from "../config/roles.js";

export const seedRBAC = async () => {
  try {
    console.log("🌱 Seeding RBAC...");

    // Create Roles
    for (const roleName of ALL_ROLES) {
      await Role.findOrCreate({
        where: {
          name: roleName,
        },
      });
    }

    // Create Permissions
    for (const permissionName of ALL_PERMISSIONS) {
      await Permission.findOrCreate({
        where: {
          name: permissionName,
        },
      });
    }

    // Assign Permissions
    for (const roleName of ALL_ROLES) {
      const role = await Role.findOne({
        where: { name: roleName },
      });

      const permissions = DEFAULT_PERMISSIONS_BY_ROLE[roleName] || [];

      for (const permissionName of permissions) {
        const permission = await Permission.findOne({
          where: { name: permissionName },
        });

        if (permission) {
          const exists = await role.hasPermission(permission);

          if (!exists) {
            await role.addPermission(permission);
          }
        }
      }
    }

    console.log("✅ RBAC Seed Complete");
  } catch (err) {
    console.error(err);
  }
};
