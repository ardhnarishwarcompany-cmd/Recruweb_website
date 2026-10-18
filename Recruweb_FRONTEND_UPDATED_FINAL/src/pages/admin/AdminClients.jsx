import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const emptyClientForm = {
  name: "",
  companyId: "",
  industry: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  status: "prospect",
  source: "other",
  accountManagerId: "",
  billingCurrency: "INR",
  creditTerms: "",
};

const emptyContactForm = {
  name: "",
  designation: "",
  email: "",
  phone: "",
  isPrimary: false,
};

const emptyRequirementForm = {
  title: "",
  description: "",
  positions: 1,
  priority: "medium",
  status: "open",
  targetDate: "",
};

const emptyContractForm = {
  title: "",
  type: "contingency",
  value: "",
  currency: "INR",
  startDate: "",
  endDate: "",
  status: "draft",
};

const TABS = ["Overview", "Contacts", "Requirements", "Contracts", "Notes"];

const statusMeta = (status) => {
  switch (status) {
    case "active":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
        label: "Active",
      };
    case "prospect":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
        label: "Prospect",
      };
    case "on-hold":
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
        label: "On Hold",
      };
    case "inactive":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
        label: "Inactive",
      };
    default:
      return {
        bg: "#f1f5f9",
        text: "#64748b",
        border: "#cbd5e1",
        label: status,
      };
  }
};

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companies, setCompanies] = useState([]);
  const [team, setTeam] = useState([]);

  // Create / edit client modal
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyClientForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Detail drawer
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // Inline add-forms inside the drawer
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState(emptyContactForm);
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [requirementForm, setRequirementForm] = useState(emptyRequirementForm);
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractForm, setContractForm] = useState(emptyContractForm);
  const [noteText, setNoteText] = useState("");
  const [notePinned, setNotePinned] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.crmClients.getAll(params);
      if (res?.success) setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const res = await api.crmClients.getStats();
    if (res?.success) setStats(res.data);
  };

  const loadLookups = async () => {
    try {
      const [companiesRes, teamRes] = await Promise.all([
        api.crmCompanies.getAll(),
        api.team.getAssignableUsers(),
      ]);
      if (companiesRes?.success) setCompanies(companiesRes.data);
      if (teamRes?.success) setTeam(teamRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAllData = () => {
    loadClients();
    loadStats();
    loadLookups();
  };

  // Analytics are derived from the live CRM client list so the charts remain
  // useful even when the backend only exposes the existing stats endpoint.
  const analytics = useMemo(() => {
    const statusCounts = {
      active: 0,
      prospect: 0,
      "on-hold": 0,
      inactive: 0,
    };
    const industryCounts = {};
    const monthlyCounts = {};

    clients.forEach((client) => {
      const status = client.status || "inactive";
      if (statusCounts[status] !== undefined) statusCounts[status] += 1;

      const industry = client.industry?.trim() || "Other";
      industryCounts[industry] = (industryCounts[industry] || 0) + 1;

      const dateValue = client.createdAt || client.created_at;
      if (dateValue) {
        const date = new Date(dateValue);
        if (!Number.isNaN(date.getTime())) {
          const key = date.toLocaleString("en-US", { month: "short" });
          monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
        }
      }
    });

    const statusData = [
      { name: "Active", value: statusCounts.active },
      { name: "Prospects", value: statusCounts.prospect },
      { name: "On Hold", value: statusCounts["on-hold"] },
      { name: "Inactive", value: statusCounts.inactive },
    ].filter((item) => item.value > 0);

    const industryData = Object.entries(industryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    const monthNames = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthNames.push(d.toLocaleString("en-US", { month: "short" }));
    }
    const clientTrend = monthNames.map((month) => ({
      month,
      clients: monthlyCounts[month] || 0,
    }));

    return { statusData, industryData, clientTrend };
  }, [clients]);

  useEffect(() => {
    loadStats();
    loadLookups();
  }, []);

  useEffect(() => {
    const t = setTimeout(loadClients, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const handleExportCSV = () => {
    if (!clients.length) return;
    const headers = [
      "Client Code,Name,Industry,Email,Phone,City,Status,Source",
    ];
    const rows = clients.map((c) =>
      [
        c.clientCode || "",
        `"${c.name || ""}"`,
        `"${c.industry || ""}"`,
        c.email || "",
        c.phone || "",
        `"${c.city || ""}"`,
        c.status || "",
        c.source || "",
      ].join(","),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "crm_clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyClientForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (client, e) => {
    e?.stopPropagation();
    setEditingId(client.id);
    setForm({
      ...emptyClientForm,
      ...client,
      companyId: client.companyId || "",
      accountManagerId: client.accountManagerId || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        companyId: form.companyId || null,
        accountManagerId: form.accountManagerId || null,
      };
      const res = editingId
        ? await api.crmClients.update(editingId, payload)
        : await api.crmClients.create(payload);
      if (res?.success) {
        setShowForm(false);
        loadClients();
        loadStats();
        if (selected && editingId === selected.id) openClient(selected.id);
      } else {
        setError(res?.message || "Failed to save client");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (id, e) => {
    e?.stopPropagation();
    if (
      !window.confirm(
        "Delete this client? All related contacts, requirements, contracts and notes will be removed.",
      )
    )
      return;
    const res = await api.crmClients.delete(id);
    if (res?.success) {
      loadClients();
      loadStats();
      if (selected?.id === id) setSelected(null);
    }
  };

  const openClient = async (id) => {
    setActiveTab("Overview");
    setDetailLoading(true);
    setSelected({ id });
    try {
      const res = await api.crmClients.getById(id);
      if (res?.success) setSelected(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelected = () => {
    if (selected?.id) openClient(selected.id);
  };

  // Contacts
  const handleAddContact = async (e) => {
    e.preventDefault();
    const res = await api.crmContacts.create({
      ...contactForm,
      clientId: selected.id,
    });
    if (res?.success) {
      setContactForm(emptyContactForm);
      setShowContactForm(false);
      refreshSelected();
    }
  };
  const handleDeleteContact = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    const res = await api.crmContacts.delete(id);
    if (res?.success) refreshSelected();
  };

  // Requirements
  const handleAddRequirement = async (e) => {
    e.preventDefault();
    const res = await api.crmRequirements.create({
      ...requirementForm,
      clientId: selected.id,
    });
    if (res?.success) {
      setRequirementForm(emptyRequirementForm);
      setShowRequirementForm(false);
      refreshSelected();
      loadStats();
    }
  };
  const handleRequirementStatus = async (id, status) => {
    const res = await api.crmRequirements.update(id, { status });
    if (res?.success) {
      refreshSelected();
      loadStats();
    }
  };
  const handleDeleteRequirement = async (id) => {
    if (!window.confirm("Delete this requirement?")) return;
    const res = await api.crmRequirements.delete(id);
    if (res?.success) {
      refreshSelected();
      loadStats();
    }
  };

  // Contracts
  const handleAddContract = async (e) => {
    e.preventDefault();
    const res = await api.crmContracts.create({
      ...contractForm,
      value: contractForm.value || null,
      clientId: selected.id,
    });
    if (res?.success) {
      setContractForm(emptyContractForm);
      setShowContractForm(false);
      refreshSelected();
      loadStats();
    }
  };
  const handleContractStatus = async (id, status) => {
    const res = await api.crmContracts.update(id, { status });
    if (res?.success) {
      refreshSelected();
      loadStats();
    }
  };
  const handleUploadDocument = async (id, file) => {
    if (!file) return;
    const res = await api.crmContracts.uploadDocument(id, file);
    if (res?.success) refreshSelected();
  };
  const handleDeleteContract = async (id) => {
    if (!window.confirm("Delete this contract?")) return;
    const res = await api.crmContracts.delete(id);
    if (res?.success) {
      refreshSelected();
      loadStats();
    }
  };

  // Notes
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const res = await api.crmNotes.create({
      entityType: "client",
      entityId: selected.id,
      content: noteText,
      pinned: notePinned,
    });
    if (res?.success) {
      setNoteText("");
      setNotePinned(false);
      refreshSelected();
    }
  };
  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    const res = await api.crmNotes.delete(id);
    if (res?.success) refreshSelected();
  };

  return (
    <div className="light-clients-container">
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
      <div className="client-marquee-banner">
        <div className="client-marquee-track">
          <span>✨ Recruweb Enterprise Clients CRM &amp; Accounts Portfolio</span>
          <span>•</span>
          <span>🤝 Manage Client Accounts, Primary Contacts &amp; Requirements</span>
          <span>•</span>
          <span>⭐ Service Contracts, Notes &amp; CSV Exports</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Clients CRM{" "}
              <span className="gradient-text">— Accounts &amp; Portfolios</span>
            </h1>
            <p className="cand-subtitle">
              Manage client accounts, primary contacts, staffing requirements, contracts &amp; notes
            </p>
          </div>
          <div className="header-actions">
            <button
              className="cv-action-btn secondary"
              onClick={refreshAllData}
              title="Refresh Data"
            >
              🔄 Refresh
            </button>
            <button
              className="cv-action-btn secondary"
              onClick={handleExportCSV}
              title="Export CSV"
            >
              📥 Export CSV
            </button>
            <button className="cv-action-btn primary glow-btn" onClick={openCreate}>
              <span>+ New Client Account ✨</span>
            </button>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Top Stat Cards Grid */}
      {stats && (
        <div className="client-stats-grid" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#0284c7" }}>{stats.total}</span>
            <span className="stat-lbl">Total Clients</span>
            <div className="card-glow-bar" style={{ background: "#0284c7" }}></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#059669" }}>{stats.active}</span>
            <span className="stat-lbl">Active Accounts</span>
            <div className="card-glow-bar" style={{ background: "#059669" }}></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#4f46e5" }}>{stats.prospect}</span>
            <span className="stat-lbl">Prospects</span>
            <div className="card-glow-bar" style={{ background: "#4f46e5" }}></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#d97706" }}>{stats.openRequirements}</span>
            <span className="stat-lbl">Open Requirements</span>
            <div className="card-glow-bar" style={{ background: "#d97706" }}></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#9333ea" }}>{stats.activeContracts}</span>
            <span className="stat-lbl">Active Contracts</span>
            <div className="card-glow-bar" style={{ background: "#9333ea" }}></div>
          </div>
        </div>
      )}

      {/* CRM Analytics */}
      <section className="crm-analytics-panel">
        <div className="crm-analytics-heading">
          <div>
            <span className="crm-analytics-kicker">LIVE CRM ANALYTICS</span>
            <h2>Client Portfolio Insights</h2>
            <p>Account health, client mix and recent acquisition activity.</p>
          </div>
          <div className="crm-analytics-summary">
            <strong>{clients.length}</strong>
            <span>visible accounts</span>
          </div>
        </div>

        <div className="crm-chart-grid">
          <div className="crm-chart-card">
            <div className="crm-chart-title">
              <div><strong>Account Status</strong><span>Portfolio distribution</span></div>
              <span className="crm-chart-badge">PIE</span>
            </div>
            {analytics.statusData.length ? (
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie
                    data={analytics.statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={["#059669", "#0284c7", "#d97706", "#dc2626"][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="crm-chart-empty">No client status data yet.</div>
            )}
          </div>

          <div className="crm-chart-card">
            <div className="crm-chart-title">
              <div><strong>Clients by Industry</strong><span>Top portfolio segments</span></div>
              <span className="crm-chart-badge">BAR</span>
            </div>
            {analytics.industryData.length ? (
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={analytics.industryData} margin={{ top: 10, right: 12, left: -12, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={55} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Clients" radius={[8, 8, 0, 0]} fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="crm-chart-empty">Industry analytics will appear here.</div>
            )}
          </div>

          <div className="crm-chart-card crm-chart-wide">
            <div className="crm-chart-title">
              <div><strong>Client Acquisition Trend</strong><span>New CRM accounts created over the last 6 months</span></div>
              <span className="crm-chart-badge">TREND</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.clientTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="clients" name="New Clients" radius={[8, 8, 0, 0]} fill="#0284c7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="crm-insight-row">
          <div className="crm-insight-card">
            <span>🤝</span>
            <div><strong>{stats?.active || 0} active accounts</strong><small>currently active clients</small></div>
          </div>
          <div className="crm-insight-card">
            <span>🎯</span>
            <div><strong>{stats?.prospect || 0} prospects</strong><small>potential accounts to convert</small></div>
          </div>
          <div className="crm-insight-card">
            <span>📌</span>
            <div><strong>{stats?.openRequirements || 0} open requirements</strong><small>staffing opportunities in pipeline</small></div>
          </div>
          <div className="crm-insight-card">
            <span>📄</span>
            <div><strong>{stats?.activeContracts || 0} active contracts</strong><small>live commercial relationships</small></div>
          </div>
        </div>
      </section>

      {/* Toolbar Filter Bar */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", minWidth: "280px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="client-search-input"
            placeholder="Search by client name, code, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-select-wrap" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "0 16px", borderRadius: "12px" }}>
          <span className="filter-icon">📌</span>
          <select
            className="client-select-dark"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Table Glass Panel */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Fetching CRM clients...
            </div>
          ) : clients.length === 0 ? (
            <div className="cand-empty-state">
              <div className="empty-icon">🤝</div>
              <h3>No client accounts found</h3>
              <p>
                Click &quot;New Client Account&quot; to begin or adjust your
                search filters.
              </p>
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Client Name &amp; Code</th>
                    <th>Industry</th>
                    <th>Account Manager</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => {
                    const meta = statusMeta(c.status);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => openClient(c.id)}
                        className="table-row-hover"
                      >
                        <td>
                          <div className="client-name-cell">
                            <strong>{c.name}</strong>
                            <span className="client-code-tag">
                              {c.clientCode}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{c.industry || "—"}</td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{c.accountManager?.name || "Unassigned"}</td>
                        <td>
                          <span
                            className="status-pill-badge"
                            style={{
                              background: meta.bg,
                              color: meta.text,
                              borderColor: meta.border,
                            }}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td>
                          <div
                            className="action-btns-group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              onClick={(e) => openEdit(c, e)}
                            >
                              Edit
                            </button>
                            <button
                              className="cv-action-btn"
                              style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                              onClick={(e) => handleDeleteClient(c.id, e)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* ---- Create / Edit Client Modal ---- */}
      {showForm && (
        <div className="modal-overlay-light" onClick={() => setShowForm(false)}>
          <div
            className="modal-card-light"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "650px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>
                  {editingId ? "✏️ Edit Client Account" : "✨ New Client Account"}
                </h2>
                <p className="drawer-subtext">Fill in the client account details below</p>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="drawer-scroll-body">
              {error && <div className="cand-msg-banner" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>❌ {error}</div>}

              <div className="input-group-3d">
                <label>Client Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Acme Corporation"
                  className="cand-input"
                />
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Linked Company</label>
                  <select
                    className="cand-input"
                    value={form.companyId}
                    onChange={(e) =>
                      setForm({ ...form, companyId: e.target.value })
                    }
                  >
                    <option value="">— None —</option>
                    {companies.map((co) => (
                      <option key={co.id} value={co.id}>
                        {co.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Industry</label>
                  <input
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                    placeholder="Information Technology"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="contact@acme.com"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+91 XXXXX XXXXX"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="input-group-3d">
                <label>Street Address</label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Business Park, Sector V"
                  className="cand-input"
                />
              </div>

              <div className="form-grid-3">
                <div className="input-group-3d">
                  <label>City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Gurugram"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>State</label>
                  <input
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    placeholder="Haryana"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Country</label>
                  <input
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    placeholder="India"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Account Status</label>
                  <select
                    className="cand-input"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Lead Source</label>
                  <select
                    className="cand-input"
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value })
                    }
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="cold-call">Cold Call</option>
                    <option value="social-media">Social Media</option>
                    <option value="event">Event</option>
                    <option value="lead-conversion">Lead Conversion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="input-group-3d">
                <label>Assigned Account Manager</label>
                <select
                  className="cand-input"
                  value={form.accountManagerId}
                  onChange={(e) =>
                    setForm({ ...form, accountManagerId: e.target.value })
                  }
                >
                  <option value="">— Unassigned —</option>
                  {team.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Billing Currency</label>
                  <input
                    value={form.billingCurrency}
                    onChange={(e) =>
                      setForm({ ...form, billingCurrency: e.target.value })
                    }
                    placeholder="INR"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Credit Terms</label>
                  <input
                    placeholder="e.g. Net 30"
                    value={form.creditTerms}
                    onChange={(e) =>
                      setForm({ ...form, creditTerms: e.target.value })
                    }
                    className="cand-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="cv-action-btn primary glow-btn"
                disabled={saving}
                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Client Account ✨"
                    : "Create Client Account ✨"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---- Client Detail Drawer (Multi-tab) ---- */}
      {selected && (
        <div
          className="client-drawer-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="client-glass-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header-3d">
              <div>
                <h2>{selected.name || "Loading..."}</h2>
                {selected.clientCode && (
                  <span className="client-code-tag">{selected.clientCode}</span>
                )}
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>

            {detailLoading ? (
              <div className="cand-loading-state">
                <span className="cand-loader"></span> Loading account details...
              </div>
            ) : (
              <>
                {/* Tabs Bar */}
                <div className="drawer-tabs-bar">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      className={`drawer-tab-btn${activeTab === tab ? " active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                      {tab === "Contacts" &&
                        ` (${selected.contacts?.length || 0})`}
                      {tab === "Requirements" &&
                        ` (${selected.requirements?.length || 0})`}
                      {tab === "Contracts" &&
                        ` (${selected.contracts?.length || 0})`}
                      {tab === "Notes" && ` (${selected.notes?.length || 0})`}
                    </button>
                  ))}
                </div>

                <div className="drawer-scroll-body">
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "Overview" && (
                    <div className="drawer-card-section">
                      <h4>📊 Account Overview</h4>
                      <div className="overview-details-grid">
                        <div>
                          <span className="det-label">Status:</span>
                          <span
                            className="status-pill-badge"
                            style={{
                              ...statusMeta(selected.status),
                              display: "inline-block",
                              marginTop: "4px",
                            }}
                          >
                            {statusMeta(selected.status).label}
                          </span>
                        </div>
                        <div>
                          <span className="det-label">Industry:</span>
                          <span className="det-val">
                            {selected.industry || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="det-label">Company Profile:</span>
                          <span className="det-val">
                            {selected.company?.name || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="det-label">Account Manager:</span>
                          <span className="det-val">
                            {selected.accountManager?.name || "Unassigned"}
                          </span>
                        </div>
                        <div>
                          <span className="det-label">Email:</span>
                          <span className="det-val">
                            {selected.email || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="det-label">Phone:</span>
                          <span className="det-val">
                            {selected.phone || "—"}
                          </span>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <span className="det-label">Registered Address:</span>
                          <span className="det-val">
                            {[
                              selected.address,
                              selected.city,
                              selected.state,
                              selected.country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="det-label">Lead Source:</span>
                          <span className="det-val">
                            {selected.source || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="det-label">Billing Terms:</span>
                          <span className="det-val">
                            {selected.billingCurrency}{" "}
                            {selected.creditTerms
                              ? `· ${selected.creditTerms}`
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: "20px" }}>
                        <button
                          className="cv-action-btn primary glow-btn"
                          onClick={(e) => openEdit(selected, e)}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          Edit Client Information ✨
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CONTACTS */}
                  {activeTab === "Contacts" && (
                    <div className="drawer-card-section">
                      <div className="section-header-action">
                        <h4>👥 Client Contacts</h4>
                        <button
                          className="cv-action-btn secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => setShowContactForm((s) => !s)}
                        >
                          {showContactForm ? "Cancel" : "+ Add Contact"}
                        </button>
                      </div>

                      {showContactForm && (
                        <form
                          onSubmit={handleAddContact}
                          className="inline-add-form"
                        >
                          <div className="input-group-3d">
                            <label>Contact Name *</label>
                            <input
                              required
                              value={contactForm.name}
                              onChange={(e) =>
                                setContactForm({
                                  ...contactForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Jane Doe"
                              className="cand-input"
                            />
                          </div>
                          <div className="form-grid-2">
                            <div className="input-group-3d">
                              <label>Designation</label>
                              <input
                                value={contactForm.designation}
                                onChange={(e) =>
                                  setContactForm({
                                    ...contactForm,
                                    designation: e.target.value,
                                  })
                                }
                                placeholder="HR Director"
                                className="cand-input"
                              />
                            </div>
                            <div className="input-group-3d">
                              <label>Email</label>
                              <input
                                type="email"
                                value={contactForm.email}
                                onChange={(e) =>
                                  setContactForm({
                                    ...contactForm,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="jane@acme.com"
                                className="cand-input"
                              />
                            </div>
                          </div>
                          <div className="input-group-3d">
                            <label>Phone</label>
                            <input
                              value={contactForm.phone}
                              onChange={(e) =>
                                setContactForm({
                                  ...contactForm,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="+91 XXXXX XXXXX"
                              className="cand-input"
                            />
                          </div>
                          <label className="checkbox-label-row">
                            <input
                              type="checkbox"
                              checked={contactForm.isPrimary}
                              onChange={(e) =>
                                setContactForm({
                                  ...contactForm,
                                  isPrimary: e.target.checked,
                                })
                              }
                            />
                            <span>Mark as Primary Point of Contact</span>
                          </label>
                          <button type="submit" className="cv-action-btn primary glow-btn" style={{ width: "100%", justifyContent: "center" }}>
                            Save Contact ✨
                          </button>
                        </form>
                      )}

                      <div className="items-list-container">
                        {!selected.contacts ||
                        selected.contacts.length === 0 ? (
                          <p className="no-item-text">
                            No contacts registered for this client yet.
                          </p>
                        ) : (
                          selected.contacts.map((ct) => (
                            <div key={ct.id} className="item-card-row">
                              <div>
                                <div className="item-title-row">
                                  <strong>{ct.name}</strong>
                                  {ct.isPrimary && (
                                    <span className="primary-badge">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <div className="item-meta-text">
                                  {ct.designation && (
                                    <span>{ct.designation} • </span>
                                  )}
                                  {ct.email && <span>{ct.email} • </span>}
                                  {ct.phone || ""}
                                </div>
                              </div>
                              <button
                                className="btn-item-delete"
                                onClick={() => handleDeleteContact(ct.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: REQUIREMENTS */}
                  {activeTab === "Requirements" && (
                    <div className="drawer-card-section">
                      <div className="section-header-action">
                        <h4>📌 Staffing Requirements</h4>
                        <button
                          className="cv-action-btn secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => setShowRequirementForm((s) => !s)}
                        >
                          {showRequirementForm ? "Cancel" : "+ Add Requirement"}
                        </button>
                      </div>

                      {showRequirementForm && (
                        <form
                          onSubmit={handleAddRequirement}
                          className="inline-add-form"
                        >
                          <div className="input-group-3d">
                            <label>Requirement Title *</label>
                            <input
                              required
                              value={requirementForm.title}
                              onChange={(e) =>
                                setRequirementForm({
                                  ...requirementForm,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Senior Backend Engineer"
                              className="cand-input"
                            />
                          </div>
                          <div className="input-group-3d">
                            <label>Description</label>
                            <textarea
                              rows={2}
                              className="cand-input"
                              style={{ resize: "vertical" }}
                              value={requirementForm.description}
                              onChange={(e) =>
                                setRequirementForm({
                                  ...requirementForm,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Node.js, MySQL, AWS experience required..."
                            />
                          </div>
                          <div className="form-grid-3">
                            <div className="input-group-3d">
                              <label>Positions</label>
                              <input
                                type="number"
                                min={1}
                                value={requirementForm.positions}
                                onChange={(e) =>
                                  setRequirementForm({
                                    ...requirementForm,
                                    positions: e.target.value,
                                  })
                                }
                                className="cand-input"
                              />
                            </div>
                            <div className="input-group-3d">
                              <label>Priority</label>
                              <select
                                className="cand-input"
                                value={requirementForm.priority}
                                onChange={(e) =>
                                  setRequirementForm({
                                    ...requirementForm,
                                    priority: e.target.value,
                                  })
                                }
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                            <div className="input-group-3d">
                              <label>Target Date</label>
                              <input
                                type="date"
                                className="cand-input"
                                value={requirementForm.targetDate}
                                onChange={(e) =>
                                  setRequirementForm({
                                    ...requirementForm,
                                    targetDate: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <button type="submit" className="cv-action-btn primary glow-btn" style={{ width: "100%", justifyContent: "center" }}>
                            Save Requirement ✨
                          </button>
                        </form>
                      )}

                      <div className="items-list-container">
                        {!selected.requirements ||
                        selected.requirements.length === 0 ? (
                          <p className="no-item-text">
                            No requirements raised for this account yet.
                          </p>
                        ) : (
                          selected.requirements.map((r) => (
                            <div key={r.id} className="item-card-row vertical">
                              <div className="item-top-row">
                                <div>
                                  <strong>{r.title}</strong>
                                  <span
                                    className={`priority-badge prio-${r.priority}`}
                                  >
                                    {r.priority}
                                  </span>
                                </div>
                                <div className="item-meta-text">
                                  {r.positions} position(s){" "}
                                  {r.targetDate &&
                                    `• Target: ${new Date(r.targetDate).toLocaleDateString()}`}
                                </div>
                              </div>
                              <div className="item-bottom-controls flex-wrap">
                                <select
                                  className="client-select-input sm"
                                  value={r.status}
                                  onChange={(e) =>
                                    handleRequirementStatus(
                                      r.id,
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="open">Open</option>
                                  <option value="on-hold">On Hold</option>
                                  <option value="filled">Filled</option>
                                  <option value="closed">Closed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                  className="btn-item-delete"
                                  onClick={() => handleDeleteRequirement(r.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CONTRACTS */}
                  {activeTab === "Contracts" && (
                    <div className="drawer-card-section">
                      <div className="section-header-action">
                        <h4>📜 Service Contracts</h4>
                        <button
                          className="cv-action-btn secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => setShowContractForm((s) => !s)}
                        >
                          {showContractForm ? "Cancel" : "+ Add Contract"}
                        </button>
                      </div>

                      {showContractForm && (
                        <form
                          onSubmit={handleAddContract}
                          className="inline-add-form"
                        >
                          <div className="input-group-3d">
                            <label>Contract Title *</label>
                            <input
                              required
                              value={contractForm.title}
                              onChange={(e) =>
                                setContractForm({
                                  ...contractForm,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Annual RPO Agreement 2026"
                              className="cand-input"
                            />
                          </div>
                          <div className="form-grid-3">
                            <div className="input-group-3d">
                              <label>Type</label>
                              <select
                                className="cand-input"
                                value={contractForm.type}
                                onChange={(e) =>
                                  setContractForm({
                                    ...contractForm,
                                    type: e.target.value,
                                  })
                                }
                              >
                                <option value="retainer">Retainer</option>
                                <option value="contingency">Contingency</option>
                                <option value="rpo">RPO</option>
                                <option value="staffing">Staffing</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="input-group-3d">
                              <label>Value</label>
                              <input
                                type="number"
                                value={contractForm.value}
                                onChange={(e) =>
                                  setContractForm({
                                    ...contractForm,
                                    value: e.target.value,
                                  })
                                }
                                placeholder="500000"
                                className="cand-input"
                              />
                            </div>
                            <div className="input-group-3d">
                              <label>Currency</label>
                              <input
                                value={contractForm.currency}
                                onChange={(e) =>
                                  setContractForm({
                                    ...contractForm,
                                    currency: e.target.value,
                                  })
                                }
                                placeholder="INR"
                                className="cand-input"
                              />
                            </div>
                          </div>
                          <div className="form-grid-2">
                            <div className="input-group-3d">
                              <label>Start Date</label>
                              <input
                                type="date"
                                value={contractForm.startDate}
                                onChange={(e) =>
                                  setContractForm({
                                    ...contractForm,
                                    startDate: e.target.value,
                                  })
                                }
                                className="cand-input"
                              />
                            </div>
                            <div className="input-group-3d">
                              <label>End Date</label>
                              <input
                                type="date"
                                value={contractForm.endDate}
                                onChange={(e) =>
                                  setContractForm({
                                    ...contractForm,
                                    endDate: e.target.value,
                                  })
                                }
                                className="cand-input"
                              />
                            </div>
                          </div>
                          <button type="submit" className="cv-action-btn primary glow-btn" style={{ width: "100%", justifyContent: "center" }}>
                            Save Contract ✨
                          </button>
                        </form>
                      )}

                      <div className="items-list-container">
                        {!selected.contracts ||
                        selected.contracts.length === 0 ? (
                          <p className="no-item-text">
                            No service contracts registered yet.
                          </p>
                        ) : (
                          selected.contracts.map((ct) => (
                            <div key={ct.id} className="item-card-row vertical">
                              <div className="item-top-row">
                                <div>
                                  <strong>{ct.title}</strong>
                                  <span
                                    className={`contract-status-badge st-${ct.status}`}
                                  >
                                    {ct.status}
                                  </span>
                                </div>
                                <div className="item-meta-text">
                                  {ct.contractNumber} • Type: {ct.type}
                                  {ct.value &&
                                    ` • ${ct.currency} ${Number(ct.value).toLocaleString()}`}
                                </div>
                              </div>
                              <div className="item-bottom-controls flex-wrap">
                                <select
                                  className="client-select-input sm"
                                  value={ct.status}
                                  onChange={(e) =>
                                    handleContractStatus(ct.id, e.target.value)
                                  }
                                >
                                  <option value="draft">Draft</option>
                                  <option value="pending-signature">
                                    Pending Signature
                                  </option>
                                  <option value="active">Active</option>
                                  <option value="expired">Expired</option>
                                  <option value="terminated">Terminated</option>
                                </select>

                                {ct.documentUrl ? (
                                  <a
                                    href={ct.documentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-doc-link"
                                  >
                                    View Document ↗
                                  </a>
                                ) : (
                                  <label className="btn-doc-upload-label">
                                    Upload Document
                                    <input
                                      type="file"
                                      style={{ display: "none" }}
                                      onChange={(e) =>
                                        handleUploadDocument(
                                          ct.id,
                                          e.target.files[0],
                                        )
                                      }
                                    />
                                  </label>
                                )}

                                <button
                                  className="btn-item-delete"
                                  onClick={() => handleDeleteContract(ct.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: NOTES */}
                  {activeTab === "Notes" && (
                    <div className="drawer-card-section">
                      <h4>💬 Account Notes &amp; Activity Log</h4>
                      <form
                        onSubmit={handleAddNote}
                        className="inline-add-form"
                        style={{ marginBottom: "20px" }}
                      >
                        <div className="input-group-3d">
                          <label>Log a call, meeting, or client update</label>
                          <textarea
                            rows={3}
                            className="cand-input"
                            style={{ resize: "vertical" }}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Discussed billing terms and candidate feedback..."
                          />
                        </div>
                        <label className="checkbox-label-row">
                          <input
                            type="checkbox"
                            checked={notePinned}
                            onChange={(e) => setNotePinned(e.target.checked)}
                          />
                          <span>Pin this note to top</span>
                        </label>
                        <button type="submit" className="cv-action-btn primary glow-btn" style={{ width: "100%", justifyContent: "center" }}>
                          Add Note ✨
                        </button>
                      </form>

                      <div className="items-list-container">
                        {!selected.notes || selected.notes.length === 0 ? (
                          <p className="no-item-text">No notes recorded yet.</p>
                        ) : (
                          selected.notes.map((n) => (
                            <div
                              key={n.id}
                              className={`note-bubble-card${n.pinned ? " pinned" : ""}`}
                            >
                              {n.pinned && (
                                <span className="pinned-tag">📌 Pinned</span>
                              )}
                              <p>{n.content}</p>
                              <div className="note-bubble-footer">
                                <span>
                                  {n.author?.name || "Team Member"} •{" "}
                                  {new Date(n.createdAt).toLocaleString()}
                                </span>
                                <button
                                  className="btn-item-delete"
                                  onClick={() => handleDeleteNote(n.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-clients-container {
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
        .client-marquee-banner {
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

        .client-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .client-marquee-track span {
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

        .crm-analytics-panel {
          position: relative;
          z-index: 2;
          margin: 0 0 24px;
          padding: 24px;
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fbff 55%, #f5f3ff 100%);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
        }
        .crm-analytics-heading { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:18px; }
        .crm-analytics-kicker { display:block; color:#4f46e5; font-size:10px; font-weight:900; letter-spacing:1.6px; margin-bottom:5px; }
        .crm-analytics-heading h2 { margin:0; color:#0f172a; font-size:23px; font-weight:900; }
        .crm-analytics-heading p { margin:5px 0 0; color:#64748b; font-size:12.5px; font-weight:700; }
        .crm-analytics-summary { min-width:120px; text-align:center; padding:10px 15px; border:1px solid #dbeafe; border-radius:14px; background:#eff6ff; }
        .crm-analytics-summary strong { display:block; color:#0284c7; font-size:23px; line-height:1; }
        .crm-analytics-summary span { color:#64748b; font-size:10px; font-weight:800; text-transform:uppercase; }
        .crm-chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .crm-chart-card { min-height:320px; padding:17px 17px 10px; border:1.5px solid #e2e8f0; border-radius:17px; background:#fff; box-shadow:0 8px 25px rgba(15,23,42,.05); }
        .crm-chart-wide { grid-column:1 / -1; min-height:290px; }
        .crm-chart-title { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
        .crm-chart-title strong { display:block; color:#0f172a; font-size:14px; font-weight:900; }
        .crm-chart-title span:not(.crm-chart-badge) { display:block; margin-top:3px; color:#64748b; font-size:11px; font-weight:700; }
        .crm-chart-badge { padding:4px 8px; border-radius:999px; background:#eef2ff; color:#4f46e5; font-size:9px; font-weight:900; letter-spacing:.7px; }
        .crm-chart-empty { height:270px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:12px; font-weight:800; }
        .crm-insight-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:16px; }
        .crm-insight-card { display:flex; align-items:center; gap:10px; padding:12px; border:1px solid #e2e8f0; border-radius:14px; background:#fff; }
        .crm-insight-card > span { width:34px; height:34px; display:grid; place-items:center; border-radius:10px; background:#f1f5f9; font-size:17px; }
        .crm-insight-card strong { display:block; color:#0f172a; font-size:12px; font-weight:900; }
        .crm-insight-card small { display:block; margin-top:2px; color:#64748b; font-size:9.5px; font-weight:700; }
        @media (max-width: 900px) {
          .crm-chart-grid { grid-template-columns:1fr; }
          .crm-chart-wide { grid-column:auto; }
          .crm-insight-row { grid-template-columns:1fr 1fr; }
        }
        @media (max-width: 600px) {
          .crm-analytics-panel { padding:16px; }
          .crm-analytics-heading { align-items:flex-start; flex-direction:column; }
          .crm-insight-row { grid-template-columns:1fr; }
        }

        .client-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
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
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-stat-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .stat-val {
          display: block;
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

        .client-search-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
        }

        .clear-search-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 14px;
          font-weight: 900;
        }

        .clear-search-btn:hover {
          color: #0f172a;
        }

        .client-select-dark {
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          padding: 10px 0;
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
          cursor: pointer;
        }

        .client-name-cell strong {
          color: #0f172a;
          font-size: 14.5px;
          font-weight: 900;
        }

        .client-code-tag {
          font-size: 11.5px;
          color: #0284c7;
          font-weight: 800;
        }

        .status-pill-badge {
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: capitalize;
        }

        .action-btns-group {
          display: flex;
          gap: 8px;
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
          padding: 50px 20px;
          color: #64748b;
          font-weight: 700;
        }

        .empty-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }

        .cand-empty-state h3 {
          font-size: 16px;
          color: #0f172a;
          margin: 0 0 6px;
          font-weight: 900;
        }

        .cand-empty-state p {
          font-size: 13px;
          margin: 0;
          font-weight: 600;
        }

        /* Modal / Drawer Styling */
        .modal-overlay-light, .client-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .client-drawer-overlay {
          justify-content: flex-end;
          padding: 0;
        }

        .modal-card-light, .client-glass-drawer {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
          width: 100%;
        }

        .client-glass-drawer {
          max-width: 580px;
          height: 100vh;
          border-radius: 0;
          border-left: 1.5px solid #cbd5e1;
          display: flex;
          flex-direction: column;
          box-shadow: -20px 0 50px rgba(15, 23, 42, 0.2);
          animation: slideInDrawer 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header-3d {
          padding: 24px;
          border-bottom: 1.5px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #f8fafc;
        }

        .drawer-header-3d h2 {
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .drawer-subtext {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          font-weight: 700;
        }

        .close-drawer-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 28px;
          cursor: pointer;
          font-weight: 900;
        }
        .close-drawer-btn:hover {
          color: #0f172a;
        }

        .drawer-tabs-bar {
          display: flex;
          gap: 6px;
          padding: 12px 20px;
          background: #f8fafc;
          border-bottom: 1.5px solid #e2e8f0;
          overflow-x: auto;
        }

        .drawer-tab-btn {
          padding: 8px 14px;
          background: transparent;
          border: 1.5px solid transparent;
          color: #64748b;
          font-size: 12.5px;
          font-weight: 800;
          border-radius: 10px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .drawer-tab-btn.active {
          background: #e0f2fe;
          color: #0284c7;
          border-color: #bae6fd;
        }

        .drawer-scroll-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #ffffff;
        }

        .drawer-card-section {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          padding: 18px;
          border-radius: 18px;
        }

        .drawer-card-section h4 {
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 14px;
        }

        .overview-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .det-label {
          display: block;
          font-size: 11.5px;
          color: #64748b;
          font-weight: 800;
          text-transform: uppercase;
        }

        .det-val {
          font-size: 13.5px;
          color: #0f172a;
          font-weight: 800;
        }

        .section-header-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .inline-add-form {
          background: #ffffff;
          border: 1.5px dashed #cbd5e1;
          padding: 16px;
          border-radius: 14px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #334155;
          font-weight: 700;
          cursor: pointer;
        }

        .items-list-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .item-card-row {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .item-card-row.vertical {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .item-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .item-meta-text {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          margin-top: 4px;
        }

        .primary-badge {
          background: #ecfdf5;
          color: #059669;
          font-size: 10.5px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: 8px;
          border: 1.5px solid #a7f3d0;
        }

        .priority-badge {
          font-size: 10.5px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: 8px;
          text-transform: uppercase;
        }
        .priority-badge.prio-high, .priority-badge.prio-urgent { background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; }
        .priority-badge.prio-medium { background: #fef3c7; color: #d97706; border: 1.5px solid #fde68a; }
        .priority-badge.prio-low { background: #e0f2fe; color: #0284c7; border: 1.5px solid #bae6fd; }

        .contract-status-badge {
          font-size: 10.5px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: 8px;
          text-transform: capitalize;
        }
        .contract-status-badge.st-active { background: #ecfdf5; color: #059669; border: 1.5px solid #a7f3d0; }
        .contract-status-badge.st-draft { background: #f1f5f9; color: #64748b; border: 1.5px solid #cbd5e1; }
        .contract-status-badge.st-pending-signature { background: #fef3c7; color: #d97706; border: 1.5px solid #fde68a; }

        .item-bottom-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .item-bottom-controls.flex-wrap {
          flex-wrap: wrap;
        }

        .btn-item-delete {
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          color: #dc2626;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 800;
          cursor: pointer;
        }
        .btn-item-delete:hover {
          background: #fee2e2;
        }

        .btn-doc-link, .btn-doc-upload-label {
          font-size: 12px;
          color: #0284c7;
          font-weight: 800;
          text-decoration: none;
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          padding: 4px 10px;
          border-radius: 8px;
          cursor: pointer;
        }

        .note-bubble-card {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 14px;
          border-radius: 14px;
          position: relative;
        }

        .note-bubble-card.pinned {
          border-color: #0284c7;
          background: #f0f9ff;
        }

        .pinned-tag {
          font-size: 10.5px;
          color: #0284c7;
          font-weight: 900;
          display: inline-block;
          margin-bottom: 6px;
        }

        .note-bubble-card p {
          margin: 0 0 10px;
          font-size: 13.5px;
          color: #0f172a;
          font-weight: 700;
        }

        .note-bubble-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11.5px;
          color: #64748b;
          font-weight: 700;
        }

        .no-item-text {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          font-weight: 700;
          font-style: italic;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
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

        .cand-input, .client-select-input {
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

        .cand-input:focus, .client-select-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
        }

        .client-select-input.sm {
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default AdminClients;