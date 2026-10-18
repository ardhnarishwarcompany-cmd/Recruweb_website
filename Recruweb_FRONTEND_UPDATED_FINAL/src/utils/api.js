const sameOrigin = typeof window !== "undefined" ? window.location.origin.replace(/\/+$/, "") : "https://recruweb.com";
export const API_URL = (import.meta.env.VITE_API_URL || `${sameOrigin}/api`).replace(/\/+$/, "");
// ---- Auth token helpers (shared across Admin/Candidate/Client portals) ----
const TOKEN_KEY = "recruweb_admin_token";

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
const REFRESH_KEY = "recruweb_refresh_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (token) =>
  localStorage.setItem(REFRESH_KEY, token);
export const clearRefreshToken = () => localStorage.removeItem(REFRESH_KEY);

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Every portal (Admin/Candidate/Client) shares this same client. On a 401
// (expired/invalid session) it sends the user back to the common auth
// login screen — same page as every portal's own Logout button now uses.
const loginPathForCurrentPortal = () => "/login";

const clearSession = () => {
  clearToken();
  clearRefreshToken();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};



const openAuthenticatedFile = async (url, fallbackName = "document") => {
  const previewWindow = window.open("", "_blank");
  try {
    const request = async () => fetch(url, { headers: { ...authHeaders() } });
    let res = await request();
    if (res.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) res = await request();
    }
    if (res.status === 401) {
      previewWindow?.close();
      clearSession();
      window.location.hash = loginPathForCurrentPortal();
      throw new Error("Session expired. Please log in again.");
    }
    if (!res.ok) {
      previewWindow?.close();
      let message = "Preview failed";
      try {
        const body = await res.json();
        message = body?.message || message;
      } catch {}
      throw new Error(message);
    }
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    if (previewWindow) {
      previewWindow.location.href = objectUrl;
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
    } else {
      const a = document.createElement("a");
      a.href = objectUrl;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.click();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
    }
    return objectUrl;
  } catch (error) {
    if (previewWindow && !previewWindow.closed) previewWindow.close();
    throw error;
  }
};

const downloadAuthenticatedFile = async (url, fallbackName = "download") => {
  const request = async () => fetch(url, { headers: { ...authHeaders() } });
  let res = await request();
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) res = await request();
  }
  if (res.status === 401) {
    clearSession();
    window.location.hash = loginPathForCurrentPortal();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    let message = "Download failed";
    try {
      const body = await res.json();
      message = body?.message || message;
    } catch {}
    throw new Error(message);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackName;
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
};

// Attempts exactly one silent refresh using the stored refresh token. On
// success, stores the new access/refresh pair and returns true so the caller
// can retry its original request once. On failure, clears the session so the
// caller falls through to a login redirect.
let refreshInFlight = null;
const tryRefreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const body = await res.json();
        if (!body.success) return false;
        setToken(body.data.accessToken || body.data.token);
        if (body.data.refreshToken) setRefreshToken(body.data.refreshToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

const authFetch = async (url, options = {}) => {
  try {
    let res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        res = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
            ...(options.headers || {}),
          },
        });
      }
    }

    if (res.status === 401) {
      clearSession();
      window.location.hash = loginPathForCurrentPortal();
      return;
    }

    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: "Network Error",
    };
  }
};
// Same as authFetch but for multipart/form-data uploads (resume/document
// files) — the browser must set its own Content-Type with the boundary, so
// we deliberately don't send one here.
const authFetchForm = async (url, formData, method = "POST") => {
  try {
    let res = await fetch(url, {
      method,
      headers: { ...authHeaders() },
      body: formData,
    });

    if (res.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        res = await fetch(url, {
          method,
          headers: { ...authHeaders() },
          body: formData,
        });
      }
    }

    if (res.status === 401) {
      clearSession();
      window.location.hash = loginPathForCurrentPortal();
      return;
    }

    return await res.json();
  } catch (err) {
    return { success: false, message: "Network Error" };
  }
};

