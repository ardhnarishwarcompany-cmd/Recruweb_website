import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../../utils/api";
import MeetingRoom from "../../components/interview/MeetingRoom";
import useAuth from "../../hooks/useAuth";
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

const RecChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rec-chart-tooltip">
      {label && <div className="rec-chart-tooltip-label">{label}</div>}
      {payload.map((entry, idx) => (
        <div key={idx} className="rec-chart-tooltip-row">
          <span
            className="rec-chart-tooltip-dot"
            style={{ background: entry.color || entry.payload?.fill }}
          ></span>
          {entry.name}: <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
};

const TABS = [
  { key: "overview", label: "Dashboard" },
  { key: "jobs", label: "Assigned Jobs" },
  { key: "candidates", label: "Assigned Candidates" },
  { key: "tasks", label: "Tasks" },
  { key: "calendar", label: "Calendar" },
  { key: "reminders", label: "Reminders" },
  { key: "performance", label: "Performance" },
];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STAGE_COLORS = [
  "#0284c7",
  "#6366f1",
  "#9333ea",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#0d9488",
];

const computePipelineStages = (candidates) => {
  if (!candidates?.length) return [];
  const counts = {};
  candidates.forEach((c) => {
    const stage = c.pipelineStage || "Unknown";
    counts[stage] = (counts[stage] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count], idx) => ({
      name,
      count,
      color: STAGE_COLORS[idx % STAGE_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);
};

// ===================== OVERVIEW =====================
const Overview = ({ dashboard, loading, onNavigate }) => {
  if (loading)
    return (
      <div className="cand-loading-state">
        <span className="cand-loader"></span> Loading workspace dashboard...
      </div>
    );
  if (!dashboard)
    return <div className="cand-empty-state">No dashboard data available.</div>;

  const cards = [
    {
      key: "assignedJobsCount",
      label: "Assigned Jobs",
      tab: "jobs",
      glow: "#0284c7",
    },
    {
      key: "assignedCandidatesCount",
      label: "Assigned Candidates",
      tab: "candidates",
      glow: "#6366f1",
    },
    {
      key: "pendingTasksCount",
      label: "Pending Tasks",
      tab: "tasks",
      glow: "#d97706",
    },
    {
      key: "overdueTasksCount",
      label: "Overdue Tasks",
      tab: "tasks",
      glow: "#dc2626",
    },
    {
      key: "upcomingRemindersCount",
      label: "Upcoming Reminders (7d)",
      tab: "reminders",
      glow: "#9333ea",
    },
  ];

  // Task health -> pie chart
  const pendingCount = dashboard.pendingTasksCount || 0;
  const overdueCount = dashboard.overdueTasksCount || 0;
  const onTrackCount = Math.max(pendingCount - overdueCount, 0);
  const taskChartData = [
    { name: "On Track", value: onTrackCount, color: "#059669" },
    { name: "Overdue", value: overdueCount, color: "#dc2626" },
  ].filter((d) => d.value > 0);

  // Candidate pipeline stage breakdown -> bar chart
  const pipelineChartData = computePipelineStages(dashboard.recentCandidates);

  // Always-visible workload analytics. Unlike the pipeline/task charts, this
  // chart is driven directly by the dashboard counters, so recruiters still
  // get a useful visual even when there are currently no assigned records.
  const workloadChartData = [
    { name: "Jobs", value: dashboard.assignedJobsCount || 0, color: "#0284c7" },
    { name: "Candidates", value: dashboard.assignedCandidatesCount || 0, color: "#6366f1" },
    { name: "Pending Tasks", value: dashboard.pendingTasksCount || 0, color: "#d97706" },
    { name: "Overdue", value: dashboard.overdueTasksCount || 0, color: "#dc2626" },
    { name: "Reminders", value: dashboard.upcomingRemindersCount || 0, color: "#9333ea" },
  ];

  return (
    <div>
      <div className="client-stats-grid">
        {cards.map((c) => (
          <div
            className="cand-stat-card-3d clickable"
            key={c.key}
            onClick={() => onNavigate(c.tab)}
            style={{ cursor: "pointer" }}
          >
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: c.glow }}>{dashboard[c.key] ?? 0}</span>
            <span className="stat-lbl">{c.label}</span>
            <div className="card-glow-bar" style={{ background: c.glow }}></div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row with Animations */}
      <div className="client-grid-2" style={{ marginBottom: "28px" }}>
        <div className="cand-card-3d" style={{ gridColumn: "1 / -1" }}>
          <div className="card-bg-light-glow"></div>
          <div
            className="panel-header-flex"
            style={{ position: "relative", zIndex: 2, marginBottom: "8px" }}
          >
            <div>
              <h3
                className="panel-title"
                style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "4px" }}
              >
                📈 Recruiter Workload Analytics
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: 700 }}>
                Live workload across jobs, candidates, tasks and reminders
              </p>
            </div>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: "11px",
                fontWeight: 900,
              }}
            >
              LIVE ANALYTICS
            </span>
          </div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <ResponsiveContainer width="100%" height={245}>
              <BarChart
                data={workloadChartData}
                margin={{ top: 12, right: 18, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 800 }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, "dataMax + 1"]}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<RecChartTooltip />} />
                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[8, 8, 0, 0]}
                  background={{ fill: "#f1f5f9", radius: 8 }}
                  isAnimationActive={true}
                  animationDuration={900}
                >
                  {workloadChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card-glow-bar"></div>
        </div>

        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="panel-header-flex" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
            <h3 className="panel-title" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>📊 Task Health</h3>
          </div>
          {taskChartData.length === 0 ? (
            <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>
              No task activity yet. This chart will populate automatically when tasks are created.
            </div>
          ) : (
            <div style={{ position: 'relative', zIndex: 2 }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={taskChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={1000}
                  >
                    {taskChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<RecChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
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
          <div className="panel-header-flex" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
            <h3 className="panel-title" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>🧭 Candidates by Pipeline Stage</h3>
          </div>
          {pipelineChartData.length === 0 ? (
            <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>
              No candidates assigned yet. Pipeline analytics will populate automatically after assignment.
            </div>
          ) : (
            <div style={{ position: 'relative', zIndex: 2 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={pipelineChartData}
                  margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
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
                    content={<RecChartTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    name="Candidates"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={1000}
                  >
                    {pipelineChartData.map((entry, idx) => (
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

      <div className="client-grid-2">
        {/* Upcoming Events Box */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="panel-header-flex" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
            <h3 className="panel-title" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>📅 Upcoming Calendar (Next 7 Days)</h3>
            <button
              className="cv-action-btn secondary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              onClick={() => onNavigate("calendar")}
            >
              View All →
            </button>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            {dashboard.upcomingEvents?.length ? (
              <div className="cand-table-wrap">
                <table className="cand-light-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.upcomingEvents.map((ev) => (
                      <tr key={ev.id} className="table-row-hover">
                        <td>
                          <strong style={{ color: "#0f172a", fontWeight: "900" }}>{ev.title}</strong>
                        </td>
                        <td>
                          <span className="type-pill">{ev.eventType}</span>
                        </td>
                        <td className="date-text">{fmtDateTime(ev.startAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cand-empty-state">
                Nothing scheduled for this week.
              </div>
            )}
          </div>
          <div className="card-glow-bar"></div>
        </div>

        {/* Open Tasks Box */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="panel-header-flex" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
            <h3 className="panel-title" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>📝 Open Recruiter Tasks</h3>
            <button
              className="cv-action-btn secondary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              onClick={() => onNavigate("tasks")}
            >
              Manage →
            </button>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            {dashboard.recentTasks?.length ? (
              <div className="cand-table-wrap">
                <table className="cand-light-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Priority</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentTasks.map((t) => (
                      <tr key={t.id} className="table-row-hover">
                        <td>
                          <strong style={{ color: "#0f172a", fontWeight: "900" }}>{t.title}</strong>
                        </td>
                        <td>
                          <span className={`priority-pill prio-${t.priority}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="date-text">{fmtDate(t.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cand-empty-state">No open tasks currently.</div>
            )}
          </div>
          <div className="card-glow-bar"></div>
        </div>
      </div>

      {/* Recently Updated Candidates Box */}
      <div className="cand-card-3d" style={{ marginTop: "28px" }}>
        <div className="card-bg-light-glow"></div>
        <div className="panel-header-flex" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
          <h3 className="panel-title" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>👥 Recently Updated Candidates</h3>
          <button
            className="cv-action-btn secondary"
            style={{ padding: "6px 12px", fontSize: "12px" }}
            onClick={() => onNavigate("candidates")}
          >
            View Database →
          </button>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {dashboard.recentCandidates?.length ? (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Phone</th>
                    <th>Pipeline Stage</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentCandidates.map((c) => (
                    <tr key={c.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>
                          {c.firstName} {c.lastName}
                        </strong>
                      </td>
                      <td className="date-text">{c.phone || "—"}</td>
                      <td>
                        <span className="stage-pill-badge">
                          {c.pipelineStage}
                        </span>
                      </td>
                      <td className="date-text">{fmtDate(c.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="cand-empty-state">No candidates assigned yet.</div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>
    </div>
  );
};

// ===================== ASSIGNED JOBS =====================
const AssignedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.recruiterWorkspace.getJobs().then((res) => {
      if (res?.success) setJobs(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredJobs = jobs.filter(
    (j) =>
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.client?.name &&
        j.client.name.toLowerCase().includes(search.toLowerCase())),
  );

  if (loading)
    return (
      <div className="cand-loading-state">
        <span className="cand-loader"></span> Loading assigned jobs...
      </div>
    );

  return (
    <div>
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", maxWidth: "400px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="rec-search-input"
            placeholder="Search assigned jobs by title or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="cv-action-btn secondary" onClick={load} style={{ position: 'relative', zIndex: 2 }}>
          🔄 Refresh
        </button>
        <div className="card-glow-bar"></div>
      </div>

      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {!filteredJobs.length ? (
            <div className="cand-empty-state">💼 No assigned jobs found.</div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Client Account</th>
                    <th>Positions</th>
                    <th>Filled</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Target Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((j) => (
                    <tr key={j.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>{j.title}</strong>
                      </td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{j.client?.name || "—"}</td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{j.positions}</td>
                      <td>
                        <span className="filled-count-tag">
                          {j.positionsFilled}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-pill prio-${j.priority}`}>
                          {j.priority}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge-pill">{j.status}</span>
                      </td>
                      <td className="date-text">{fmtDate(j.targetDate)}</td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() =>
                              alert(`Viewing pipeline or details for: ${j.title}`)
                            }
                          >
                            👁️ View
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
    </div>
  );
};

// ===================== ASSIGNED CANDIDATES =====================
const AssignedCandidates = ({ onLogActivity }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.recruiterWorkspace
      .getCandidates(search ? { search } : {})
      .then((res) => {
        if (res?.success) setCandidates(res.data);
        setLoading(false);
      });
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", maxWidth: "400px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="rec-search-input"
            placeholder="Search assigned candidates by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="cv-action-btn secondary" onClick={load} style={{ position: 'relative', zIndex: 2 }}>
          🔄 Refresh
        </button>
        <div className="card-glow-bar"></div>
      </div>

      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading candidates...
            </div>
          ) : !candidates.length ? (
            <div className="cand-empty-state">
              No candidates assigned to you yet.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Phone</th>
                    <th>Pipeline Stage</th>
                    <th>Experience</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>
                          {c.firstName} {c.lastName}
                        </strong>
                      </td>
                      <td className="date-text">{c.phone || "—"}</td>
                      <td>
                        <span className="stage-pill-badge">
                          {c.pipelineStage}
                        </span>
                      </td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{c.experience ?? 0} Years</td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="cv-action-btn primary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => onLogActivity(c)}
                          >
                            ⚡ Log Activity ✨
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
    </div>
  );
};

// ===================== LOG ACTIVITY MODAL =====================
const LogActivityModal = ({ candidate, onClose, onSaved }) => {
  const [form, setForm] = useState({
    type: "call",
    outcome: "",
    notes: "",
    durationMinutes: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await api.recruiterWorkspace.logActivity({
      candidateId: candidate.id,
      type: form.type,
      outcome: form.outcome || undefined,
      notes: form.notes || undefined,
      durationMinutes: form.durationMinutes
        ? Number(form.durationMinutes)
        : undefined,
    });
    setSaving(false);
    if (res?.success) onSaved();
  };

  return (
    <div className="modal-overlay-light" onClick={onClose}>
      <div
        className="modal-card-light animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "540px", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
      >
        <div className="drawer-header-3d">
          <div>
            <h2>
              ⚡ Log Activity — {candidate.firstName} {candidate.lastName}
            </h2>
            <p className="drawer-subtext">Record call notes, interview outcomes or updates</p>
          </div>
          <button className="close-drawer-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={submit} className="drawer-scroll-body">
          <div className="input-group-3d">
            <label>Activity Type</label>
            <select
              className="cand-input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="call">Call</option>
              <option value="interview">Interview</option>
              <option value="join">Join</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="note">Note</option>
            </select>
          </div>

          <div className="input-group-3d">
            <label>Outcome</label>
            <select
              className="cand-input"
              value={form.outcome}
              onChange={(e) => setForm({ ...form, outcome: e.target.value })}
            >
              <option value="">— Select Outcome —</option>
              <option value="connected">Connected</option>
              <option value="no-answer">No Answer</option>
              <option value="interested">Interested</option>
              <option value="not-interested">Not Interested</option>
              <option value="callback-requested">Callback Requested</option>
              <option value="scheduled">Scheduled</option>
              <option value="cleared">Cleared</option>
              <option value="rejected">Rejected</option>
              <option value="offer-released">Offer Released</option>
              <option value="joined">Joined</option>
              <option value="other">Other</option>
            </select>
          </div>

          {(form.type === "call" || form.type === "interview") && (
            <div className="input-group-3d">
              <label>Duration (Minutes)</label>
              <input
                type="number"
                min="0"
                className="cand-input"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: e.target.value })
                }
                placeholder="15"
              />
            </div>
          )}

          <div className="input-group-3d">
            <label>Notes &amp; Summary</label>
            <textarea
              rows={3}
              className="cand-input"
              style={{ resize: "vertical" }}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Discussion details..."
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              type="submit"
              className="cv-action-btn primary glow-btn"
              disabled={saving}
              style={{ flex: 1, justifyContent: "center" }}
            >
              {saving ? "Saving..." : "Save Activity Log ✨"}
            </button>
            <button
              type="button"
              className="cv-action-btn secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================== TASKS =====================
const emptyTask = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  relatedType: "general",
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyTask);
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const load = () => {
    setLoading(true);
    api.recruiterWorkspace.getTasks().then((res) => {
      if (res?.success) setTasks(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditingTaskId(null);
    setForm(emptyTask);
    setShowForm(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      relatedType: task.relatedType || "general",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let res;
    if (editingTaskId) {
      res = await api.recruiterWorkspace.updateTask(editingTaskId, form);
    } else {
      res = await api.recruiterWorkspace.createTask(form);
    }
    if (res?.success) {
      if (editingTaskId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTaskId ? { ...t, ...res.data } : t)),
        );
      } else {
        setTasks((prev) => [res.data, ...prev]);
      }
      setForm(emptyTask);
      setShowForm(false);
      setEditingTaskId(null);
      load();
    }
  };

  const handleStatusChange = async (id, status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    await api.recruiterWorkspace.updateTask(id, { status });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await api.recruiterWorkspace.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <button
          className="cv-action-btn primary glow-btn"
          onClick={() => (showForm ? setShowForm(false) : openCreateModal())}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <span>{showForm ? "Cancel Form" : "+ New Task ✨"}</span>
        </button>
        <div className="card-glow-bar"></div>
      </div>

      {showForm && (
        <div className="modal-overlay-light" onClick={() => setShowForm(false)}>
          <div
            className="modal-card-light animate-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "750px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>
                  {editingTaskId
                    ? "✨ Edit Recruiter Task"
                    : "✨ Create New Recruiter Task"}
                </h2>
                <p className="drawer-subtext">Fill in the task details below</p>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="drawer-scroll-body">
              <div className="task-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="input-group-3d full-width" style={{ gridColumn: "span 2" }}>
                  <label>Task Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Follow up with shortlisted candidate"
                    required
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d full-width" style={{ gridColumn: "span 2" }}>
                  <label>Description</label>
                  <textarea
                    rows={2}
                    className="cand-input"
                    style={{ resize: "vertical" }}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Add task notes..."
                  />
                </div>
                <div className="input-group-3d">
                  <label>Priority</label>
                  <select
                    className="cand-input"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Related Entity</label>
                  <select
                    className="cand-input"
                    value={form.relatedType}
                    onChange={(e) =>
                      setForm({ ...form, relatedType: e.target.value })
                    }
                  >
                    <option value="general">General</option>
                    <option value="candidate">Candidate</option>
                    <option value="client">Client</option>
                    <option value="job">Job</option>
                  </select>
                </div>
                <div className="input-group-3d full-width" style={{ gridColumn: "span 2" }}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="cand-input"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="full-width task-form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="cv-action-btn secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="cv-action-btn primary glow-btn">
                  {editingTaskId ? "Save Changes ✨" : "Save Task ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading tasks...
            </div>
          ) : !tasks.length ? (
            <div className="cand-empty-state">No tasks created yet.</div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Related Type</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>{t.title}</strong>
                        {t.description && (
                          <div className="sub-text">{t.description}</div>
                        )}
                      </td>
                      <td>
                        <span className="type-pill">{t.relatedType}</span>
                      </td>
                      <td>
                        <span className={`priority-pill prio-${t.priority}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="date-text">{fmtDate(t.dueDate)}</td>
                      <td>
                        <select
                          className="cand-table-select"
                          value={t.status}
                          onChange={(e) =>
                            handleStatusChange(t.id, e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => openEditModal(t)}
                          >
                            Edit
                          </button>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                            onClick={() => handleDelete(t.id)}
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
    </div>
  );
};

// ===================== CALENDAR =====================
const emptyEvent = {
  title: "",
  description: "",
  eventType: "meeting",
  startAt: "",
  endAt: "",
  location: "",
  interviewMode: "",
  interviewRound: "",
  relatedType: "general",
  relatedId: "",
};

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyEvent);
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [activeMeeting, setActiveMeeting] = useState(null);

  const load = () => {
    setLoading(true);
    api.recruiterWorkspace.getCalendarEvents().then((res) => {
      if (res?.success) setEvents(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditingEventId(null);
    setForm(emptyEvent);
    setShowForm(true);
  };

  const openEditModal = (ev) => {
    setEditingEventId(ev.id);
    setForm({
      title: ev.title || "",
      description: ev.description || "",
      eventType: ev.eventType || "meeting",
      startAt: ev.startAt ? ev.startAt.slice(0, 16) : "",
      endAt: ev.endAt ? ev.endAt.slice(0, 16) : "",
      location: ev.location || "",
      interviewMode: ev.interviewMode || "",
      interviewRound: ev.interviewRound || "",
      relatedType: ev.relatedType || "general",
      relatedId: ev.relatedId || "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.eventType !== "interview") {
      delete payload.interviewMode;
      delete payload.interviewRound;
    } else if (!payload.interviewMode) {
      payload.interviewMode = "video";
    }
    if (payload.relatedType !== "candidate" || !payload.relatedId) {
      delete payload.relatedId;
      if (payload.relatedType === "candidate") payload.relatedType = "general";
    } else {
      payload.relatedId = Number(payload.relatedId);
    }

    let res;
    if (editingEventId) {
      res = await api.recruiterWorkspace.updateCalendarEvent(
        editingEventId,
        payload,
      );
    } else {
      res = await api.recruiterWorkspace.createCalendarEvent(payload);
    }

    if (res?.success) {
      if (editingEventId) {
        setEvents((prev) =>
          prev
            .map((ev) =>
              ev.id === editingEventId ? { ...ev, ...res.data } : ev,
            )
            .sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
        );
      } else {
        setEvents((prev) =>
          [...prev, res.data].sort(
            (a, b) => new Date(a.startAt) - new Date(b.startAt),
          ),
        );
      }
      setForm(emptyEvent);
      setShowForm(false);
      setEditingEventId(null);
      load();
    }
  };

  const handleStatusChange = async (id, status) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, status } : ev)),
    );
    await api.recruiterWorkspace.updateCalendarEvent(id, { status });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await api.recruiterWorkspace.deleteCalendarEvent(id);
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  return (
    <div>
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <button
          className="cv-action-btn primary glow-btn"
          onClick={() => (showForm ? setShowForm(false) : openCreateModal())}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <span>{showForm ? "Cancel Form" : "+ New Event ✨"}</span>
        </button>
        <div className="card-glow-bar"></div>
      </div>

      {showForm && (
        <div className="modal-overlay-light" onClick={() => setShowForm(false)}>
          <div
            className="modal-card-light animate-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>
                  {editingEventId
                    ? "📅 Edit Calendar Event"
                    : "📅 Schedule Calendar Event"}
                </h2>
                <p className="drawer-subtext">Fill in the event schedule below</p>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="drawer-scroll-body">
              <div className="task-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="input-group-3d full-width" style={{ gridColumn: "span 2" }}>
                  <label>Event Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Client Interview with Candidate"
                    required
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Event Type</label>
                  <select
                    className="cand-input"
                    value={form.eventType}
                    onChange={(e) =>
                      setForm({ ...form, eventType: e.target.value })
                    }
                  >
                    <option value="meeting">Meeting</option>
                    <option value="interview">Interview</option>
                    <option value="call">Call</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Location / Link</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Google Meet / Room 302"
                    className="cand-input"
                  />
                </div>
                {form.eventType === "interview" && (
                  <>
                    <div className="input-group-3d">
                      <label>Interview Mode</label>
                      <select
                        className="cand-input"
                        value={form.interviewMode}
                        onChange={(e) =>
                          setForm({ ...form, interviewMode: e.target.value })
                        }
                      >
                        <option value="video">🎥 Video (auto-generated link)</option>
                        <option value="phone">📞 Phone</option>
                        <option value="onsite">🏢 Onsite</option>
                      </select>
                    </div>
                    <div className="input-group-3d">
                      <label>Interview Round</label>
                      <input
                        value={form.interviewRound}
                        onChange={(e) =>
                          setForm({ ...form, interviewRound: e.target.value })
                        }
                        placeholder="HR Round / Technical Round 1"
                        className="cand-input"
                      />
                    </div>
                    <div className="input-group-3d">
                      <label>Link to Candidate</label>
                      <select
                        className="cand-input"
                        value={form.relatedType}
                        onChange={(e) =>
                          setForm({ ...form, relatedType: e.target.value })
                        }
                      >
                        <option value="general">Not linked (general)</option>
                        <option value="candidate">Link to a Candidate ID</option>
                      </select>
                    </div>
                    {form.relatedType === "candidate" && (
                      <div className="input-group-3d">
                        <label>Candidate ID *</label>
                        <input
                          value={form.relatedId}
                          onChange={(e) =>
                            setForm({ ...form, relatedId: e.target.value })
                          }
                          placeholder="e.g. 42 (from Candidates page)"
                          className="cand-input"
                        />
                      </div>
                    )}
                  </>
                )}
                <div className="input-group-3d">
                  <label>Start Time *</label>
                  <input
                    type="datetime-local"
                    className="cand-input"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group-3d">
                  <label>End Time</label>
                  <input
                    type="datetime-local"
                    className="cand-input"
                    value={form.endAt}
                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  />
                </div>
                <div className="input-group-3d full-width" style={{ gridColumn: "span 2" }}>
                  <label>Description</label>
                  <textarea
                    rows={2}
                    className="cand-input"
                    style={{ resize: "vertical" }}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="full-width task-form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="cv-action-btn secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="cv-action-btn primary glow-btn">
                  {editingEventId ? "Save Changes ✨" : "Create Event ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading calendar events...
            </div>
          ) : !events.length ? (
            <div className="cand-empty-state">No events scheduled.</div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Type</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>{ev.title}</strong>
                      </td>
                      <td>
                        <span className="type-pill">{ev.eventType}</span>
                      </td>
                      <td className="date-text">{fmtDateTime(ev.startAt)}</td>
                      <td className="date-text">
                        {ev.endAt ? fmtDateTime(ev.endAt) : "—"}
                      </td>
                      <td>
                        {ev.interviewMode === "video" && ev.meetingLink ? (
                          <button
                            className="cv-action-btn primary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => setActiveMeeting(ev)}
                          >
                            🎥 Join
                          </button>
                        ) : (
                          ev.location || "—"
                        )}
                      </td>
                      <td>
                        <select
                          className="cand-table-select"
                          value={ev.status}
                          onChange={(e) =>
                            handleStatusChange(ev.id, e.target.value)
                          }
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => openEditModal(ev)}
                          >
                            Edit
                          </button>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                            onClick={() => handleDelete(ev.id)}
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

      {activeMeeting && (
        <MeetingRoom
          meetingLink={activeMeeting.meetingLink}
          displayName={user?.name || "Interviewer"}
          onClose={() => setActiveMeeting(null)}
        />
      )}
    </div>
  );
};

// ===================== REMINDERS =====================
const emptyReminder = { title: "", description: "", startAt: "" };

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyReminder);
  const [showForm, setShowForm] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);

  const load = () => {
    setLoading(true);
    api.recruiterWorkspace.getReminders().then((res) => {
      if (res?.success) setReminders(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditingReminderId(null);
    setForm(emptyReminder);
    setShowForm(true);
  };

  const openEditModal = (r) => {
    setEditingReminderId(r.id);
    setForm({
      title: r.title || "",
      description: r.description || "",
      startAt: r.startAt ? r.startAt.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let res;
    if (editingReminderId) {
      res = await api.recruiterWorkspace.updateReminder(
        editingReminderId,
        form,
      );
    } else {
      res = await api.recruiterWorkspace.createReminder(form);
    }

    if (res?.success) {
      if (editingReminderId) {
        setReminders((prev) =>
          prev
            .map((r) =>
              r.id === editingReminderId ? { ...r, ...res.data } : r,
            )
            .sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
        );
      } else {
        setReminders((prev) =>
          [...prev, res.data].sort(
            (a, b) => new Date(a.startAt) - new Date(b.startAt),
          ),
        );
      }
      setForm(emptyReminder);
      setShowForm(false);
      setEditingReminderId(null);
      load();
    }
  };

  const handleComplete = async (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r)),
    );
    await api.recruiterWorkspace.updateReminder(id, { status: "completed" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    await api.recruiterWorkspace.deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <button
          className="cv-action-btn primary glow-btn"
          onClick={() => (showForm ? setShowForm(false) : openCreateModal())}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <span>{showForm ? "Cancel Form" : "+ New Reminder ✨"}</span>
        </button>
        <div className="card-glow-bar"></div>
      </div>

      {showForm && (
        <div className="modal-overlay-light" onClick={() => setShowForm(false)}>
          <div
            className="modal-card-light animate-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>
                  {editingReminderId ? "⏰ Edit Reminder" : "⏰ Set New Reminder"}
                </h2>
                <p className="drawer-subtext">Fill in the reminder details below</p>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="drawer-scroll-body">
              <div className="task-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="input-group-3d full-width" style={{ gridColumn: "span 2" }}>
                  <label>Reminder Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Send contract to client"
                    required
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d full-width" style={{ gridColumn: "span 2" }}>
                  <label>Remind At *</label>
                  <input
                    type="datetime-local"
                    className="cand-input"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group-3d full-width" style={{ gridColumn: "span 2" }}>
                  <label>Notes / Description</label>
                  <textarea
                    rows={2}
                    className="cand-input"
                    style={{ resize: "vertical" }}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="full-width task-form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="cv-action-btn secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="cv-action-btn primary glow-btn">
                  {editingReminderId ? "Save Changes ✨" : "Create Reminder ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading reminders...
            </div>
          ) : !reminders.length ? (
            <div className="cand-empty-state">No reminders set.</div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Reminder Title &amp; Notes</th>
                    <th>Remind At</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((r) => (
                    <tr key={r.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>{r.title}</strong>
                        {r.description && (
                          <div className="sub-text">{r.description}</div>
                        )}
                      </td>
                      <td className="date-text">{fmtDateTime(r.startAt)}</td>
                      <td>
                        <span className={`status-badge-pill st-${r.status}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          {r.status !== "completed" && (
                            <button
                              className="cv-action-btn primary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              onClick={() => handleComplete(r.id)}
                            >
                              Mark Done
                            </button>
                          )}
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => openEditModal(r)}
                          >
                            Edit
                          </button>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                            onClick={() => handleDelete(r.id)}
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
    </div>
  );
};

// ===================== PERFORMANCE =====================
const Performance = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ from: "", to: "" });

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (range.from) params.from = range.from;
    if (range.to) params.to = range.to;
    api.recruiterWorkspace.getPerformance(params).then((res) => {
      if (res?.success) setStats(res.data);
      setLoading(false);
    });
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    { key: "calls", label: "Total Calls", glow: "#0284c7" },
    { key: "interviews", label: "Interviews Conducted", glow: "#6366f1" },
    { key: "joins", label: "Successful Joins", glow: "#059669" },
    {
      key: "conversionRatio",
      label: "Conversion Ratio",
      suffix: "%",
      glow: "#9333ea",
    },
  ];

  // Activity funnel -> bar chart
  const funnelChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Calls", count: stats.calls || 0, color: "#0284c7" },
      { name: "Interviews", count: stats.interviews || 0, color: "#6366f1" },
      { name: "Joins", count: stats.joins || 0, color: "#059669" },
    ];
  }, [stats]);

  // Conversion split -> pie chart
  const conversionChartData = useMemo(() => {
    if (!stats?.assignedCandidatesCount) return [];
    const joined = stats.joins || 0;
    const remaining = Math.max(stats.assignedCandidatesCount - joined, 0);
    return [
      { name: "Joined", value: joined, color: "#059669" },
      { name: "In Pipeline", value: remaining, color: "#6366f1" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  return (
    <div>
      <div className="cand-card-3d" style={{ marginBottom: "28px" }}>
        <div className="card-bg-light-glow"></div>
        <h3 className="panel-title" style={{ position: 'relative', zIndex: 2, marginBottom: "16px", fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
          ⚡ Filter Performance Date Range
        </h3>
        <div className="perf-filter-row" style={{ position: 'relative', zIndex: 2 }}>
          <div className="input-group-3d">
            <label>From Date</label>
            <input
              type="date"
              className="cand-input"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
            />
          </div>
          <div className="input-group-3d">
            <label>To Date</label>
            <input
              type="date"
              className="cand-input"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
            />
          </div>
          <div className="perf-btn-wrap" style={{ display: "flex", gap: "10px" }}>
            <button className="cv-action-btn primary glow-btn" onClick={load}>
              Apply Filter ✨
            </button>
            {(range.from || range.to) && (
              <button
                className="cv-action-btn secondary"
                onClick={() => setRange({ from: "", to: "" })}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {loading ? (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading recruiter performance metrics...
        </div>
      ) : (
        <>
          <div className="client-stats-grid">
            {cards.map((c) => (
              <div className="cand-stat-card-3d" key={c.key}>
                <div className="card-bg-light-glow"></div>
                <span className="stat-val" style={{ color: c.glow }}>
                  {stats?.[c.key] ?? 0}
                  {c.suffix || ""}
                </span>
                <span className="stat-lbl">{c.label}</span>
                <div
                  className="card-glow-bar"
                  style={{ background: c.glow }}
                ></div>
              </div>
            ))}
          </div>

          {/* Analytics Charts Row with Animations */}
          <div className="client-grid-2" style={{ marginTop: "28px" }}>
            <div className="cand-card-3d">
              <div className="card-bg-light-glow"></div>
              <div className="panel-header-flex" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
                <h3 className="panel-title" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>📈 Recruitment Funnel</h3>
              </div>
              {funnelChartData.every((d) => d.count === 0) ? (
                <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>
                  No activity logged yet for this range.
                </div>
              ) : (
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={funnelChartData}
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
                        content={<RecChartTooltip />}
                      />
                      <Bar
                        dataKey="count"
                        name="Count"
                        radius={[8, 8, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={1000}
                      >
                        {funnelChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="card-glow-bar"></div>
            </div>

            <div className="cand-card-3d">
              <div className="card-bg-light-glow"></div>
              <div className="panel-header-flex" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>
                <h3 className="panel-title" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>🎯 Conversion Split</h3>
              </div>
              {conversionChartData.length === 0 ? (
                <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>
                  No assigned candidates yet — this fills in once candidates are assigned to you.
                </div>
              ) : (
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={conversionChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={1000}
                      >
                        {conversionChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<RecChartTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={30}
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
          </div>
        </>
      )}

      {stats && (
        <div className="cand-card-3d" style={{ marginTop: "24px", padding: "20px 24px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2, fontSize: "13.5px", fontWeight: "700", color: "#334155" }}>
            💡 <strong>Performance Insight:</strong> Calculated based on{" "}
            {stats.assignedCandidatesCount} assigned candidate(s). Conversion Ratio = Joins ÷ Assigned Candidates.
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}
    </div>
  );
};

// ===================== MAIN PAGE =====================
const RecruiterWorkspace = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [activityCandidate, setActivityCandidate] = useState(null);

  const loadDashboard = () => {
    setDashboardLoading(true);
    api.recruiterWorkspace.getDashboard().then((res) => {
      if (res?.success) setDashboard(res.data);
      setDashboardLoading(false);
    });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="light-recruiter-container">
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
      <div className="rec-marquee-banner">
        <div className="rec-marquee-track">
          <span>✨ Recruweb Enterprise Recruiter Workspace &amp; Operations Hub</span>
          <span>•</span>
          <span>🖥️ Assigned Jobs, Candidates, Tasks, Calendar Schedules &amp; Performance Metrics</span>
          <span>•</span>
          <span>⭐ Real-time Activity Logging &amp; Interview Management</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Recruiter Workspace{" "}
            <span className="gradient-text">— Operations Hub</span>
          </h1>
          <p className="cand-subtitle">
            Your assigned jobs, candidates, tasks, calendar schedules &amp; performance metrics
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="cand-tabs-bar" style={{ position: 'relative', zIndex: 2 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`cand-tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Views */}
      <div className="rec-tab-content" style={{ position: 'relative', zIndex: 2 }}>
        {activeTab === "overview" && (
          <Overview
            dashboard={dashboard}
            loading={dashboardLoading}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "jobs" && <AssignedJobs />}
        {activeTab === "candidates" && (
          <AssignedCandidates onLogActivity={(c) => setActivityCandidate(c)} />
        )}
        {activeTab === "tasks" && <Tasks />}
        {activeTab === "calendar" && <Calendar />}
        {activeTab === "reminders" && <Reminders />}
        {activeTab === "performance" && <Performance />}
      </div>

      {/* Log Activity Modal */}
      {activityCandidate && (
        <LogActivityModal
          candidate={activityCandidate}
          onClose={() => setActivityCandidate(null)}
          onSaved={() => {
            setActivityCandidate(null);
            loadDashboard();
          }}
        />
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-recruiter-container {
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
        .rec-marquee-banner {
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

        .rec-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .rec-marquee-track span {
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

        .cand-tab-btn:hover {
          color: #0f172a;
          background: #f1f5f9;
        }

        .cand-tab-btn.active {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
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

        .client-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
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
        }

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
        }

        .sub-text {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 600;
          margin-top: 2px;
        }

        .type-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11px;
          font-weight: 900;
          padding: 4px 11px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
          text-transform: capitalize;
        }

        .priority-pill {
          font-size: 11px;
          font-weight: 900;
          padding: 4px 11px;
          border-radius: 12px;
          text-transform: uppercase;
          border: 1.5px solid;
        }
        .priority-pill.prio-high { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .priority-pill.prio-medium { background: #fef3c7; color: #d97706; border-color: #fde68a; }
        .priority-pill.prio-low { background: #e0f2fe; color: #0284c7; border-color: #bae6fd; }

        .stage-pill-badge {
          background: #f3e8ff;
          color: #9333ea;
          font-size: 11.5px;
          font-weight: 900;
          padding: 4px 11px;
          border-radius: 12px;
          border: 1.5px solid #e9d5ff;
        }

        .status-badge-pill {
          background: #ecfdf5;
          color: #059669;
          font-size: 11.5px;
          font-weight: 900;
          padding: 4px 11px;
          border-radius: 12px;
          border: 1.5px solid #a7f3d0;
          text-transform: capitalize;
        }

        .status-badge-pill.st-completed {
          background: #f1f5f9;
          color: #64748b;
          border-color: #cbd5e1;
        }

        .filled-count-tag {
          font-weight: 900;
          color: #0284c7;
        }

        .rec-search-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
        }

        .action-buttons-group {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .cand-table-select {
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

        .modal-overlay-light {
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

        .modal-card-light {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
          width: 100%;
        }

        .animate-modal {
          animation: modalAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .drawer-header-3d {
          padding: 24px;
          border-bottom: 1.5px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #f8fafc;
        }

        .drawer-header-3d h2, .form-heading {
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

        .drawer-scroll-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: #ffffff;
        }

        .task-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .full-width {
          grid-column: span 2;
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

        @media (max-width: 768px) {
          .client-grid-2 {
            grid-template-columns: 1fr;
          }
          .task-form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RecruiterWorkspace;