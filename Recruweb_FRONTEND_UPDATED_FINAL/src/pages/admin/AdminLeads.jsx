import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  "proposal-sent": "Proposal Sent",
  negotiation: "Negotiation",
  converted: "Converted",
  lost: "Lost",
};

const emptyFollowUp = {
  type: "call",
  notes: "",
  outcome: "",
  followUpDate: "",
  completed: false,
};

const statusMeta = (status) => {
  switch (status) {
    case "converted":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
        label: "Converted",
      };
    case "qualified":
    case "proposal-sent":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
        label: status === "qualified" ? "Qualified" : "Proposal Sent",
      };
    case "negotiation":
      return {
        bg: "#f3e8ff",
        text: "#9333ea",
        border: "#e9d5ff",
        label: "Negotiation",
      };
    case "contacted":
      return {
        bg: "#f8fafc",
        text: "#6366f1",
        border: "#cbd5e1",
        label: "Contacted",
      };
    case "lost":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
        label: "Lost",
      };
    default:
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
        label: "New",
      };
  }
};

const STATUS_COLORS = {
  new: "#d97706",
  contacted: "#6366f1",
  qualified: "#0284c7",
  "proposal-sent": "#0284c7",
  negotiation: "#9333ea",
  converted: "#059669",
  lost: "#dc2626",
};

