import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const ROLES = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "recruitment_manager", label: "Recruitment Manager" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "recruiter", label: "Recruiter" },
  { value: "hr", label: "HR" },
  { value: "finance_manager", label: "Finance Manager" },
  { value: "client", label: "Client" },
  { value: "candidate", label: "Candidate" },
];

const PERMISSIONS = [
  { value: "manage_users", label: "Manage Users" },
  { value: "manage_branches", label: "Manage Branches" },
  { value: "manage_settings", label: "Manage Settings" },
  { value: "view_audit_logs", label: "View Audit Logs" },
  { value: "manage_jobs", label: "Manage Jobs" },
  { value: "manage_candidates", label: "Manage Candidates" },
  { value: "manage_clients", label: "Manage Clients" },
  { value: "view_revenue", label: "View Revenue" },
  { value: "manage_tasks", label: "Manage Tasks" },
];

const roleLabel = (value) =>
  ROLES.find((r) => r.value === value)?.label || value;

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "recruiter",
  branchId: "",
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  const [managingUser, setManagingUser] = useState(null);
  const [managePermissions, setManagePermissions] = useState([]);
  const [manageRole, setManageRole] = useState("");
  const [manageBranchId, setManageBranchId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [manageMsg, setManageMsg] = useState("");

  const load = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    api.users.getAll(params).then((res) => {
      if (res.success) setUsers(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [roleFilter]);

  useEffect(() => {
    api.branches.getAll().then((res) => {
      if (res.success) setBranches(res.data);
    });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    const res = await api.users.create({
      ...form,
      branchId: form.branchId || null,
    });
    setCreating(false);
    if (res.success) {
      setUsers((prev) => [res.data, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } else {
      setFormError(res.message || "Failed to create user");
    }
  };

  const openManage = (user) => {
    setManagingUser(user);
    setManageRole(user.role);
    setManagePermissions(user.permissions || []);
    setManageBranchId(user.branchId || "");
    setNewPassword("");
    setManageMsg("");
  };

  const closeManage = () => setManagingUser(null);

  const togglePermission = (perm) => {
    setManagePermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const saveRoleAndPermissions = async () => {
    setManageMsg("");
    const res = await api.users.assignRole(
      managingUser.id,
      manageRole,
      managePermissions,
    );
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === managingUser.id ? res.data : u)),
      );
      setManagingUser(res.data);
      setManageMsg("Role & permissions updated successfully.");
    } else {
      setManageMsg(res.message || "Failed to update role.");
    }
  };

  const saveBranch = async () => {
    setManageMsg("");
    const res = await api.users.update(managingUser.id, {
      branchId: manageBranchId || null,
    });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === managingUser.id ? res.data : u)),
      );
      setManagingUser(res.data);
      setManageMsg("Branch updated successfully.");
    } else {
      setManageMsg(res.message || "Failed to update branch.");
    }
  };

  const toggleStatus = async (user) => {
    const res = await api.users.setStatus(user.id, !user.isActive);
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
      if (managingUser?.id === user.id) setManagingUser(res.data);
    } else {
      alert(res.message || "Failed to update status");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setManageMsg("Password must be at least 8 characters.");
      return;
    }
    const res = await api.users.resetPassword(managingUser.id, newPassword);
    setManageMsg(
      res.success
        ? "Password reset successfully."
        : res.message || "Failed to reset password.",
    );
    if (res.success) setNewPassword("");
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    const res = await api.users.delete(user.id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (managingUser?.id === user.id) closeManage();
    } else {
      alert(res.message || "Failed to delete user");
    }
  };

  return (
    <div className="light-usr-container">
      {/* Live Floating Particles Background */}
      <div className="cand-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="cand-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Marquee Banner */}
      <div className="usr-marquee-banner">
        <div className="usr-marquee-track">
          <span>✨ Recruweb Enterprise User Management &amp; Administration</span>
          <span>•</span>
          <span>👥 Create Staff Accounts, Assign Roles &amp; Permissions, and Manage Branch Assignments</span>
          <span>•</span>
          <span>⭐ Secure Access Control &amp; Team Operations</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              User Management{" "}
              <span className="gradient-text">— Administration</span>
            </h1>
            <p className="cand-subtitle">
              Create staff accounts, assign roles &amp; permissions, and manage branch assignments securely.
            </p>
          </div>
          <button
            className="cv-action-btn primary glow-btn"
            onClick={() => setShowForm((s) => !s)}
          >
            <span>{showForm ? "Cancel Form" : "+ Create User ✨"}</span>
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Create User Glass Card */}
      {showForm && (
        <div className="cand-card-3d animate-modal" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 className="form-heading" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "18px" }}>✨ Create New Staff Account</h3>
            <form onSubmit={handleCreate} className="usr-form-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Full Name *</label>
                  <input
                    name="name"
                    className="cand-input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="input-group-3d">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="cand-input"
                    placeholder="john@recruweb.com"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="input-group-3d">
                  <label>Temporary Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="cand-input"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={handleFormChange}
                    minLength={8}
                    required
                  />
                </div>
                <div className="input-group-3d">
                  <label>Role *</label>
                  <select
                    name="role"
                    className="cand-input"
                    value={form.role}
                    onChange={handleFormChange}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Branch Assignment</label>
                  <select
                    name="branchId"
                    className="cand-input"
                    value={form.branchId}
                    onChange={handleFormChange}
                  >
                    <option value="">Unassigned</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-hint-text" style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "700" }}>
                ℹ️ Default permissions are applied automatically based on role and can be fine-tuned via &quot;Manage&quot;.
              </div>

              {formError && (
                <div className="cand-msg-banner" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>⚠️ {formError}</div>
              )}

              <button
                type="submit"
                className="cv-action-btn primary glow-btn"
                disabled={creating}
                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
              >
                {creating ? "Creating Account..." : "Create User ✨"}
              </button>
            </form>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Manage User Panel */}
      {managingUser && (
        <div className="cand-card-3d manage-panel-card animate-modal" style={{ marginBottom: "28px", border: "1.5px solid #0284c7" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="manage-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "12px" }}>
              <h3 className="form-heading" style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
                🛠️ Manage User:{" "}
                <span style={{ color: "#0284c7" }}>{managingUser.name}</span> (
                {managingUser.email})
              </h3>
              <button className="cv-action-btn secondary" onClick={closeManage} style={{ padding: "6px 14px", fontSize: "12px" }}>
                Close Panel ✕
              </button>
            </div>

            <div className="manage-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <div className="input-group-3d" style={{ marginBottom: "16px" }}>
                  <label>Assign Primary Role</label>
                  <select
                    className="cand-input"
                    value={manageRole}
                    onChange={(e) => setManageRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="perm-section-label" style={{ display: "block", fontSize: "12.5px", fontWeight: "800", color: "#334155", textTransform: "uppercase", marginBottom: "8px" }}>Permissions Matrix</label>
                <div className="usr-permission-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "220px", overflowY: "auto", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "12px", borderRadius: "14px" }}>
                  {PERMISSIONS.map((perm) => (
                    <label className="usr-permission-chip" key={perm.value} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#334155", fontWeight: "700", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={managePermissions.includes(perm.value)}
                        onChange={() => togglePermission(perm.value)}
                        style={{ accentColor: "#0284c7" }}
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  className="cv-action-btn primary glow-btn"
                  style={{ marginTop: "16px", background: "#059669" }}
                  onClick={saveRoleAndPermissions}
                >
                  Save Role &amp; Permissions ✨
                </button>
              </div>

              <div className="manage-right-col" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="input-group-3d">
                  <label>Branch Assignment</label>
                  <select
                    className="cand-input"
                    value={manageBranchId}
                    onChange={(e) => setManageBranchId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="cv-action-btn secondary" onClick={saveBranch}>
                  Update Branch
                </button>

                <div className="input-group-3d" style={{ marginTop: "20px" }}>
                  <label>Account Status</label>
                  <div className="toggle-row-flex" style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={managingUser.isActive}
                        onChange={() => toggleStatus(managingUser)}
                      />
                      <span className="admin-toggle-slider" />
                    </label>
                    <span
                      style={{
                        fontWeight: "800",
                        color: managingUser.isActive ? "#059669" : "#dc2626",
                      }}
                    >
                      {managingUser.isActive
                        ? "Active Account"
                        : "Deactivated Account"}
                    </span>
                  </div>
                </div>

                <div className="input-group-3d" style={{ marginTop: "20px" }}>
                  <label>Reset Password</label>
                  <input
                    type="password"
                    className="cand-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New temporary password (min 8 chars)"
                    minLength={8}
                  />
                </div>
                <button
                  className="cv-action-btn secondary"
                  onClick={handleResetPassword}
                >
                  Reset Password
                </button>

                <div
                  style={{
                    marginTop: "24px",
                    borderTop: "1.5px solid #e2e8f0",
                    paddingTop: "16px",
                  }}
                >
                  <button
                    className="cv-action-btn"
                    style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "10px 18px", borderRadius: "12px", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}
                    onClick={() => handleDelete(managingUser)}
                  >
                    🗑️ Delete User Permanently
                  </button>
                </div>
              </div>
            </div>

            {manageMsg && <div className="cand-msg-banner" style={{ marginTop: "16px", background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>ℹ️ {manageMsg}</div>}
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <form onSubmit={handleSearchSubmit} className="search-filter-row" style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              className="cand-input search-input"
              style={{ flex: 1, minWidth: "220px" }}
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="cand-input filter-select"
              style={{ width: "180px" }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button type="submit" className="cv-action-btn secondary">
              Search
            </button>
          </form>

          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading users directory...
            </div>
          ) : users.length === 0 ? (
            <div className="cand-empty-state">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Assigned Role</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>{u.name}</strong>
                      </td>
                      <td>
                        <span className="email-text" style={{ color: "#64748b", fontWeight: "700" }}>{u.email}</span>
                      </td>
                      <td>
                        <span className="role-badge-pill" style={{ background: "#e0f2fe", color: "#0284c7", fontSize: "11.5px", fontWeight: "900", padding: "4px 12px", borderRadius: "20px", border: "1.5px solid #bae6fd", textTransform: "capitalize", display: "inline-block" }}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td>
                        <span className="branch-tag" style={{ color: "#0f172a", fontWeight: "800" }}>
                          {u.branch?.name || "—"}
                        </span>
                      </td>
                      <td>
                        <label className="admin-toggle">
                          <input
                            type="checkbox"
                            checked={u.isActive}
                            onChange={() => toggleStatus(u)}
                          />
                          <span className="admin-toggle-slider" />
                        </label>
                      </td>
                      <td className="date-text">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleString("en-IN")
                          : "—"}
                      </td>
                      <td>
                        <div className="action-btns-flex" style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => openManage(u)}
                          >
                            Manage
                          </button>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                            onClick={() => handleDelete(u)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-usr-container {
          position: relative;
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 3vw 80px;
          color: #0f172a;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        /* Live Floating Particles Background */
        .cand-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .cand-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          border-radius: 50%;
          opacity: 0.4;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 8px rgba(2, 132, 199, 0.4);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        /* Marquee Ribbon */
        .usr-marquee-banner {
          background: linear-gradient(90deg, #0284c7, #6366f1);
          color: #ffffff;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.2);
          margin-bottom: 24px;
        }

        .usr-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .usr-marquee-track span {
          margin: 0 20px;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .cand-header-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px 32px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-header-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #0284c7, #6366f1);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .cand-header-3d:hover .card-glow-bar,
        .cand-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        .cand-title {
          font-size: 30px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .cv-action-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
        }

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .cand-card-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        .input-group-3d {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group-3d label {
          font-size: 12.5px;
          font-weight: 800;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cand-input {
          width: 100%;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
        }

        .cand-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
        }

        .cand-table-wrap {
          overflow-x: auto;
        }

        .cand-light-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .cand-light-table th {
          padding: 14px 16px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1.5px solid #cbd5e1;
          letter-spacing: 0.5px;
          background: #f8fafc;
        }

        .cand-light-table td {
          padding: 16px;
          font-size: 13.5px;
          color: #334155;
          font-weight: 700;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }

        .table-row-hover:hover {
          background: #f8fafc;
        }

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #0284c7;
          font-weight: 900;
        }

        .cand-loader {
          width: 22px;
          height: 22px;
          border: 3px solid #0284c7;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .cand-empty-state {
          text-align: center;
          padding: 60px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        .cand-msg-banner {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 800;
          border: 1.5px solid;
        }

        @media (max-width: 1024px) {
          .manage-grid-2 {
            grid-template-columns: 1fr;
          }
          .form-grid-3 {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .form-grid-2, .form-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;