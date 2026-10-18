// Centralized RBAC role definitions.
// Single source of truth for role names used across models, middleware and routes.

export const ROLES = Object.freeze({
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  RECRUITER: "recruiter",
  HR: "hr",
  HR_MANAGER: "hr_manager",
  RECRUITMENT_MANAGER: "recruitment_manager",
  CLIENT: "client",
  CANDIDATE: "candidate",
  FINANCE_MANAGER: "finance_manager",
  // Merged in from D RTPN: an external recruiting partner/vendor who
  // sources candidates and earns commission (see models/HrPartnerProfile.js
  // + models/Wallet.js) — distinct from the internal `hr` staff role above.
  HR_PARTNER: "hr_partner",
});

export const ALL_ROLES = Object.values(ROLES);

// Roles allowed to self-register through the public /api/auth/register endpoint.
// Internal/staff roles are provisioned by a Super Admin / Admin only (see
// authController.createStaffUser), never through public self-registration.
// HR Partner can self-register (same as D) but starts in a "pending" status
// on their HrPartnerProfile until an Admin approves them — see
// hrPartnerController.approveHrPartner.
export const PUBLIC_SELF_REGISTER_ROLES = [ROLES.CANDIDATE, ROLES.CLIENT, ROLES.HR_PARTNER];

// Convenience groups reused across route files for RBAC checks.
export const ROLE_GROUPS = Object.freeze({
  // Full, unrestricted back-office access.
  ADMIN_ONLY: [ROLES.SUPER_ADMIN, ROLES.ADMIN],

  // Anyone who works internally at the staffing company (i.e. not client/candidate).
  STAFF: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.RECRUITER,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.RECRUITMENT_MANAGER,
    ROLES.FINANCE_MANAGER,
  ],

  // Manage job postings & the recruitment pipeline.
  RECRUITMENT: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.RECRUITER,
    ROLES.RECRUITMENT_MANAGER,
    ROLES.HR_MANAGER,
  ],

  // Manage HR-side operations (new joiners, employee records).
  HR_OPS: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.HR_MANAGER],

  // Manage client/company records & inquiries.
  CLIENT_MGMT: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECRUITMENT_MANAGER],

  // Dashboards / reporting, incl. finance visibility.
  ANALYTICS: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
    ROLES.RECRUITMENT_MANAGER,
    ROLES.FINANCE_MANAGER,
  ],

  // Phase 8 — Finance Module: raise invoices, record payments/collections.
  FINANCE: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE_MANAGER],

  // Merged in from D RTPN: staff who can review/approve HR Partners and
  // release their commission payouts.
  // Chat access for external HR Partners. Controllers scope each thread to records
  // assigned to / created by the authenticated HR Partner.
  CHAT: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.RECRUITER,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.RECRUITMENT_MANAGER,
    ROLES.FINANCE_MANAGER,
    ROLES.HR_PARTNER,
  ],

  HR_PARTNER_MGMT: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
    ROLES.FINANCE_MANAGER,
  ],

  // Phase 8 — AI tools & Automation console (recruiter/HR facing).
  AI_AUTOMATION: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.RECRUITER,
    ROLES.HR,
    ROLES.HR_MANAGER,
    ROLES.RECRUITMENT_MANAGER,
  ],
});

// ---- Fine-grained permissions (Super Admin > User Management > Permissions) ----
// These sit on top of `role` — role decides what a user CAN be granted, this
// list decides what they're actually granted right now (User.permissions).
// A Super Admin implicitly has every permission regardless of this list.
export const PERMISSIONS = Object.freeze({
  MANAGE_USERS: "manage_users",
  MANAGE_BRANCHES: "manage_branches",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  MANAGE_JOBS: "manage_jobs",
  MANAGE_CANDIDATES: "manage_candidates",
  MANAGE_CLIENTS: "manage_clients",
  VIEW_REVENUE: "view_revenue",
  MANAGE_TASKS: "manage_tasks",
  MANAGE_FINANCE: "manage_finance",
  USE_AI_TOOLS: "use_ai_tools",
  MANAGE_AUTOMATION: "manage_automation",
  MANAGE_RESOURCES: "manage_resources",
});

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Sensible starting permission set applied when a new staff user is created,
// keyed by role. Super Admin can always fine-tune afterwards.
export const DEFAULT_PERMISSIONS_BY_ROLE = Object.freeze({
  [ROLES.SUPER_ADMIN]: [...ALL_PERMISSIONS],
  [ROLES.ADMIN]: [...ALL_PERMISSIONS],
  [ROLES.RECRUITMENT_MANAGER]: [
    PERMISSIONS.MANAGE_JOBS,
    PERMISSIONS.MANAGE_CANDIDATES,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.USE_AI_TOOLS,
    PERMISSIONS.MANAGE_RESOURCES,
  ],
  [ROLES.HR_MANAGER]: [
    PERMISSIONS.MANAGE_CANDIDATES,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.USE_AI_TOOLS,
    PERMISSIONS.MANAGE_RESOURCES,
  ],
  [ROLES.RECRUITER]: [
    PERMISSIONS.MANAGE_CANDIDATES,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.USE_AI_TOOLS,
  ],
  [ROLES.HR]: [
    PERMISSIONS.MANAGE_CANDIDATES,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.USE_AI_TOOLS,
  ],
  [ROLES.FINANCE_MANAGER]: [
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.MANAGE_FINANCE,
  ],
  [ROLES.CLIENT]: [],
  [ROLES.CANDIDATE]: [],
  [ROLES.HR_PARTNER]: [],
});