export const api = {
  contact: {
    submit: async (data) => {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getAll: () => authFetch(`${API_URL}/contact`),
    updateStatus: (id, status) =>
      authFetch(`${API_URL}/contact/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    delete: (id) => authFetch(`${API_URL}/contact/${id}`, { method: "DELETE" }),
  },

  // Chat Assistant "Contact" tab -> HRMS website-bridge (via our backend proxy)
  websiteChat: {
    getHrs: async () => {
      const res = await fetch(`${API_URL}/website-chat/hrs`);
      return res.json();
    },
    submit: async (data) => {
      const res = await fetch(`${API_URL}/website-chat/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getMessages: async (token, after = 0) => {
      const res = await fetch(`${API_URL}/website-chat/chat/${token}?after=${after}`);
      return res.json();
    },
    send: async (token, text) => {
      const res = await fetch(`${API_URL}/website-chat/chat/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      return res.json();
    },
  },

  // New Joiner Form (employee joining form submitted by newly hired candidates)
  employeeJoining: {
    submit: async (data) => {
      const res = await fetch(`${API_URL}/employee-joining`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getAll: () => authFetch(`${API_URL}/employee-joining`),
    getById: (id) => authFetch(`${API_URL}/employee-joining/${id}`),
    updateStatus: (id, status) =>
      authFetch(`${API_URL}/employee-joining/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
  },

  // Client Inquiry Form ("Get Started")
  getStarted: {
    submit: async (data) => {
      const res = await fetch(`${API_URL}/get-started`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getAll: () => authFetch(`${API_URL}/get-started`),
    updateStatus: (id, status) =>
      authFetch(`${API_URL}/get-started/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
  },
  clientInquiry: {
    submit: async (data) => {
      const res = await fetch(`${API_URL}/client-inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  subscribers: {
    subscribe: async (email) => {
      const res = await fetch(`${API_URL}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return res.json();
    },
    getAll: () => authFetch(`${API_URL}/subscribers`),
  },

  jobs: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/jobs?${queryString}`);
      return res.json();
    },
    getById: async (id) => {
      const res = await fetch(`${API_URL}/jobs/${id}`);
      return res.json();
    },
    getFeatured: async () => {
      const res = await fetch(`${API_URL}/jobs/featured`);
      return res.json();
    },
    apply: async (jobId, data, resumeFile) => {
      // When a resume file is attached, submit as multipart/form-data so the
      // backend (resumeUpload middleware) can store it and auto-run Resume
      // Screening. Falls back to plain JSON when no file is given.
      if (resumeFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null)
            formData.append(key, value);
        });
        formData.append("resume", resumeFile);
        const res = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
          method: "POST",
          body: formData,
        });
        return res.json();
      }
      const res = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    create: (data) =>
      authFetch(`${API_URL}/jobs`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    // Public "Post a Job" form — no login required. Saved as inactive until
    // a staff member reviews and approves it from the Admin Jobs panel.
    request: async (data) => {
      const res = await fetch(`${API_URL}/jobs/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: (id, data) =>
      authFetch(`${API_URL}/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) => authFetch(`${API_URL}/jobs/${id}`, { method: "DELETE" }),
    // Applied candidates (ATS pipeline)
    getAllApplications: () => authFetch(`${API_URL}/jobs/applications`),
    getApplications: (jobId) =>
      authFetch(`${API_URL}/jobs/${jobId}/applications`),
  },

  publicInterviews: {
    getAvailability: (timezone) => {
      const qs = timezone
        ? `?timezone=${encodeURIComponent(timezone)}`
        : "";
      return fetch(`${API_URL}/interviews${qs}`)
        .then((res) => res.json())
        .catch(() => ({
          success: false,
          message: "Network Error",
        }));
    },
    schedule: (data) =>
      fetch(`${API_URL}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .catch(() => ({
          success: false,
          message: "Network Error",
        })),
  },

  applications: {
    // Candidate Inbox — searchable/filterable list of every applied candidate.
    // params: { status, jobId, assignedToId, search, minScore, page, limit }
    getInbox: (params = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== "" && v != null),
        ),
      ).toString();
      return authFetch(`${API_URL}/applications${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => authFetch(`${API_URL}/applications/${id}`),
    // Update the ATS stage of a single applied candidate.
    updateStatus: (id, status, notes) =>
      authFetch(`${API_URL}/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      }),
    // Candidate Assignment — assign (or pass null/'' to unassign) to a recruiter.
    assign: (id, userId) =>
      authFetch(`${API_URL}/applications/${id}/assign`, {
        method: "PUT",
        body: JSON.stringify({ userId: userId || null }),
      }),
    // Resume Screening — (re)run keyword + AI screening on demand.
    screen: (id) =>
      authFetch(`${API_URL}/applications/${id}/screen`, { method: "POST" }),
    delete: (id) =>
      authFetch(`${API_URL}/applications/${id}`, { method: "DELETE" }),
  },

  companies: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/companies?${queryString}`);
      return res.json();
    },
    getById: async (id) => {
      const res = await fetch(`${API_URL}/companies/${id}`);
      return res.json();
    },
    getFeatured: async () => {
      const res = await fetch(`${API_URL}/companies/featured`);
      return res.json();
    },
    getIndustries: async () => {
      const res = await fetch(`${API_URL}/companies/industries`);
      return res.json();
    },
  },

  tasks: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/tasks?${qs}`);
    },
    create: (data) =>
      authFetch(`${API_URL}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) => authFetch(`${API_URL}/tasks/${id}`, { method: "DELETE" }),
  },

  analytics: {
    getDashboard: () => authFetch(`${API_URL}/analytics/dashboard`),
    getSuperAdminStats: () => authFetch(`${API_URL}/analytics/super-admin`),
    // Phase 6 — pass ?displayCurrency=XXX to also get a live-converted
    // revenue snapshot (see backend/controllers/analyticsController.js);
    // the original INR figures are always returned unchanged too.
    getCEODashboard: (displayCurrency) =>
      authFetch(
        `${API_URL}/analytics/ceo${displayCurrency ? `?displayCurrency=${displayCurrency}` : ""}`,
      ),
  },

  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    },
    me: () => authFetch(`${API_URL}/auth/me`),
    logout: async () => {
      const refreshToken = getRefreshToken();
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Best-effort — clear the local session either way.
      }
      clearToken();
      clearRefreshToken();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },

  // ---- Super Admin: User Management ----
  users: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/users?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/users/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/users`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    assignRole: (id, role, permissions) =>
      authFetch(`${API_URL}/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role, permissions }),
      }),
    updatePermissions: (id, permissions) =>
      authFetch(`${API_URL}/users/${id}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions }),
      }),
    setStatus: (id, isActive) =>
      authFetch(`${API_URL}/users/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      }),
    resetPassword: (id, password) =>
      authFetch(`${API_URL}/users/${id}/reset-password`, {
        method: "PUT",
        body: JSON.stringify({ password }),
      }),
    delete: (id) => authFetch(`${API_URL}/users/${id}`, { method: "DELETE" }),
  },

  // ---- Super Admin: Branch Management ----
  branches: {
    getAll: () => authFetch(`${API_URL}/branches`),
    getById: (id) => authFetch(`${API_URL}/branches/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/branches`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/branches/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/branches/${id}`, { method: "DELETE" }),
  },

  // ---- Super Admin: Settings (Company / Email / WhatsApp / SMS) ----
  settings: {
    getAll: () => authFetch(`${API_URL}/settings`),
    getByCategory: (category) => authFetch(`${API_URL}/settings/${category}`),
    update: (category, data) =>
      authFetch(`${API_URL}/settings/${category}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // ---- Super Admin: Audit Logs (Login History / Activity Logs / Changes Tracking) ----
  auditLogs: {
    getActivity: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/audit-logs?${qs}`);
    },
    getLoginHistory: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/audit-logs/login-history?${qs}`);
    },
    getChanges: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/audit-logs/changes?${qs}`);
    },
  },

  // Lightweight assignable-users lookup (Account Manager / Assigned To dropdowns)
  team: {
    getAssignableUsers: () => authFetch(`${API_URL}/team/assignable-users`),
  },

  // ---- Phase 4: CRM System ----

  // Client CRM: Clients
  crmClients: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/crm/clients?${qs}`);
    },
    getStats: () => authFetch(`${API_URL}/crm/clients/stats`),
    getById: (id) => authFetch(`${API_URL}/crm/clients/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/crm/clients`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/crm/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/crm/clients/${id}`, { method: "DELETE" }),
  },

  // Client CRM: Contacts
  crmContacts: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/crm/contacts?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/crm/contacts/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/crm/contacts`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/crm/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/crm/contacts/${id}`, { method: "DELETE" }),
  },

  // Client CRM: Companies
  crmCompanies: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/crm/companies?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/crm/companies/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/crm/companies`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/crm/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/crm/companies/${id}`, { method: "DELETE" }),
  },

  // Client CRM: Requirements
  crmRequirements: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/crm/requirements?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/crm/requirements/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/crm/requirements`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/crm/requirements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/crm/requirements/${id}`, { method: "DELETE" }),
  },

  // Client CRM: Notes (polymorphic — entityType + entityId)
  crmNotes: {
    getAll: (entityType, entityId) =>
      authFetch(
        `${API_URL}/crm/notes?entityType=${entityType}&entityId=${entityId}`,
      ),
    create: (data) =>
      authFetch(`${API_URL}/crm/notes`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/crm/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/crm/notes/${id}`, { method: "DELETE" }),
  },

  // Client CRM: Contracts
  crmContracts: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/crm/contracts?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/crm/contracts/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/crm/contracts`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/crm/contracts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    uploadDocument: (id, file) => {
      const form = new FormData();
      form.append("document", file);
      return authFetchForm(`${API_URL}/crm/contracts/${id}/document`, form);
    },
    delete: (id) =>
      authFetch(`${API_URL}/crm/contracts/${id}`, { method: "DELETE" }),
  },

  // Staff: candidate submissions to clients (Phase 7 backing data)
  crmSubmissions: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/crm/submissions?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/crm/submissions/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/crm/submissions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/crm/submissions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    review: (id, action, note = "") =>
      authFetch(`${API_URL}/crm/submissions/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ action, note }),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/crm/submissions/${id}`, { method: "DELETE" }),
  },

  // Staff: client invoices (Phase 7 backing data)
  crmInvoices: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/crm/invoices?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/crm/invoices/${id}`),
    create: (data, file) => {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, v);
      });
      if (file) form.append("file", file);
      return authFetchForm(`${API_URL}/crm/invoices`, form, "POST");
    },
    update: (id, data, file) => {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, v);
      });
      if (file) form.append("file", file);
      return authFetchForm(`${API_URL}/crm/invoices/${id}`, form, "PUT");
    },
    delete: (id) =>
      authFetch(`${API_URL}/crm/invoices/${id}`, { method: "DELETE" }),
    download: (id) =>
      downloadAuthenticatedFile(
        `${API_URL}/crm/invoices/${id}/download`,
        `invoice-${id}.pdf`,
      ),
  },

  // Staff: reply to client chat threads (Phase 7)
  crmClientChat: {
    getThreads: () => authFetch(`${API_URL}/crm/client-chat/threads`),
    getThreadMessages: (clientId) =>
      authFetch(`${API_URL}/crm/client-chat/threads/${clientId}`),
    reply: (clientId, message) =>
      authFetch(`${API_URL}/crm/client-chat/threads/${clientId}`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    updateMessage: (messageId, data) =>
      authFetch(`${API_URL}/crm/client-chat/messages/${messageId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteMessage: (messageId) =>
      authFetch(`${API_URL}/crm/client-chat/messages/${messageId}`, {
        method: "DELETE",
      }),
    startCall: (clientId) =>
      authFetch(`${API_URL}/crm/client-chat/threads/${clientId}/call`, {
        method: "POST",
      }),
  },

  // Staff: reply to candidate chat threads (Phase 4 — real-time)
  crmCandidateChat: {
    getThreads: () => authFetch(`${API_URL}/crm/candidate-chat/threads`),
    getThreadMessages: (candidateId) =>
      authFetch(`${API_URL}/crm/candidate-chat/threads/${candidateId}`),
    reply: (candidateId, message) =>
      authFetch(`${API_URL}/crm/candidate-chat/threads/${candidateId}`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    startCall: (candidateId) =>
      authFetch(`${API_URL}/crm/candidate-chat/threads/${candidateId}/call`, {
        method: "POST",
      }),
  },

  // Direct HR Partner <-> Admin Support Chat (real database messages only)
  supportChat: {
    getThreads: () => authFetch(`${API_URL}/support-chat/threads`),
    getMyMessages: () => authFetch(`${API_URL}/support-chat/me`),
    getMessages: (userId) =>
      authFetch(`${API_URL}/support-chat/threads/${userId}`),
    sendMyMessage: (message) =>
      authFetch(`${API_URL}/support-chat/me`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    sendMessage: (userId, message) =>
      authFetch(`${API_URL}/support-chat/threads/${userId}`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
  },

  // Phase 8 — Finance Module: revenue reports, summary, collections
  finance: {
    getSummary: () => authFetch(`${API_URL}/finance/summary`),
    getRevenueReport: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/finance/revenue-reports?${qs}`);
    },
    getCollections: () => authFetch(`${API_URL}/finance/collections`),
  },

  // Phase 8 — Payments recorded against invoices (collections)
  payments: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/finance/payments?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/finance/payments/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/finance/payments`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/finance/payments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/finance/payments/${id}`, { method: "DELETE" }),
  },

  // Phase 8 — AI: JD Parser, Job Matching, Candidate Ranking, Email Writer
  ai: {
    parseJD: (data) =>
      authFetch(`${API_URL}/ai/parse-jd`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    reparseResume: (candidateId) =>
      authFetch(`${API_URL}/ai/re-parse-resume/${candidateId}`, {
        method: "POST",
      }),
    matchCandidates: (jobId) => authFetch(`${API_URL}/ai/match/${jobId}`),
    rankCandidates: (jobId) => authFetch(`${API_URL}/ai/rank/${jobId}`),
    getMatchScore: (candidateId, jobId) =>
      authFetch(`${API_URL}/ai/match-score`, {
        method: "POST",
        body: JSON.stringify({ candidateId, jobId }),
      }),
    generateEmail: (data) =>
      authFetch(`${API_URL}/ai/generate-email`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Phase 8 — Automation: Email/WhatsApp/SMS logs, manual send, reminders
  automation: {
    getLogs: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/automation/logs?${qs}`);
    },
    getStats: () => authFetch(`${API_URL}/automation/stats`),
    send: (data) =>
      authFetch(`${API_URL}/automation/send`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    runRemindersNow: () =>
      authFetch(`${API_URL}/automation/run-reminders`, { method: "POST" }),
  },

  // Lead CRM: New Inquiry Form + Inquiry Dashboard + Assignment + Conversion
  leads: {
    submit: async (data) => {
      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/leads?${qs}`);
    },
    getDashboard: () => authFetch(`${API_URL}/leads/dashboard`),
    getDueFollowUps: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/leads/follow-ups/due?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/leads/${id}`),
    update: (id, data) =>
      authFetch(`${API_URL}/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    assign: (id, assignedToId) =>
      authFetch(`${API_URL}/leads/${id}/assign`, {
        method: "PUT",
        body: JSON.stringify({ assignedToId }),
      }),
    convert: (id, data = {}) =>
      authFetch(`${API_URL}/leads/${id}/convert`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    markLost: (id, lostReason) =>
      authFetch(`${API_URL}/leads/${id}/lost`, {
        method: "PUT",
        body: JSON.stringify({ lostReason }),
      }),
    delete: (id) => authFetch(`${API_URL}/leads/${id}`, { method: "DELETE" }),
    // Follow-ups (nested under a lead)
    getFollowUps: (leadId) =>
      authFetch(`${API_URL}/leads/${leadId}/follow-ups`),
    createFollowUp: (leadId, data) =>
      authFetch(`${API_URL}/leads/${leadId}/follow-ups`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  leadFollowUps: {
    update: (id, data) =>
      authFetch(`${API_URL}/lead-follow-ups/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/lead-follow-ups/${id}`, { method: "DELETE" }),
  },

  // ---- Phase 3: ATS — Candidate Pipeline ----
  // (New Lead -> CV Received -> AI Screened -> Recruiter Reviewed ->
  //  Submitted To Client -> Interview Scheduled -> Interview Cleared ->
  //  Offer Released -> Joined -> Retained 90 Days)
  candidates: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/candidates?${qs}`);
    },
    getById: (id) => authFetch(`${API_URL}/candidates/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/candidates`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/candidates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/candidates/${id}`, { method: "DELETE" }),
    updateStage: (id, stage) =>
      authFetch(`${API_URL}/candidates/${id}/pipeline`, {
        method: "PUT",
        body: JSON.stringify({ stage }),
      }),
    updateRating: (id, rating) =>
      authFetch(`${API_URL}/candidates/${id}/rating`, {
        method: "PUT",
        body: JSON.stringify({ rating }),
      }),
    addNote: (id, note) =>
      authFetch(`${API_URL}/candidates/${id}/note`, {
        method: "POST",
        body: JSON.stringify({ note }),
      }),
    getTimeline: (id) => authFetch(`${API_URL}/candidates/${id}/timeline`),
    previewResume: (id) =>
      openAuthenticatedFile(`${API_URL}/candidates/${id}/resume`, `resume-${id}`),
    previewDocument: (id, index) =>
      openAuthenticatedFile(`${API_URL}/candidates/${id}/document/${index}/view`, `candidate-document-${index + 1}`),
    previewOfferLetter: (id) =>
      openAuthenticatedFile(`${API_URL}/candidates/${id}/offer-letter/view`, `offer-letter-${id}.pdf`),
    uploadResume: (id, file) => {
      const form = new FormData();
      form.append("resume", file);
      return authFetchForm(`${API_URL}/candidates/${id}/resume`, form);
    },
    uploadDocument: (id, file, label) => {
      const form = new FormData();
      form.append("document", file);
      if (label) form.append("label", label);
      return authFetchForm(`${API_URL}/candidates/${id}/document`, form);
    },
    // New Joiner Module — Verification: approve/reject a document.
    verifyDocument: (id, index, status, remarks) =>
      authFetch(`${API_URL}/candidates/${id}/document/${index}/verify`, {
        method: "PUT",
        body: JSON.stringify({ status, remarks }),
      }),
    // New Joiner Module — Offer Upload.
    uploadOfferLetter: (id, file) => {
      const form = new FormData();
      form.append("offerLetter", file);
      return authFetchForm(`${API_URL}/candidates/${id}/offer-letter`, form);
    },
    // New Joiner Module — Joining Tracker.
    getTracker: (id) => authFetch(`${API_URL}/candidates/${id}/tracker`),
    // Reject / restore a candidate based on performance or evaluation.
    reject: (id, reason) =>
      authFetch(`${API_URL}/candidates/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      }),
    unreject: (id) =>
      authFetch(`${API_URL}/candidates/${id}/unreject`, { method: "PUT" }),
    // Auto-generate the branded offer letter PDF and email it to the candidate.
    generateOfferLetter: (id, data) =>
      authFetch(`${API_URL}/candidates/${id}/offer-letter/generate`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // ---- Phase 5: Recruiter Workspace ----
  recruiterWorkspace: {
    getDashboard: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/recruiter/dashboard?${qs}`);
    },
    getJobs: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/recruiter/jobs?${qs}`);
    },
    getCandidates: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/recruiter/candidates?${qs}`);
    },
    getTasks: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/recruiter/tasks?${qs}`);
    },
    createTask: (data) =>
      authFetch(`${API_URL}/recruiter/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateTask: (id, data) =>
      authFetch(`${API_URL}/recruiter/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteTask: (id) =>
      authFetch(`${API_URL}/recruiter/tasks/${id}`, { method: "DELETE" }),

    getCalendarEvents: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/recruiter/calendar?${qs}`);
    },
    createCalendarEvent: (data) =>
      authFetch(`${API_URL}/recruiter/calendar`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateCalendarEvent: (id, data) =>
      authFetch(`${API_URL}/recruiter/calendar/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteCalendarEvent: (id) =>
      authFetch(`${API_URL}/recruiter/calendar/${id}`, { method: "DELETE" }),

    getReminders: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/recruiter/reminders?${qs}`);
    },
    createReminder: (data) =>
      authFetch(`${API_URL}/recruiter/reminders`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateReminder: (id, data) =>
      authFetch(`${API_URL}/recruiter/reminders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteReminder: (id) =>
      authFetch(`${API_URL}/recruiter/reminders/${id}`, { method: "DELETE" }),

    getActivities: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/recruiter/activities?${qs}`);
    },
    logActivity: (data) =>
      authFetch(`${API_URL}/recruiter/activities`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getPerformance: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/recruiter/performance?${qs}`);
    },

    getRecruiters: () => authFetch(`${API_URL}/recruiter/recruiters`),
  },

  // ---- Candidate Portal (Phase 6) ----
  candidatePortal: {
    getProfile: () => authFetch(`${API_URL}/candidate-portal/me`),
    updateProfile: (data) =>
      authFetch(`${API_URL}/candidate-portal/me`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    getResume: () => authFetch(`${API_URL}/candidate-portal/me/resume`),
    uploadResume: (file) => {
      const form = new FormData();
      form.append("resume", file);
      return authFetchForm(`${API_URL}/candidate-portal/me/resume`, form);
    },

    getDocuments: () => authFetch(`${API_URL}/candidate-portal/me/documents`),
    uploadDocument: (file, label) => {
      const form = new FormData();
      form.append("document", file);
      if (label) form.append("label", label);
      return authFetchForm(`${API_URL}/candidate-portal/me/documents`, form);
    },

    getApplications: () =>
      authFetch(`${API_URL}/candidate-portal/me/applications`),

    getInterviews: () => authFetch(`${API_URL}/candidate-portal/me/interviews`),
    getTasks: () => authFetch(`${API_URL}/candidate-portal/me/tasks`),
    updateTask: (id, data) =>
      authFetch(`${API_URL}/candidate-portal/me/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    bookInterview: (data) =>
      authFetch(`${API_URL}/candidate-portal/me/interviews`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getOfferLetter: () =>
      authFetch(`${API_URL}/candidate-portal/me/offer-letter`),

    getJoiningForm: () => authFetch(`${API_URL}/candidate-portal/me/joining-form`),
    submitJoiningFormMultipart: (formData) => authFetchForm(`${API_URL}/candidate-portal/me/joining-form`, formData, "POST"),

    getOnboarding: () => authFetch(`${API_URL}/candidate-portal/me/onboarding`),
    submitOnboarding: (data) =>
      authFetch(`${API_URL}/candidate-portal/me/onboarding`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    submitOnboardingMultipart: (formData) =>
      authFetchForm(`${API_URL}/candidate-portal/me/onboarding`, formData, "POST"),

    // Joining Tracker (New Joiner Module)
    getTracker: () => authFetch(`${API_URL}/candidate-portal/me/tracker`),

    // Chat With Recruiter (Phase 4 — real-time chat + calling + AI assist)
    getMessages: () => authFetch(`${API_URL}/candidate-portal/me/messages`),
    sendMessage: (message) =>
      authFetch(`${API_URL}/candidate-portal/me/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    startCall: () =>
      authFetch(`${API_URL}/candidate-portal/me/messages/call`, {
        method: "POST",
      }),
    askAI: (question) =>
      authFetch(`${API_URL}/candidate-portal/me/messages/ask-ai`, {
        method: "POST",
        body: JSON.stringify({ question }),
      }),
  },

  // ---- Live Hiring Tracker ----
  tracker: {
    getStaff: () => authFetch(`${API_URL}/tracker/staff`),
    getClient: () => authFetch(`${API_URL}/tracker/client`),
    getHrPartner: () => authFetch(`${API_URL}/tracker/hr-partner`),
  },

  // ---- Client Portal (Phase 7) ----
  hrms: {
    getPlans: () => fetch(`${API_URL}/hrms/plans`).then((r) => r.json()),
  },

  clientPortal: {
    getProfile: () => authFetch(`${API_URL}/client-portal/me`),
    updateProfile: (data) =>
      authFetch(`${API_URL}/client-portal/me`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    getDashboard: () => authFetch(`${API_URL}/client-portal/dashboard`),
    // Merged in from D RTPN
    getAnalytics: () => authFetch(`${API_URL}/client-portal/analytics`),

    getRequirements: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/client-portal/requirements?${qs}`);
    },
    getRequirement: (id) =>
      authFetch(`${API_URL}/client-portal/requirements/${id}`),
    createRequirement: (data) =>
      authFetch(`${API_URL}/client-portal/requirements`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getSubmissions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/client-portal/submissions?${qs}`);
    },
    approveCandidate: (id, remarks) =>
      authFetch(
        `${API_URL}/client-portal/submissions/${id}/approve-candidate`,
        {
          method: "PUT",
          body: JSON.stringify({ remarks }),
        },
      ),
    rejectCandidate: (id, remarks) =>
      authFetch(`${API_URL}/client-portal/submissions/${id}/reject-candidate`, {
        method: "PUT",
        body: JSON.stringify({ remarks }),
      }),
    approveOffer: (id, remarks) =>
      authFetch(`${API_URL}/client-portal/submissions/${id}/approve-offer`, {
        method: "PUT",
        body: JSON.stringify({ remarks }),
      }),
    rejectOffer: (id, remarks) =>
      authFetch(`${API_URL}/client-portal/submissions/${id}/reject-offer`, {
        method: "PUT",
        body: JSON.stringify({ remarks }),
      }),

    getInterviews: () => authFetch(`${API_URL}/client-portal/interviews`),

    getMessages: () => authFetch(`${API_URL}/client-portal/messages`),
    sendMessage: (message) =>
      authFetch(`${API_URL}/client-portal/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    startCall: () =>
      authFetch(`${API_URL}/client-portal/messages/call`, { method: "POST" }),
    askAI: (question) =>
      authFetch(`${API_URL}/client-portal/messages/ask-ai`, {
        method: "POST",
        body: JSON.stringify({ question }),
      }),

    getInvoices: () => authFetch(`${API_URL}/client-portal/invoices`),
    downloadInvoice: (id) =>
      downloadAuthenticatedFile(
        `${API_URL}/client-portal/invoices/${id}/download`,
        `invoice-${id}.pdf`,
      ),
    getHrmsSubscriptions: () =>
      authFetch(`${API_URL}/client-portal/hrms/subscriptions`),
    createHrmsPurchaseOrder: (data) =>
      authFetch(`${API_URL}/client-portal/hrms/purchase/order`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    verifyHrmsPayment: (data) =>
      authFetch(`${API_URL}/client-portal/hrms/purchase/verify`, {
        method: "POST",
        body: JSON.stringify(data),
      }),


    // Pay Invoice — real, LIVE Razorpay Checkout (no test mode, no mock data)
    createPaymentOrder: (invoiceId) =>
      authFetch(`${API_URL}/client-portal/invoices/${invoiceId}/pay/order`, {
        method: "POST",
      }),
    verifyPayment: (invoiceId, data) =>
      authFetch(`${API_URL}/client-portal/invoices/${invoiceId}/pay/verify`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // ---- Extra Module — Security: Backup System (Super Admin only) ----
  backups: {
    getAll: () => authFetch(`${API_URL}/backups`),
    getStatus: () => authFetch(`${API_URL}/backups/status`),
    create: () => authFetch(`${API_URL}/backups`, { method: "POST" }),
    delete: (filename) =>
      authFetch(`${API_URL}/backups/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      }),
    restore: (filename) =>
      authFetch(`${API_URL}/backups/${encodeURIComponent(filename)}/restore`, {
        method: "POST",
        body: JSON.stringify({ confirm: true }),
      }),
    // File download needs the auth header attached directly (can't use a
    // plain <a href>), so this builds a blob download instead of authFetch.
    download: async (filename) => {
      const res = await fetch(
        `${API_URL}/backups/${encodeURIComponent(filename)}/download`,
        { headers: authHeaders() },
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  },

  // ---- Resume Builder (AI-scored, template-based, ATS-optimized) ----
  resumes: {
    getAll: () => authFetch(`${API_URL}/resumes`),
    getById: (id) => authFetch(`${API_URL}/resumes/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/resumes`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/resumes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) => authFetch(`${API_URL}/resumes/${id}`, { method: "DELETE" }),
    duplicate: (id) =>
      authFetch(`${API_URL}/resumes/${id}/duplicate`, { method: "POST" }),
    score: (payload) =>
      authFetch(`${API_URL}/resumes/score`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    quickScore: (payload) =>
      authFetch(`${API_URL}/resumes/quick-score`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    import: async (formData) => {
      const res = await fetch(`${API_URL}/resumes/import`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      return res.json();
    },
    generateSummary: (payload) =>
      authFetch(`${API_URL}/resumes/generate-summary`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    improveBullet: (text, jobTitle) =>
      authFetch(`${API_URL}/resumes/improve-bullet`, {
        method: "POST",
        body: JSON.stringify({ text, jobTitle }),
      }),
  },

  // ---- AI Cover Letter Builder ----
  coverLetter: {
    generate: (payload) =>
      authFetch(`${API_URL}/cover-letter/generate`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // ---- Public Resume Checker (no login — upload & get an ATS score) ----
  resumeChecker: {
    analyze: async (formData) => {
      const res = await fetch(`${API_URL}/resume-checker/analyze`, {
        method: "POST",
        body: formData,
      });
      return res.json();
    },
  },

  // ---- KYC / Document Verification (merged in from D RTPN) ----
  kyc: {
    uploadDocument: (file, documentType) => {
      const form = new FormData();
      form.append("document", file);
      form.append("documentType", documentType);
      return authFetchForm(`${API_URL}/kyc/documents`, form, "POST");
    },
    getMine: () => authFetch(`${API_URL}/kyc/documents/mine`),
    // Authenticated, streamed preview — opens the actual PDF/image inline
    // in a new tab (with a fallback search on the backend for files that
    // moved rather than being deleted), instead of a raw <a href> straight
    // to the static /uploads URL which bypassed auth and had no fallback.
    previewDocument: (id, fallbackName) =>
      openAuthenticatedFile(`${API_URL}/kyc/documents/${id}/view`, fallbackName || `kyc-document-${id}`),
    delete: (id) =>
      authFetch(`${API_URL}/kyc/documents/${id}`, { method: "DELETE" }),
    // Staff-only review queue
    getAll: (status) =>
      authFetch(`${API_URL}/kyc/documents${status ? `?status=${status}` : ""}`),
    review: (id, status, rejectionReason) =>
      authFetch(`${API_URL}/kyc/documents/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      }),
  },

  // ---- HR Partner (merged in from D RTPN) — same auth/session as every
  // other portal, this is just its own set of endpoints. ----
  hrPartner: {
    updateMyProfile: (data) =>
  authFetch(`${API_URL}/hr-partners/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
    getMyProfile: () => authFetch(`${API_URL}/hr-partners/profile`),
    createMyProfile: (data) =>
      authFetch(`${API_URL}/hr-partners/profile`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMyWallet: () => authFetch(`${API_URL}/hr-partners/wallet`),
    getDashboard: () => authFetch(`${API_URL}/hr-partners/dashboard`),
    getOpenVacancies: () => authFetch(`${API_URL}/hr-partners/vacancies`),
    getMySubmissions: () => authFetch(`${API_URL}/hr-partners/submissions`),
    createSubmission: (data) =>
      authFetch(`${API_URL}/hr-partners/submissions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    // Staff (HR/Finance) oversight
    getAll: (status) =>
      authFetch(`${API_URL}/hr-partners${status ? `?status=${status}` : ""}`),
    approve: (id, status) =>
      authFetch(`${API_URL}/hr-partners/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    creditWallet: (data) =>
      authFetch(`${API_URL}/hr-partners/wallet/credit`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getPendingPayouts: () =>
      authFetch(`${API_URL}/hr-partners/wallet/transactions/pending`),
    releasePayout: (id) =>
      authFetch(`${API_URL}/hr-partners/wallet/transactions/${id}/release`, {
        method: "PATCH",
      }),
  },

  // ---- Support Tickets (merged in from D RTPN) — usable by any role ----
  supportTickets: {
    create: (data) =>
      authFetch(`${API_URL}/support-tickets`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMine: () => authFetch(`${API_URL}/support-tickets/mine`),
    getDetail: (id) => authFetch(`${API_URL}/support-tickets/${id}`),
    addReply: (id, message) =>
      authFetch(`${API_URL}/support-tickets/${id}/replies`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    // Staff-only
    getAll: (status) =>
      authFetch(`${API_URL}/support-tickets${status ? `?status=${status}` : ""}`),
    update: (id, data) =>
      authFetch(`${API_URL}/support-tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // ---- SOP Center: shared policy library + approval email inbox ----
  sops: {
    getPublic: async () => {
      const res = await fetch(`${API_URL}/sops/public`);
      return res.json();
    },
    getAll: () => authFetch(`${API_URL}/sops`),
    getStats: () => authFetch(`${API_URL}/sops/stats`),
    getById: (id) => authFetch(`${API_URL}/sops/${id}`),
    create: (data) =>
      authFetch(`${API_URL}/sops`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      authFetch(`${API_URL}/sops/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      authFetch(`${API_URL}/sops/${id}`, { method: "DELETE" }),
    emailPreview: (id, data) =>
      authFetch(`${API_URL}/sops/${id}/email-preview`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    emailSend: (id, data) =>
      authFetch(`${API_URL}/sops/${id}/email-send`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    inbox: () => authFetch(`${API_URL}/sops/inbox/items`),
    requestApproval: (id) =>
      authFetch(`${API_URL}/sops/${id}/request-approval`, {
        method: "POST",
      }),
    requestApprovalStatus: (id) =>
      authFetch(`${API_URL}/sops/${id}/request-status`),
    inboxAction: (id, action, note) =>
      authFetch(`${API_URL}/sops/inbox/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, note }),
      }),
    approve: (id, action, note) =>
      authFetch(`${API_URL}/sops/${id}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ action, note }),
      }),
  },

  // ---- Free Hiring Resource Center (public reads + admin-managed content) ----
  resourceCenter: {
    getStats: () => authFetch(`${API_URL}/resource-center/stats`),
    getSalaryGuides: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/resource-center/salary-guides?${qs}`);
    },
    getInterviewQuestions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/resource-center/interview-questions?${qs}`);
    },
    getTemplates: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(`${API_URL}/resource-center/templates?${qs}`);
    },
    downloadTemplate: (id) => {
      window.open(
        `${API_URL}/resource-center/templates/${id}/download`,
        "_blank",
      );
    },
    getComplianceChecklists: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return authFetch(
        `${API_URL}/resource-center/compliance-checklists?${qs}`,
      );
    },
    downloadChecklist: (id) => {
      window.open(
        `${API_URL}/resource-center/compliance-checklists/${id}/download`,
        "_blank",
      );
    },
    calculatePayroll: (data) =>
      authFetch(`${API_URL}/resource-center/payroll-calculator`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // ---- Admin CRUD (requires MANAGE_RESOURCES permission) ----
    createSalaryGuide: (data) =>
      authFetch(`${API_URL}/resource-center/salary-guides`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateSalaryGuide: (id, data) =>
      authFetch(`${API_URL}/resource-center/salary-guides/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteSalaryGuide: (id) =>
      authFetch(`${API_URL}/resource-center/salary-guides/${id}`, {
        method: "DELETE",
      }),

    createInterviewQuestion: (data) =>
      authFetch(`${API_URL}/resource-center/interview-questions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateInterviewQuestion: (id, data) =>
      authFetch(`${API_URL}/resource-center/interview-questions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteInterviewQuestion: (id) =>
      authFetch(`${API_URL}/resource-center/interview-questions/${id}`, {
        method: "DELETE",
      }),

    createTemplate: (formData) =>
      authFetchForm(`${API_URL}/resource-center/templates`, formData, "POST"),
    deleteTemplate: (id) =>
      authFetch(`${API_URL}/resource-center/templates/${id}`, {
        method: "DELETE",
      }),

    createChecklist: (data) =>
      authFetch(`${API_URL}/resource-center/compliance-checklists`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateChecklist: (id, data) =>
      authFetch(`${API_URL}/resource-center/compliance-checklists/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteChecklist: (id) =>
      authFetch(`${API_URL}/resource-center/compliance-checklists/${id}`, {
        method: "DELETE",
      }),
  },
};
