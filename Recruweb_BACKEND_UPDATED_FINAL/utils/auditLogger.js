import { AuditLog } from "../models/index.js";

// Central helper for writing to the audit trail. Never throws — logging a
// failure here should never break the actual request that triggered it.
//
//   await logAudit({
//     req,                              // optional, used for ip/userAgent + actor if `actor` not given
//     actor: req.user,                  // optional override, e.g. when req.user isn't set yet (login)
//     action: 'create',                 // 'login_success' | 'login_failed' | 'logout' | 'create' | 'update' | 'delete' | 'deactivate' | 'activate' | ...
//     module: 'user',                   // 'auth' | 'user' | 'branch' | 'settings' | 'job' | ...
//     targetType: 'User',
//     targetId: newUser.id,
//     description: `Created staff user ${newUser.email}`,
//     changes: { before, after },       // optional, populates "Changes Tracking"
//     status: 'success',                // 'success' | 'failed'
//   });
export const logAudit = async ({
  req,
  actor,
  action,
  module,
  targetType,
  targetId,
  description,
  changes,
  status = "success",
}) => {
  try {
    const user = actor || req?.user || null;

    await AuditLog.create({
      userId: user?.id ?? null,
      userName: user?.name ?? null,
      userEmail: user?.email ?? null,
      userRole: user?.role ?? null,
      action,
      module,
      targetType: targetType ?? null,
      targetId: targetId != null ? String(targetId) : null,
      description: description ?? null,
      changes: changes ?? null,
      status,
      ipAddress: req?.ip ?? null,
      userAgent: req?.headers?.["user-agent"] ?? null,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
};
