import { User } from "../models/index.js";
import { ROLE_GROUPS, ROLES } from "../config/roles.js";

// A lightweight, read-only endpoint (name/email/role only) so CRM/Lead
// screens can populate "Account Manager" / "Assigned To" dropdowns without
// needing the full Super-Admin-only User Management permission.
export const getAssignableUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: [...ROLE_GROUPS.STAFF, ROLES.HR_PARTNER], isActive: true },
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
    });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
};