const SOURCE_COLORS = [
  "#0284c7",
  "#6366f1",
  "#9333ea",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#0d9488",
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="lead-chart-tooltip">
      {label && <div className="lead-chart-tooltip-label">{label}</div>}
      {payload.map((entry, idx) => (
        <div key={idx} className="lead-chart-tooltip-row">
          <span
            className="lead-chart-tooltip-dot"
            style={{ background: entry.color || entry.payload?.fill }}
          ></span>
          {entry.name}: <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
};

const AdminLeads = () => {
  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpForm, setFollowUpForm] = useState(emptyFollowUp);

  const [showConvert, setShowConvert] = useState(false);
  const [convertAccountManagerId, setConvertAccountManagerId] = useState("");
  const [converting, setConverting] = useState(false);

  const [showLostForm, setShowLostForm] = useState(false);
  const [lostReason, setLostReason] = useState("");

  const loadDashboard = async () => {
    const res = await api.leads.getDashboard();
    if (res?.success) setDashboard(res.data);
  };

  // Status funnel -> pie chart slices
  const statusChartData = useMemo(() => {
    if (!dashboard?.byStatus) return [];
    return Object.entries(STATUS_LABELS)
      .map(([key, label]) => ({
        key,
        name: label,
        value: dashboard.byStatus[key] || 0,
        color: STATUS_COLORS[key] || "#0284c7",
      }))
      .filter((d) => d.value > 0);
  }, [dashboard]);

  // Source breakdown -> bar chart
  const sourceChartData = useMemo(() => {
    if (!dashboard?.bySource) return [];
    return dashboard.bySource
      .map((s, idx) => ({
        name: s.source
          ? s.source.charAt(0).toUpperCase() + s.source.slice(1)
          : "Unknown",
        count: Number(s.count) || 0,
        color: SOURCE_COLORS[idx % SOURCE_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [dashboard]);

  const conversionChartData = useMemo(() => {
    const rate = Math.max(0, Math.min(100, Number(dashboard?.conversionRate) || 0));
    return [
      { name: "Converted", value: rate, color: "#059669" },
      { name: "Remaining", value: 100 - rate, color: "#e2e8f0" },
    ];
  }, [dashboard]);

  const funnelChartData = useMemo(() => {
    const counts = dashboard?.byStatus || {};
    return [
      { name: "New", value: Number(counts.new) || 0 },
      { name: "Contacted", value: Number(counts.contacted) || 0 },
      { name: "Qualified", value: Number(counts.qualified) || 0 },
      { name: "Proposal", value: Number(counts["proposal-sent"]) || 0 },
      { name: "Negotiation", value: Number(counts.negotiation) || 0 },
      { name: "Converted", value: Number(counts.converted) || 0 },
      { name: "Lost", value: Number(counts.lost) || 0 },
    ];
  }, [dashboard]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await api.leads.getAll(params);
      if (res?.success) setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeam = async () => {
    const res = await api.team.getAssignableUsers();
    if (res?.success) setTeam(res.data);
  };

  const refreshAll = () => {
    loadLeads();
    loadDashboard();
    loadTeam();
  };

  useEffect(() => {
    loadDashboard();
    loadTeam();
  }, []);

  useEffect(() => {
    const t = setTimeout(loadLeads, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, priorityFilter]);

  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = ["Lead Code,Name,Email,Phone,Company Name,Status,Priority"];
    const rows = leads.map((l) =>
      [
        l.leadCode || "",
        `"${l.name || ""}"`,
        l.email || "",
        l.phone || "",
        `"${l.companyName || ""}"`,
        l.status || "",
        l.priority || "",
      ].join(","),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "crm_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openLead = async (id) => {
    setSelected({ id });
    setDetailLoading(true);
    setShowFollowUpForm(false);
    setShowConvert(false);
    setShowLostForm(false);
    try {
      const res = await api.leads.getById(id);
      if (res?.success) setSelected(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelected = () => {
    if (selected?.id) openLead(selected.id);
  };

  const handleAssign = async (leadId, assignedToId, e) => {
    e?.stopPropagation();
    const res = await api.leads.assign(leadId, assignedToId || null);
    if (res?.success) {
      refreshAll();
      if (selected?.id === leadId) refreshSelected();
    }
  };

  const handleStatusChange = async (leadId, status, e) => {
    e?.stopPropagation();
    const res = await api.leads.update(leadId, { status });
    if (res?.success) {
      refreshAll();
      if (selected?.id === leadId) refreshSelected();
    }
  };

  const handlePriorityChange = async (leadId, priority) => {
    const res = await api.leads.update(leadId, { priority });
    if (res?.success) refreshSelected();
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    const res = await api.leads.createFollowUp(selected.id, followUpForm);
    if (res?.success) {
      setFollowUpForm(emptyFollowUp);
      setShowFollowUpForm(false);
      refreshSelected();
      refreshAll();
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await api.leads.convert(selected.id, {
        accountManagerId: convertAccountManagerId || undefined,
      });
      if (res?.success) {
        setShowConvert(false);
        refreshSelected();
        refreshAll();
        window.alert(
          `Converted! New client: ${res.data.client.name} (${res.data.client.clientCode})`,
        );
      } else {
        window.alert(res?.message || "Failed to convert lead");
      }
    } finally {
      setConverting(false);
    }
  };

  const handleMarkLost = async (e) => {
    e.preventDefault();
    const res = await api.leads.markLost(selected.id, lostReason);
    if (res?.success) {
      setShowLostForm(false);
      setLostReason("");
      refreshSelected();
      refreshAll();
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Delete this lead permanently?")) return;
    const res = await api.leads.delete(id);
    if (res?.success) {
      refreshAll();
      if (selected?.id === id) setSelected(null);
    }
  };

  return (
    <div className="light-leads-container">
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
      <div className="lead-marquee-banner">
        <div className="lead-marquee-track">
          <span>✨ Recruweb Enterprise Inquiry Dashboard &amp; Lead CRM</span>
          <span>•</span>
          <span>📈 Manage Inquiries, Recruiter Assignments &amp; Scheduled Follow-ups</span>
          <span>•</span>
          <span>⭐ Real-time Animated Funnel Analytics &amp; Client Conversions</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Inquiry Dashboard <span className="gradient-text">— Lead CRM</span>
            </h1>
            <p className="cand-subtitle">
              Manage inquiries, recruiter assignments, scheduled follow-ups &amp; client conversions
            </p>
          </div>
          <div className="header-actions">
            <button
              className="cv-action-btn secondary"
              onClick={refreshAll}
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
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Funnel Stages Bar */}
      {dashboard && (
        <div className="lead-funnel-grid" style={{ position: 'relative', zIndex: 2 }}>
          {Object.keys(STATUS_LABELS).map((status) => {
            const isSelected = statusFilter === status;
            return (
              <div
                key={status}
                className={`funnel-stage-card${isSelected ? " active-funnel" : ""}`}
                onClick={() => setStatusFilter(isSelected ? "" : status)}
              >
                <div className="funnel-val">
                  {dashboard.byStatus?.[status] || 0}
                </div>
                <div className="funnel-lbl">{STATUS_LABELS[status]}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top Stat Cards Grid */}
      {dashboard && (
        <div className="client-stats-grid" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#0284c7" }}>{dashboard.total}</span>
            <span className="stat-lbl">Total Inquiries</span>
            <div className="card-glow-bar" style={{ background: "#0284c7" }}></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#d97706" }}>{dashboard.unassigned}</span>
            <span className="stat-lbl">Unassigned Leads</span>
            <div className="card-glow-bar" style={{ background: "#d97706" }}></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#dc2626" }}>{dashboard.overdueFollowUps}</span>
            <span className="stat-lbl">Overdue Follow-ups</span>
            <div className="card-glow-bar" style={{ background: "#dc2626" }}></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#059669" }}>{dashboard.conversionRate}%</span>
            <span className="stat-lbl">Conversion Rate</span>
            <div className="card-glow-bar" style={{ background: "#059669" }}></div>
          </div>
        </div>
      )}

      {/* Analytics Charts Row with Smooth Animations */}
      {dashboard && (
        <div className="client-grid-2" style={{ position: 'relative', zIndex: 2, marginBottom: "28px" }}>
          <div className="cand-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="lead-chart-card-header" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>Leads by Status</h3>
              <span className="lead-chart-card-sub">Distribution across the funnel</span>
            </div>
            {statusChartData.length === 0 ? (
              <div style={{ position: "relative", zIndex: 2, height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: "No leads", value: 100 }]} dataKey="value" cx="50%" cy="46%" innerRadius={60} outerRadius={95} stroke="none">
                      <Cell fill="#e2e8f0" />
                    </Pie>
                    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fill: "#0f172a", fontSize: 28, fontWeight: 900 }}>0</text>
                    <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" style={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}>LEADS</text>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: "center", marginTop: -18, color: "#64748b", fontSize: 12, fontWeight: 700 }}>Waiting for inquiries</div>
              </div>
            ) : (
              <div style={{ position: 'relative', zIndex: 2 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={1000}
                    >
                      {statusChartData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: "#334155", fontSize: 12, fontWeight: "700" }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="card-glow-bar"></div>
          </div>

          <div className="cand-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="lead-chart-card-header" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>Leads by Source</h3>
              <span className="lead-chart-card-sub">Where inquiries are coming from</span>
            </div>
            {sourceChartData.length === 0 ? (
              <div style={{ position: "relative", zIndex: 2, height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: "No data", count: 0 }]} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                    <YAxis allowDecimals={false} domain={[0, 1]} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                    <Bar dataKey="count" name="Inquiries" radius={[8, 8, 0, 0]} fill="#cbd5e1" />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ textAlign: "center", marginTop: -8, color: "#64748b", fontSize: 12, fontWeight: 700 }}>Source analytics will populate automatically</div>
              </div>
            ) : (
              <div style={{ position: 'relative', zIndex: 2 }}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={sourceChartData}
                    margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(2, 132, 199, 0.05)" }}
                      content={<ChartTooltip />}
                    />
                    <Bar
                      dataKey="count"
                      name="Inquiries"
                      radius={[8, 8, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1000}
                    >
                      {sourceChartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="card-glow-bar"></div>
          </div>
        </div>
      )}

      {/* Additional Lead Performance Analytics */}
      {dashboard && (
        <div className="client-grid-2" style={{ position: "relative", zIndex: 2, marginBottom: "28px" }}>
          <div className="cand-card-3d">
            <div className="card-bg-light-glow"></div>
            <div style={{ position: "relative", zIndex: 2, marginBottom: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", margin: 0 }}>Conversion Performance</h3>
              <span className="lead-chart-card-sub">Converted leads versus the closed pipeline</span>
            </div>
            <div style={{ position: "relative", zIndex: 2, height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={conversionChartData} dataKey="value" cx="50%" cy="50%" innerRadius={68} outerRadius={98} startAngle={90} endAngle={-270} stroke="none">
                    {conversionChartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" style={{ fill: "#0f172a", fontSize: 30, fontWeight: 900 }}>{Number(dashboard.conversionRate || 0).toFixed(1)}%</text>
                  <text x="50%" y="59%" textAnchor="middle" dominantBaseline="middle" style={{ fill: "#64748b", fontSize: 11, fontWeight: 800 }}>CONVERSION</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 22, position: "relative", zIndex: 2, fontSize: 12, fontWeight: 800 }}>
              <span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: "#059669", marginRight: 6 }}></i>Converted {dashboard.byStatus?.converted || 0}</span>
              <span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: "#e2e8f0", marginRight: 6 }}></i>Remaining</span>
            </div>
            <div className="card-glow-bar" style={{ background: "#059669" }}></div>
          </div>

          <div className="cand-card-3d">
            <div className="card-bg-light-glow"></div>
            <div style={{ position: "relative", zIndex: 2, marginBottom: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", margin: 0 }}>Pipeline Funnel</h3>
              <span className="lead-chart-card-sub">Lead volume at every recruitment stage</span>
            </div>
            <div style={{ position: "relative", zIndex: 2, height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={funnelChartData} margin={{ top: 4, right: 18, left: 12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={78} tick={{ fill: "#475569", fontSize: 11, fontWeight: 800 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Leads" radius={[0, 8, 8, 0]} fill="#6366f1" isAnimationActive animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ position: "relative", zIndex: 2, textAlign: "center", color: "#64748b", fontSize: 12, fontWeight: 700 }}>
              {dashboard.total ? `${dashboard.total} total inquiries across the pipeline` : "No pipeline records yet"}
            </div>
            <div className="card-glow-bar" style={{ background: "#6366f1" }}></div>
          </div>
        </div>
      )}

      {/* Toolbar Filter Bar */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", minWidth: "280px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="lead-search-input"
            placeholder="Search by name, email, company..."
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
            className="lead-select-dark"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-wrap" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "0 16px", borderRadius: "12px" }}>
          <span className="filter-icon">⚡</span>
          <select
            className="lead-select-dark"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
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
              <span className="cand-loader"></span> Fetching lead inquiries...
            </div>
          ) : leads.length === 0 ? (
            <div className="cand-empty-state">
              <div className="empty-icon">📂</div>
              <h3>No inquiries found</h3>
              <p>No inquiries match your active filters.</p>
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Lead Name &amp; Code</th>
                    <th>Company Organization</th>
                    <th>Pipeline Status</th>
                    <th>Priority</th>
                    <th>Assigned Recruiter</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => {
                    const meta = statusMeta(l.status);
                    return (
                      <tr
                        key={l.id}
                        onClick={() => openLead(l.id)}
                        className="table-row-hover"
                      >
                        <td>
                          <div className="lead-name-cell">
                            <strong>{l.name}</strong>
                            <span className="lead-meta-sub">
                              {l.leadCode} • {l.email}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{l.companyName || "—"}</td>
                        <td>
                          <span
                            className="status-pill-badge"
                            style={{
                              background: meta.bg,
                              color: meta.text,
                              borderColor: meta.border,
                            }}
                          >
                            {STATUS_LABELS[l.status] || l.status}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-pill prio-${l.priority}`}>
                            {l.priority}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            className="lead-table-select"
                            value={l.assignedToId || ""}
                            onChange={(e) =>
                              handleAssign(l.id, e.target.value, e)
                            }
                          >
                            <option value="">Unassigned</option>
                            {team.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                            onClick={(e) => handleDelete(l.id, e)}
                          >
                            Delete
                          </button>
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

      {/* ---- Lead Detail Drawer ---- */}
      {selected && (
        <div className="client-drawer-overlay" onClick={() => setSelected(null)}>
          <div
            className="client-glass-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header-3d">
              <div>
                <h2>{selected.name || "Loading..."}</h2>
                {selected.leadCode && (
                  <span className="lead-code-tag">{selected.leadCode}</span>
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
                <span className="cand-loader"></span> Loading inquiry details...
              </div>
            ) : (
              <div className="drawer-scroll-body">
                {/* Overview Card */}
                <div className="drawer-card-section">
                  <h4>📋 Inquiry Details</h4>
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
                        {STATUS_LABELS[selected.status]}
                      </span>
                    </div>
                    <div>
                      <span className="det-label">Priority:</span>
                      <span
                        className={`priority-pill prio-${selected.priority}`}
                        style={{ display: "inline-block", marginTop: "4px" }}
                      >
                        {selected.priority}
                      </span>
                    </div>
                    <div>
                      <span className="det-label">Email:</span>
                      <span className="det-val">{selected.email || "—"}</span>
                    </div>
                    <div>
                      <span className="det-label">Phone:</span>
                      <span className="det-val">{selected.phone || "—"}</span>
                    </div>
                    <div>
                      <span className="det-label">Company:</span>
                      <span className="det-val">
                        {selected.companyName || "—"}{" "}
                        {selected.designation
                          ? `(${selected.designation})`
                          : ""}
                      </span>
                    </div>
                    <div>
                      <span className="det-label">Industry:</span>
                      <span className="det-val">
                        {selected.industry || "—"}
                      </span>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <span className="det-label">Requirement:</span>
                      <span className="det-val">
                        {selected.requirement || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="det-label">Positions Needed:</span>
                      <span className="det-val">
                        {selected.positionsNeeded || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="det-label">Lead Source:</span>
                      <span className="det-val">{selected.source || "—"}</span>
                    </div>
                    <div>
                      <span className="det-label">Assigned Recruiter:</span>
                      <span className="det-val">
                        {selected.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <div
                    className="drawer-action-controls"
                    style={{ marginTop: "16px" }}
                  >
                    <div className="select-inline-group" style={{ display: "flex", gap: "10px" }}>
                      <select
                        className="cand-input"
                        value={selected.status}
                        onChange={(e) =>
                          handleStatusChange(selected.id, e.target.value, e)
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <select
                        className="cand-input"
                        value={selected.priority}
                        onChange={(e) =>
                          handlePriorityChange(selected.id, e.target.value)
                        }
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    {selected.status !== "converted" &&
                      selected.status !== "lost" && (
                        <div className="conversion-btn-row" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                          <button
                            className="cv-action-btn primary glow-btn"
                            style={{ flex: 1, justifyContent: "center" }}
                            onClick={() => setShowConvert((s) => !s)}
                          >
                            🚀 Convert to Client
                          </button>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", flex: 1, justifyContent: "center", borderRadius: "12px", fontWeight: "800", cursor: "pointer" }}
                            onClick={() => setShowLostForm((s) => !s)}
                          >
                            ❌ Mark as Lost
                          </button>
                        </div>
                      )}

                    {selected.status === "converted" &&
                      selected.convertedClient && (
                        <div className="cand-msg-banner" style={{ marginTop: "10px" }}>
                          🎉 Converted to client{" "}
                          <strong>{selected.convertedClient.name}</strong> (
                          {selected.convertedClient.clientCode})
                        </div>
                      )}

                    {showConvert && (
                      <div className="inline-add-form" style={{ marginTop: "10px" }}>
                        <div className="input-group-3d">
                          <label>Account Manager for new client</label>
                          <select
                            className="cand-input"
                            value={convertAccountManagerId}
                            onChange={(e) =>
                              setConvertAccountManagerId(e.target.value)
                            }
                          >
                            <option value="">
                              Same as assigned ({selected.assignedTo?.name || "none"})
                            </option>
                            {team.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          className="cv-action-btn primary glow-btn"
                          disabled={converting}
                          onClick={handleConvert}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          {converting
                            ? "Converting..."
                            : "Confirm Client Conversion ✨"}
                        </button>
                      </div>
                    )}

                    {showLostForm && (
                      <form
                        onSubmit={handleMarkLost}
                        className="inline-add-form"
                        style={{ marginTop: "10px" }}
                      >
                        <div className="input-group-3d">
                          <label>Reason for Loss (Optional)</label>
                          <input
                            value={lostReason}
                            onChange={(e) => setLostReason(e.target.value)}
                            placeholder="Budget constraints, chose competitor..."
                            className="cand-input"
                          />
                        </div>
                        <button
                          type="submit"
                          className="cv-action-btn"
                          style={{ background: "#dc2626", color: "#fff", width: "100%", justifyContent: "center", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "800", cursor: "pointer" }}
                        >
                          Confirm Mark as Lost
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Follow-up History Section */}
                <div className="drawer-card-section">
                  <div className="section-header-action">
                    <h4>📞 Follow-up History</h4>
                    <button
                      className="cv-action-btn secondary"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => setShowFollowUpForm((s) => !s)}
                    >
                      {showFollowUpForm ? "Cancel" : "+ Log Follow-up"}
                    </button>
                  </div>

                  {showFollowUpForm && (
                    <form
                      onSubmit={handleAddFollowUp}
                      className="inline-add-form"
                    >
                      <div className="form-grid-2">
                        <div className="input-group-3d">
                          <label>Interaction Type</label>
                          <select
                            className="cand-input"
                            value={followUpForm.type}
                            onChange={(e) =>
                              setFollowUpForm({
                                ...followUpForm,
                                type: e.target.value,
                              })
                            }
                          >
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="note">Note</option>
                          </select>
                        </div>
                        <div className="input-group-3d">
                          <label>Due Date &amp; Time *</label>
                          <input
                            type="datetime-local"
                            required
                            className="cand-input"
                            value={followUpForm.followUpDate}
                            onChange={(e) =>
                              setFollowUpForm({
                                ...followUpForm,
                                followUpDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="input-group-3d">
                        <label>Notes *</label>
                        <textarea
                          rows={3}
                          required
                          className="cand-input"
                          style={{ resize: "vertical" }}
                          value={followUpForm.notes}
                          onChange={(e) =>
                            setFollowUpForm({
                              ...followUpForm,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Summary of conversation..."
                        />
                      </div>

                      <div className="input-group-3d">
                        <label>Outcome</label>
                        <select
                          className="cand-input"
                          value={followUpForm.outcome}
                          onChange={(e) =>
                            setFollowUpForm({
                              ...followUpForm,
                              outcome: e.target.value,
                            })
                          }
                        >
                          <option value="">— Select Outcome —</option>
                          <option value="no-answer">No Answer</option>
                          <option value="interested">Interested</option>
                          <option value="not-interested">Not Interested</option>
                          <option value="callback-requested">Callback Requested</option>
                          <option value="info-shared">Info Shared</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <label className="checkbox-label-row">
                        <input
                          type="checkbox"
                          checked={followUpForm.completed}
                          onChange={(e) =>
                            setFollowUpForm({
                              ...followUpForm,
                              completed: e.target.checked,
                            })
                          }
                        />
                        <span>Mark follow-up as already completed</span>
                      </label>

                      <button type="submit" className="cv-action-btn primary glow-btn" style={{ width: "100%", justifyContent: "center" }}>
                        Save Follow-up Log ✨
                      </button>
                    </form>
                  )}

                  <div className="items-list-container">
                    {!selected.followUps || selected.followUps.length === 0 ? (
                      <p className="no-item-text">
                        No follow-ups logged for this inquiry yet.
                      </p>
                    ) : (
                      selected.followUps.map((f) => (
                        <div key={f.id} className="followup-card-item">
                          <div className="followup-top-row">
                            <strong>{f.type.toUpperCase()}</strong>
                            {f.completed ? (
                              <span className="badge-status-done">
                                Completed
                              </span>
                            ) : (
                              <span className="badge-status-pending">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="followup-notes-text">{f.notes}</p>
                          <div className="followup-meta-footer">
                            <span>
                              {f.creator?.name || "System"} • Due:{" "}
                              {new Date(f.followUpDate).toLocaleString()}
                              {f.outcome ? ` • Outcome: ${f.outcome}` : ""}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-leads-container {
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
        .lead-marquee-banner {
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

        .lead-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .lead-marquee-track span {
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

        .lead-funnel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .funnel-stage-card {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 16px;
          padding: 14px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
        }

        .funnel-stage-card:hover {
          background: #f1f5f9;
          border-color: #0284c7;
        }

        .funnel-stage-card.active-funnel {
          background: linear-gradient(135deg, #e0f2fe, #ede9fe);
          border-color: #0284c7;
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.2);
        }

        .funnel-val {
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .funnel-lbl {
          font-size: 11.5px;
          font-weight: 800;
          color: #64748b;
        }

        .client-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

        .client-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        .lead-chart-card-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
          color: #0f172a;
        }

        .lead-chart-card-sub {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }

        .lead-chart-empty {
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
          padding: 0 24px;
        }

        .lead-chart-tooltip {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          color: #0f172a;
          font-weight: 700;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
        }

        .lead-chart-tooltip-label {
          font-weight: 900;
          margin-bottom: 4px;
          color: #0f172a;
        }

        .lead-chart-tooltip-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lead-chart-tooltip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .lead-search-input {
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

        .lead-select-dark {
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

        .lead-name-cell strong {
          color: #0f172a;
          font-size: 14.5px;
          font-weight: 900;
        }

        .lead-meta-sub {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 700;
        }

        .status-pill-badge {
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: capitalize;
        }

        .priority-pill {
          font-size: 11px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          text-transform: uppercase;
        }
        .priority-pill.prio-high { background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; }
        .priority-pill.prio-medium { background: #fef3c7; color: #d97706; border: 1.5px solid #fde68a; }
        .priority-pill.prio-low { background: #e0f2fe; color: #0284c7; border: 1.5px solid #bae6fd; }

        .lead-table-select {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 800;
          outline: none;
          cursor: pointer;
        }

        .client-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }

        .client-glass-drawer {
          width: 100%;
          max-width: 580px;
          height: 100vh;
          background: #ffffff;
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

        .lead-code-tag {
          font-size: 12px;
          color: #0284c7;
          font-weight: 800;
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

        .cand-msg-banner {
          background: #ecfdf5;
          border: 1.5px solid #a7f3d0;
          color: #059669;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
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

        .followup-card-item {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 14px;
          border-radius: 14px;
        }

        .followup-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12.5px;
          color: #0f172a;
          font-weight: 900;
        }

        .badge-status-done {
          background: #ecfdf5;
          color: #059669;
          font-size: 10.5px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1.5px solid #a7f3d0;
        }

        .badge-status-pending {
          background: #fef3c7;
          color: #d97706;
          font-size: 10.5px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1.5px solid #fde68a;
        }

        .followup-notes-text {
          margin: 0 0 8px;
          font-size: 13.5px;
          color: #334155;
          font-weight: 700;
        }

        .followup-meta-footer {
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
      `}</style>
    </div>
  );
};

export default AdminLeads;