import { useEffect, useState, useCallback, useRef } from "react";
import { API_URL } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const EV_BASE = `${API_URL}/employee-verification`;

const TABS = [
  { key: "overview", label: "📊 Overview" },
  { key: "employees", label: "👥 Employees" },
  { key: "documents", label: "📄 Documents" },
  { key: "background", label: "🕵️ Background Verification" },
  { key: "audit", label: "📜 Audit Logs" },
];

const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

const statusBadgeClass = (status) => {
  if (status === "Verified") return "ev-badge ev-badge-verified";
  if (status === "Rejected") return "ev-badge ev-badge-rejected";
  return "ev-badge ev-badge-pending";
};

const emptyEmployeeForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
};

const emptyBgForm = {
  employee_id: "",
  previous_company: "",
  hr_email: "",
  feedback: "",
  rehire_eligible: "",
  criminal_record: "",
};

const AdminEmployeeVerification = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Overview
  const [stats, setStats] = useState({
    total_employees: 0,
    total_documents: 0,
    verified_documents: 0,
    pending_documents: 0,
    rejected_documents: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Employees
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [empForm, setEmpForm] = useState(emptyEmployeeForm);
  const [editEmpId, setEditEmpId] = useState(null);
  const [empSearch, setEmpSearch] = useState("");

  // Documents
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [docForm, setDocForm] = useState({
    employee_id: "",
    document_name: "",
  });
  const [docFile, setDocFile] = useState(null);
  const fileInputRef = useRef(null);
  const [emailInputs, setEmailInputs] = useState({});
  const [uploading, setUploading] = useState(false);

  // Background verification
  const [bgRecords, setBgRecords] = useState([]);
  const [bgLoading, setBgLoading] = useState(true);
  const [bgForm, setBgForm] = useState(emptyBgForm);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const notify = (message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch(`${EV_BASE}/dashboard`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("EV dashboard error", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      setEmployeesLoading(true);
      const res = await fetch(`${EV_BASE}/employees`);
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("EV employees error", e);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      const res = await fetch(`${EV_BASE}/documents`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("EV documents error", e);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const loadBackground = useCallback(async () => {
    try {
      setBgLoading(true);
      const res = await fetch(`${EV_BASE}/background-verification`);
      const data = await res.json();
      setBgRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("EV background error", e);
    } finally {
      setBgLoading(false);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    try {
      setAuditLoading(true);
      const res = await fetch(`${EV_BASE}/audit-logs`);
      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("EV audit logs error", e);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadAudit();
  }, [loadStats, loadAudit]);

  useEffect(() => {
    if (activeTab === "employees") loadEmployees();
    if (activeTab === "documents") {
      loadDocuments();
      if (employees.length === 0) loadEmployees();
    }
    if (activeTab === "background") {
      loadBackground();
      if (employees.length === 0) loadEmployees();
    }
    if (activeTab === "audit") loadAudit();
  }, [activeTab, loadEmployees, loadDocuments, loadBackground, loadAudit]);

  // ---- Employees ----
  const submitEmployee = async () => {
    const { name, email, phone, department, designation } = empForm;
    if (!name || !email || !phone || !department || !designation) {
      notify("Please fill all employee fields", "error");
      return;
    }
    try {
      const url = editEmpId
        ? `${EV_BASE}/employees/${editEmpId}`
        : `${EV_BASE}/add-employee`;
      const method = editEmpId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed");
      notify(
        editEmpId
          ? "Employee updated successfully"
          : "Employee added successfully",
      );
      setEmpForm(emptyEmployeeForm);
      setEditEmpId(null);
      loadEmployees();
      loadStats();
    } catch (e) {
      notify(e.message || "Save failed", "error");
    }
  };

  const startEditEmployee = (emp) => {
    setEditEmpId(emp.id);
    setEmpForm({
      name: emp.name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      department: emp.department || "",
      designation: emp.designation || "",
    });
  };

  const cancelEditEmployee = () => {
    setEditEmpId(null);
    setEmpForm(emptyEmployeeForm);
  };

  const deleteEmployee = async (id) => {
    if (
      !window.confirm(
        "Delete this employee? Their documents will also be removed.",
      )
    )
      return;
    try {
      await fetch(`${EV_BASE}/employees/${id}`, { method: "DELETE" });
      notify("Employee deleted");
      loadEmployees();
      loadStats();
    } catch (e) {
      notify("Delete failed", "error");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = empSearch.toLowerCase();
    if (!q) return true;
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    );
  });

  // ---- Documents ----
  const uploadDocument = async () => {
    const { employee_id, document_name } = docForm;
    if (!employee_id || !document_name || !docFile) {
      notify("Please fill all document fields and choose a file", "error");
      return;
    }
    const formData = new FormData();
    formData.append("employee_id", employee_id);
    formData.append("document_name", document_name);
    formData.append("file", docFile);

    try {
      setUploading(true);
      const res = await fetch(`${EV_BASE}/upload-document`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || data.error || "Upload failed");
      notify("Document uploaded successfully");
      setDocForm({ employee_id: "", document_name: "" });
      setDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadDocuments();
      loadStats();
    } catch (e) {
      notify(e.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const verifyDocument = async (id, status) => {
    try {
      const res = await fetch(
        `${EV_BASE}/verify-document/${id}?status=${status}`,
      );
      const data = await res.json();
      notify(data.message || `Document ${status}`);
      loadDocuments();
      loadStats();
      loadAudit();
    } catch (e) {
      notify("Action failed", "error");
    }
  };

  const sendVerificationEmail = async (id) => {
    const email = emailInputs[id];
    if (!email) {
      notify("Enter the recipient's email first", "error");
      return;
    }
    try {
      const res = await fetch(
        `${EV_BASE}/send-verification-email/${id}?email=${encodeURIComponent(email)}`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email failed");
      notify("Verification email sent");
    } catch (e) {
      notify(
        e.message || "Email failed — check SMTP settings in backend/.env",
        "error",
      );
    }
  };

  const employeeName = (id) =>
    employees.find((e) => String(e.id) === String(id))?.name;

  // ---- Background verification ----
  const submitBackground = async () => {
    const {
      employee_id,
      previous_company,
      hr_email,
      feedback,
      rehire_eligible,
      criminal_record,
    } = bgForm;
    if (
      !employee_id ||
      !previous_company ||
      !hr_email ||
      !feedback ||
      !rehire_eligible ||
      !criminal_record
    ) {
      notify("Please fill all background verification fields", "error");
      return;
    }
    try {
      const res = await fetch(`${EV_BASE}/background-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bgForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Save failed");
      notify("Background verification saved");
      setBgForm(emptyBgForm);
      loadBackground();
    } catch (e) {
      notify(e.message || "Save failed", "error");
    }
  };

  return (
    <div className="light-ev-container">
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
      <div className="ev-marquee-banner">
        <div className="ev-marquee-track">
          <span>✨ Recruweb Enterprise Employee Verification &amp; HR Module</span>
          <span>•</span>
          <span>👥 Add Employees, Upload &amp; Verify Documents &amp; Background Checks</span>
          <span>•</span>
          <span>⭐ Real-time Audit Trail &amp; Compliance Monitoring</span>
        </div>
      </div>

      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Employee Verification{" "}
              <span className="gradient-text">— HR Module</span>
            </h1>
            <p className="cand-subtitle">
              Add employees, upload &amp; verify documents, run background checks, and track everything in the audit trail seamlessly.
            </p>
          </div>
          <span className="ev-live-badge">● Live Module</span>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <div className="cand-tabs-bar" style={{ position: 'relative', zIndex: 2 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`cand-tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {toast && (
        <div className={`cand-msg-banner`} style={{ marginBottom: "24px", position: 'relative', zIndex: 2, background: toast.tone === 'success' ? '#ecfdf5' : '#fef2f2', color: toast.tone === 'success' ? '#059669' : '#dc2626', borderColor: toast.tone === 'success' ? '#a7f3d0' : '#fecaca' }}>
          {toast.tone === 'success' ? '✨ ' : '⚠️ '} {toast.message}
        </div>
      )}

      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* ================= OVERVIEW ================= */}
          {activeTab === "overview" && (
            <>
              {statsLoading ? (
                <div className="cand-loading-state">
                  <span className="cand-loader"></span> Loading dashboard…
                </div>
              ) : (
                <div className="client-stats-grid">
                  <div className="cand-stat-card-3d">
                    <div className="card-bg-light-glow"></div>
                    <div className="stat-val" style={{ color: "#0284c7" }}>{stats.total_employees}</div>
                    <div className="stat-lbl">Employees</div>
                    <div className="card-glow-bar" style={{ background: "#0284c7" }}></div>
                  </div>
                  <div className="cand-stat-card-3d">
                    <div className="card-bg-light-glow"></div>
                    <div className="stat-val" style={{ color: "#6366f1" }}>{stats.total_documents}</div>
                    <div className="stat-lbl">Documents</div>
                    <div className="card-glow-bar" style={{ background: "#6366f1" }}></div>
                  </div>
                  <div className="cand-stat-card-3d">
                    <div className="card-bg-light-glow"></div>
                    <div className="stat-val" style={{ color: "#059669" }}>
                      {stats.verified_documents}
                    </div>
                    <div className="stat-lbl">Verified</div>
                    <div className="card-glow-bar" style={{ background: "#059669" }}></div>
                  </div>
                  <div className="cand-stat-card-3d">
                    <div className="card-bg-light-glow"></div>
                    <div className="stat-val" style={{ color: "#d97706" }}>{stats.pending_documents}</div>
                    <div className="stat-lbl">Pending</div>
                    <div className="card-glow-bar" style={{ background: "#d97706" }}></div>
                  </div>
                  <div className="cand-stat-card-3d">
                    <div className="card-bg-light-glow"></div>
                    <div className="stat-val" style={{ color: "#dc2626" }}>
                      {stats.rejected_documents}
                    </div>
                    <div className="stat-lbl">Rejected</div>
                    <div className="card-glow-bar" style={{ background: "#dc2626" }}></div>
                  </div>
                </div>
              )}

              <h3 className="ev-section-title">Recent Activity</h3>
              {auditLoading ? (
                <div className="cand-loading-state">
                  <span className="cand-loader"></span> Loading activity…
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="cand-empty-state">
                  No activity yet — verify or reject a document to see it here.
                </div>
              ) : (
                <ul className="ev-activity-list">
                  {auditLogs.slice(0, 6).map((log) => (
                    <li key={log.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "12px 16px", borderRadius: "14px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <span className={statusBadgeClass(log.action)}>
                        {log.action}
                      </span>
                      <span className="ev-activity-text" style={{ color: "#334155", fontWeight: "700" }}>
                        Document #{log.document_id}
                      </span>
                      <span className="ev-activity-time" style={{ marginLeft: "auto", color: "#64748b", fontWeight: "600", fontSize: "12px" }}>
                        {fmt(log.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* ================= EMPLOYEES ================= */}
          {activeTab === "employees" && (
            <>
              <div className="drawer-card-section" style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>
                  {editEmpId ? "✏️ Edit Employee Details" : "➕ Add New Employee"}
                </h4>
                <div className="ev-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", alignItems: "center" }}>
                  <input
                    placeholder="Full name *"
                    value={empForm.name}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, name: e.target.value })
                    }
                    className="cand-input"
                  />
                  <input
                    type="email"
                    placeholder="Email address *"
                    value={empForm.email}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, email: e.target.value })
                    }
                    className="cand-input"
                  />
                  <input
                    placeholder="Phone number *"
                    value={empForm.phone}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, phone: e.target.value })
                    }
                    className="cand-input"
                  />
                  <input
                    placeholder="Department *"
                    value={empForm.department}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, department: e.target.value })
                    }
                    className="cand-input"
                  />
                  <input
                    placeholder="Designation *"
                    value={empForm.designation}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, designation: e.target.value })
                    }
                    className="cand-input"
                  />
                  <div className="ev-form-actions" style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="cv-action-btn primary glow-btn"
                      onClick={submitEmployee}
                    >
                      {editEmpId ? "Update Employee ✨" : "Save Employee ✨"}
                    </button>
                    {editEmpId && (
                      <button
                        className="cv-action-btn secondary"
                        onClick={cancelEditEmployee}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="ev-toolbar" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <input
                  className="cand-input"
                  style={{ flex: 1, minWidth: "220px" }}
                  placeholder="🔍 Search employees by name, email, department…"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                />
                <span className="employee-pill">
                  {filteredEmployees.length} total
                </span>
              </div>

              {employeesLoading ? (
                <div className="cand-loading-state">
                  <span className="cand-loader"></span> Loading employees…
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="cand-empty-state">No employees found.</div>
              ) : (
                <div className="cand-table-wrap">
                  <table className="cand-light-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="table-row-hover">
                          <td>#{emp.id}</td>
                          <td>
                            <strong style={{ color: "#0f172a", fontWeight: "900" }}>{emp.name}</strong>
                          </td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{emp.email}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{emp.phone}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{emp.department}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{emp.designation}</td>
                          <td className="ev-actions-cell" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              onClick={() => startEditEmployee(emp)}
                            >
                              Edit
                            </button>
                            <button
                              className="cv-action-btn"
                              style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => deleteEmployee(emp.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ================= DOCUMENTS ================= */}
          {activeTab === "documents" && (
            <>
              <div className="drawer-card-section" style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>
                  📤 Upload Document Verification
                </h4>
                <div className="ev-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "stretch" }}>
                  <select
                    className="cand-input"
                    value={docForm.employee_id}
                    onChange={(e) =>
                      setDocForm({ ...docForm, employee_id: e.target.value })
                    }
                  >
                    <option value="">— Select Employee —</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} (#{emp.id})
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Document name (e.g. Aadhaar Card)"
                    value={docForm.document_name}
                    onChange={(e) =>
                      setDocForm({ ...docForm, document_name: e.target.value })
                    }
                    className="cand-input"
                  />

                  {/* Attractive Custom Styled File Input Picker */}
                  <div className="ev-file-upload-wrapper">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="ev-hidden-file-input"
                      onChange={(e) => setDocFile(e.target.files[0])}
                    />
                    <button
                      type="button"
                      className="ev-file-trigger-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📂 {docFile ? "Change File" : "Choose File ✨"}
                    </button>
                    <span className="ev-file-name-display">
                      {docFile ? docFile.name : "No file chosen"}
                    </span>
                  </div>

                  <div className="ev-form-actions" style={{ display: "flex", alignItems: "center" }}>
                    <button
                      className="cv-action-btn primary glow-btn"
                      onClick={uploadDocument}
                      disabled={uploading}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      {uploading ? "Uploading…" : "Upload Document ✨"}
                    </button>
                  </div>
                </div>
              </div>

              {documentsLoading ? (
                <div className="cand-loading-state">
                  <span className="cand-loader"></span> Loading documents…
                </div>
              ) : documents.length === 0 ? (
                <div className="cand-empty-state">No documents uploaded yet.</div>
              ) : (
                <div className="cand-table-wrap">
                  <table className="cand-light-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Document</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} className="table-row-hover">
                          <td>#{doc.id}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>
                            {employeeName(doc.employee_id) ||
                              `#${doc.employee_id}`}
                          </td>
                          <td>
                            <a
                              href={`${EV_BASE.replace("/api/employee-verification", "")}/${doc.file_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-preview-link"
                            >
                              📄 {doc.document_name} ↗
                            </a>
                          </td>
                          <td>
                            <span className={statusBadgeClass(doc.status)}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="ev-actions-cell ev-doc-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                            <button
                              className="cv-action-btn"
                              style={{ background: "#ecfdf5", border: "1.5px solid #a7f3d0", color: "#059669", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => verifyDocument(doc.id, "Verified")}
                            >
                              Verify
                            </button>
                            <button
                              className="cv-action-btn"
                              style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => verifyDocument(doc.id, "Rejected")}
                            >
                              Reject
                            </button>
                            <input
                              type="email"
                              className="cand-input"
                              style={{ width: "160px", padding: "6px 10px", fontSize: "12px" }}
                              placeholder="Recipient email"
                              value={emailInputs[doc.id] || ""}
                              onChange={(e) =>
                                setEmailInputs({
                                  ...emailInputs,
                                  [doc.id]: e.target.value,
                                })
                              }
                            />
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              onClick={() => sendVerificationEmail(doc.id)}
                            >
                              Email
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ================= BACKGROUND VERIFICATION ================= */}
          {activeTab === "background" && (
            <>
              <div className="drawer-card-section" style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>
                  🕵️ New Background Check Entry
                </h4>
                <div className="ev-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", alignItems: "center" }}>
                  <select
                    className="cand-input"
                    value={bgForm.employee_id}
                    onChange={(e) =>
                      setBgForm({ ...bgForm, employee_id: e.target.value })
                    }
                  >
                    <option value="">— Select Employee —</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} (#{emp.id})
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Previous company"
                    value={bgForm.previous_company}
                    onChange={(e) =>
                      setBgForm({ ...bgForm, previous_company: e.target.value })
                    }
                    className="cand-input"
                  />
                  <input
                    type="email"
                    placeholder="Previous HR email"
                    value={bgForm.hr_email}
                    onChange={(e) =>
                      setBgForm({ ...bgForm, hr_email: e.target.value })
                    }
                    className="cand-input"
                  />
                  <input
                    placeholder="Feedback notes"
                    value={bgForm.feedback}
                    onChange={(e) =>
                      setBgForm({ ...bgForm, feedback: e.target.value })
                    }
                    className="cand-input"
                  />
                  <select
                    className="cand-input"
                    value={bgForm.rehire_eligible}
                    onChange={(e) =>
                      setBgForm({ ...bgForm, rehire_eligible: e.target.value })
                    }
                  >
                    <option value="">Rehire eligible?</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <select
                    className="cand-input"
                    value={bgForm.criminal_record}
                    onChange={(e) =>
                      setBgForm({ ...bgForm, criminal_record: e.target.value })
                    }
                  >
                    <option value="">Criminal record?</option>
                    <option value="None">None</option>
                    <option value="Found">Found</option>
                  </select>
                  <div className="ev-form-actions">
                    <button
                      className="cv-action-btn primary glow-btn"
                      onClick={submitBackground}
                    >
                      Save Verification ✨
                    </button>
                  </div>
                </div>
              </div>

              {bgLoading ? (
                <div className="cand-loading-state">
                  <span className="cand-loader"></span> Loading background checks…
                </div>
              ) : bgRecords.length === 0 ? (
                <div className="cand-empty-state">
                  No background verification records yet.
                </div>
              ) : (
                <div className="cand-table-wrap">
                  <table className="cand-light-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Previous Company</th>
                        <th>HR Email</th>
                        <th>Feedback</th>
                        <th>Rehire</th>
                        <th>Criminal Record</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bgRecords.map((rec) => (
                        <tr key={rec.id} className="table-row-hover">
                          <td>#{rec.id}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>
                            {employeeName(rec.employee_id) ||
                              `#${rec.employee_id}`}
                          </td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{rec.previous_company}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{rec.hr_email}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{rec.feedback}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{rec.rehire_eligible}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{rec.criminal_record}</td>
                          <td>
                            <span className={statusBadgeClass(rec.status)}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ================= AUDIT LOGS ================= */}
          {activeTab === "audit" && (
            <>
              {auditLoading ? (
                <div className="cand-loading-state">
                  <span className="cand-loader"></span> Loading audit logs…
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="cand-empty-state">No audit records found.</div>
              ) : (
                <div className="cand-table-wrap">
                  <table className="cand-light-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Document ID</th>
                        <th>Action</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="table-row-hover">
                          <td>#{log.id}</td>
                          <td>#{log.document_id}</td>
                          <td>
                            <span className={statusBadgeClass(log.action)}>
                              {log.action}
                            </span>
                          </td>
                          <td className="date-text">{fmt(log.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-ev-container {
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
        .ev-marquee-banner {
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

        .ev-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .ev-marquee-track span {
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

        .ev-live-badge {
          background: #ecfdf5;
          border: 1.5px solid #a7f3d0;
          color: #059669;
          font-size: 12px;
          font-weight: 900;
          padding: 6px 14px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .cand-tabs-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          background: #ffffff;
          padding: 6px;
          border-radius: 18px;
          border: 1.5px solid #cbd5e1;
          margin-bottom: 24px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
        }

        .cand-tab-btn {
          padding: 9px 18px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 13.5px;
          font-weight: 800;
          border-radius: 12px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .cand-tab-btn.active {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
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

        .client-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .cand-stat-card-3d {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 20px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.03);
          text-align: center;
        }

        .stat-val {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .stat-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ev-section-title {
          font-size: 16px;
          font-weight: 900;
          color: #0f172a;
          margin: 16px 0 12px;
        }

        .drawer-card-section {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          padding: 20px;
          border-radius: 18px;
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

        .cv-action-btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          box-shadow: 0 6px 18px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.4);
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

        /* Stunning Attractive Choose File Button Styling */
        .ev-file-upload-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          padding: 8px 12px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .ev-file-upload-wrapper:hover {
          border-color: #0284c7;
          box-shadow: 0 8px 25px rgba(2, 132, 199, 0.12);
          transform: translateY(-1px);
        }
        .ev-hidden-file-input { display: none; }
        .ev-file-trigger-btn {
          background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%);
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);
          transition: all 0.25s ease;
        }
        .ev-file-trigger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
          filter: brightness(1.05);
        }
        .ev-file-trigger-btn:active { transform: scale(0.97); }
        .ev-file-name-display {
          font-size: 13px;
          color: #475569;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .employee-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 12px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
          display: inline-block;
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

        .ev-badge {
          font-size: 11px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1.5px solid;
          white-space: nowrap;
          display: inline-block;
        }
        .ev-badge-verified { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .ev-badge-rejected { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .ev-badge-pending { background: #fef3c7; color: #d97706; border-color: #fde68a; }

        .btn-preview-link {
          display: inline-block;
          color: #0284c7;
          font-weight: 800;
          font-size: 13px;
          text-decoration: none;
        }
        .btn-preview-link:hover { text-decoration: underline; }

        .date-text { font-size: 12.5px; color: #64748b; font-weight: 700; }
        .cand-loading-state { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: #0284c7; font-weight: 900; }
        .cand-loader { width: 22px; height: 22px; border: 3px solid #0284c7; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cand-empty-state { text-align: center; padding: 50px 20px; color: #64748b; font-weight: 700; }
        .cand-msg-banner { padding: 12px 16px; border-radius: 12px; font-size: 13.5px; font-weight: 800; border: 1.5px solid; }
      `}</style>
    </div>
  );
};

export default AdminEmployeeVerification;