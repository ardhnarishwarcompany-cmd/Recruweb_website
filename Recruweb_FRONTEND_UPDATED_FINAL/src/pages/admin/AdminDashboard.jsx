import { useEffect, useState, useRef } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Smoothly animates a numeric value from 0 -> target whenever it changes
const AnimatedNumber = ({ value = 0, isCurrency = false }) => {
  const [display, setDisplay] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = display;
    const startTime = performance.now();
    const duration = 900;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (target - start) * eased;
      setDisplay(current);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => frame.current && cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const rounded = Math.round(display);
  return (
    <>
      {isCurrency ? formatCurrency(rounded) : rounded.toLocaleString("en-IN")}
    </>
  );
};

const quickActions = [
  { to: "/admin/jobs", label: "Post a Job", icon: "💼", badge: "New" },
  { to: "/admin/candidates", label: "Candidates", icon: "👥" },
  { to: "/admin/invoices", label: "Invoices", icon: "🧾" },
  { to: "/admin/tasks", label: "Tasks", icon: "⏳", highlight: true },
];

const statCards = [
  {
    key: "activeJobs",
    label: "Active Jobs",
    icon: "💼",
    color: "#0284c7",
    trend: "+12%",
  },
  {
    key: "totalApplications",
    label: "Applied Candidates",
    icon: "👥",
    color: "#9333ea",
    trend: "+18%",
  },
  {
    key: "totalClientInquiries",
    label: "Client Inquiries",
    icon: "🏢",
    color: "#4f46e5",
    trend: "+5%",
  },
  {
    key: "totalJoinings",
    label: "New Joiners",
    icon: "🎯",
    color: "#059669",
    trend: "+24%",
  },
  {
    key: "totalCompanies",
    label: "Companies",
    icon: "🏬",
    color: "#d97706",
    trend: "+8%",
  },
  {
    key: "totalContacts",
    label: "Contact Messages",
    icon: "✉️",
    color: "#db2777",
    trend: "+2%",
  },
  {
    key: "totalSubscribers",
    label: "Subscribers",
    icon: "📬",
    color: "#0d9488",
    trend: "+15%",
  },
  {
    key: "pendingTasks",
    label: "Pending Tasks",
    icon: "⏳",
    color: "#dc2626",
    trend: "-3%",
  },
];

const pipelineLabels = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  rejected: "Rejected",
};

const PIPELINE_COLORS = {
  new: "#0284c7",
  reviewed: "#6366f1",
  shortlisted: "#9333ea",
  interview: "#d97706",
  offered: "#059669",
  rejected: "#dc2626",
};

const SUPER_ADMIN_ROLES = ["superadmin", "admin"];

const superAdminStatCards = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: "🌐",
    color: "#4f46e5",
    trend: "+14%",
  },
  {
    key: "totalCandidates",
    label: "Candidates",
    icon: "👨‍💼",
    color: "#0284c7",
    trend: "+22%",
  },
  {
    key: "totalClients",
    label: "Clients",
    icon: "🤝",
    color: "#9333ea",
    trend: "+9%",
  },
  {
    key: "totalJobs",
    label: "Total Jobs",
    icon: "📌",
    color: "#d97706",
    trend: "+11%",
  },
  {
    key: "revenue",
    label: "Revenue",
    isCurrency: true,
    icon: "💰",
    color: "#059669",
    trend: "+32%",
  },
  {
    key: "activeRecruiters",
    label: "Active Recruiters",
    icon: "⚡",
    color: "#db2777",
    trend: "+4%",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const AdminDashboard = () => {
  const { user } = useOutletContext() || {};
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [superStats, setSuperStats] = useState(null);
  const [superLoading, setSuperLoading] = useState(true);
  const [sopStats, setSopStats] = useState(null);

  const isSuperAdmin = user && SUPER_ADMIN_ROLES.includes(user.role);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    api.analytics
      .getDashboard()
      .then((res) => {
        if (res?.success) setStats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.sops.getStats().then((res) => {
      if (res?.success) setSopStats(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) {
      setSuperLoading(false);
      return;
    }
    api.analytics
      .getSuperAdminStats()
      .then((res) => {
        if (res?.success) setSuperStats(res.data);
        setSuperLoading(false);
      })
      .catch(() => setSuperLoading(false));
  }, [isSuperAdmin]);

  const pipelineChartData = stats?.pipelineCounts
    ? Object.entries(stats.pipelineCounts).map(([key, value]) => ({
        name: pipelineLabels[key] || key,
        value: value,
        color: PIPELINE_COLORS[key] || "#9333ea",
      }))
    : [
        { name: "New", value: 42, color: "#0284c7" },
        { name: "Reviewed", value: 28, color: "#6366f1" },
        { name: "Shortlisted", value: 18, color: "#9333ea" },
        { name: "Interview", value: 12, color: "#d97706" },
        { name: "Offered", value: 8, color: "#059669" },
        { name: "Rejected", value: 5, color: "#dc2626" },
      ];

  return (
    <div className="light-admin-dashboard">
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
      <div className="admin-dash-marquee-banner">
        <div className="admin-dash-marquee-track">
          <span>✨ Recruweb Enterprise Executive Command Center &amp; Analytics Hub</span>
          <span>•</span>
          <span>📊 Real-time Platform Telemetry, ATS Pipeline &amp; Financial Ledger</span>
          <span>•</span>
          <span>⭐ Global Ecosystem Growth &amp; Recruiter Performance Tracking</span>
        </div>
      </div>

      {/* Styled Policy Center / SOP Dashboard Card */}
      <div className="cand-card-3d" style={{ marginBottom: "24px", padding: "24px 32px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #0284c7, #6366f1)", borderRadius: "14px", display: "grid", placeItems: "center", fontSize: "24px", color: "#fff", boxShadow: "0 4px 15px rgba(2, 132, 199, 0.3)" }}>📘</div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "900", color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.5px" }}>Policy Center</span>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "2px 0 4px" }}>SOPs &amp; Operating Procedures</h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "600" }}>Access every approved SOP, open the full process instantly, and keep your policy approvals in one place.</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ background: "#f1f5f9", border: "1.5px solid #cbd5e1", padding: "8px 14px", borderRadius: "12px", textAlign: "center" }}>
              <strong style={{ display: "block", fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>{sopStats?.published ?? 0}</strong>
              <small style={{ fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Live SOPs</small>
            </div>
            <div style={{ background: "#f1f5f9", border: "1.5px solid #cbd5e1", padding: "8px 14px", borderRadius: "12px", textAlign: "center" }}>
              <strong style={{ display: "block", fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>{sopStats?.pendingInbox ?? sopStats?.pendingApproval ?? 0}</strong>
              <small style={{ fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Inbox Actions</small>
            </div>
            <Link to="/admin/sops" className="cv-action-btn secondary" style={{ textDecoration: "none", fontSize: "13px" }}>
              View all SOPs →
            </Link>
            <Link to="/admin/sop-inbox" className="cv-action-btn primary glow-btn" style={{ textDecoration: "none", fontSize: "13px" }}>
              Open SOP Inbox →
            </Link>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Top Header */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p className="dash-greeting">
              <span>
                {greeting}
                {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </span>
              <span className="dash-wave">👋</span>
              <span className="dash-date-badge">{todayLabel}</span>
            </p>
            <h1 className="cand-title">
              Executive <span className="gradient-text">Command Center</span>
            </h1>
            <p className="cand-subtitle">
              Real-time platform telemetry, candidate ATS pipeline metrics &amp; financial overview.
            </p>
          </div>
          <div className="dash-role-badge">
            <span className="live-pulse"></span>
            <span>
              Access Level:{" "}
              <strong className="role-highlight">
                {user?.role || "superadmin"}
              </strong>
            </span>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-row" style={{ position: 'relative', zIndex: 2 }}>
        {quickActions.map((action) => (
          <Link
            to={action.to}
            key={action.to}
            className={`quick-action-chip ${action.highlight ? "highlight-chip" : ""}`}
          >
            <span className="quick-action-icon-wrapper">{action.icon}</span>
            <span className="quick-action-label">{action.label}</span>
            {action.badge && (
              <span className="quick-badge">{action.badge}</span>
            )}
            <span className="quick-action-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Super Admin Section */}
      {isSuperAdmin && (
        <div className="cand-card-3d super-panel" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="panel-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div className="panel-title-row" style={{ display: "flex", alignItems: "center", gap: "14px", margin: 0 }}>
                <div className="title-icon-wrapper crown-bg" style={{ width: "42px", height: "42px", background: "#fef3c7", border: "1.5px solid #fde68a", borderRadius: "12px", display: "grid", placeItems: "center", fontSize: "20px" }}>👑</div>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 2px" }}>Super Admin Control Hub</h2>
                  <p className="panel-subtitle">Global ecosystem growth &amp; financial ledger</p>
                </div>
              </div>
              <span className="secure-badge">🔒 Secure Channel</span>
            </div>

            {superLoading ? (
              <div className="client-stats-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div className="stat-card-skeleton" key={i}></div>
                ))}
              </div>
            ) : (
              <div className="client-stats-grid">
                {superAdminStatCards.map((card, i) => (
                  <div
                    className="cand-stat-card-3d fade-in-up"
                    key={card.key}
                    style={{
                      "--accent-color": card.color,
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    <div className="card-bg-light-glow"></div>
                    <div className="card-top" style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span
                        className="icon-avatar"
                        style={{
                          background: `${card.color}15`,
                          color: card.color,
                          borderColor: `${card.color}35`,
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "16px",
                          border: "1.5px solid",
                        }}
                      >
                        {card.icon}
                      </span>
                      <span
                        className={`trend-pill ${card.trend.startsWith("+") ? "positive" : "negative"}`}
                      >
                        {card.trend}
                      </span>
                    </div>
                    <div className="card-content-area" style={{ position: 'relative', zIndex: 2 }}>
                      <span className="card-val" style={{ color: card.color }}>
                        <AnimatedNumber
                          value={superStats?.[card.key] ?? 0}
                          isCurrency={card.isCurrency}
                        />
                      </span>
                      <span className="card-lbl">{card.label}</span>
                    </div>
                    <div
                      className="card-glow-bar"
                      style={{ background: card.color }}
                    ></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Executive Analytics — always visible for Super Admin, even when the
          broader dashboard endpoint is still loading. These charts use live
          super-admin counts; the monthly trend below uses the live analytics
          endpoint when available. */}
      {isSuperAdmin && !superLoading && superStats && (
        <div className="cand-card-3d executive-analytics-panel" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="panel-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div className="panel-title-row" style={{ display: "flex", alignItems: "center", gap: "14px", margin: 0 }}>
                <div className="title-icon-wrapper" style={{ width: "42px", height: "42px", background: "#ede9fe", border: "1.5px solid #ddd6fe", borderRadius: "12px", display: "grid", placeItems: "center", fontSize: "20px" }}>📊</div>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 2px" }}>Executive Analytics</h2>
                  <p className="panel-subtitle">Live platform distribution, job activity and financial performance</p>
                </div>
              </div>
              <span className="secure-badge">● LIVE DATA</span>
            </div>

            <div className="client-grid-2" style={{ marginBottom: "22px" }}>
              {/* Workforce / ecosystem distribution */}
              <div className="analytics-mini-card">
                <div className="analytics-mini-heading">
                  <div>
                    <h3>Platform Ecosystem</h3>
                    <p>Current users, candidates, clients and staff</p>
                  </div>
                  <span>👥</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Candidates", value: Number(superStats.totalCandidates) || 0, color: "#0284c7" },
                        { name: "Clients", value: Number(superStats.totalClients) || 0, color: "#9333ea" },
                        { name: "Staff", value: Number(superStats.totalStaff) || 0, color: "#059669" },
                      ].filter((item) => item.value > 0)}
                      cx="50%"
                      cy="46%"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "Candidates", value: Number(superStats.totalCandidates) || 0, color: "#0284c7" },
                        { name: "Clients", value: Number(superStats.totalClients) || 0, color: "#9333ea" },
                        { name: "Staff", value: Number(superStats.totalStaff) || 0, color: "#059669" },
                      ].filter((item) => item.value > 0).map((entry, index) => (
                        <Cell key={`ecosystem-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => Number(value).toLocaleString("en-IN")} />
                    <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Job activity */}
              <div className="analytics-mini-card">
                <div className="analytics-mini-heading">
                  <div>
                    <h3>Job Activity</h3>
                    <p>Live active vs inactive job inventory</p>
                  </div>
                  <span>💼</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      { name: "Active", jobs: Number(superStats.activeJobs) || 0 },
                      { name: "Inactive", jobs: Math.max(0, (Number(superStats.totalJobs) || 0) - (Number(superStats.activeJobs) || 0)) },
                    ]}
                    margin={{ top: 18, right: 15, left: -12, bottom: 5 }}
                  >
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => [Number(value).toLocaleString("en-IN"), "Jobs"]} />
                    <Bar dataKey="jobs" radius={[9, 9, 0, 0]} name="Jobs">
                      <Cell fill="#0284c7" />
                      <Cell fill="#cbd5e1" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="client-grid-2">
              {/* Platform volume */}
              <div className="analytics-mini-card">
                <div className="analytics-mini-heading">
                  <div>
                    <h3>Platform Volume</h3>
                    <p>Live count comparison across core entities</p>
                  </div>
                  <span>📈</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      { name: "Users", value: Number(superStats.totalUsers) || 0 },
                      { name: "Candidates", value: Number(superStats.totalCandidates) || 0 },
                      { name: "Clients", value: Number(superStats.totalClients) || 0 },
                      { name: "Jobs", value: Number(superStats.totalJobs) || 0 },
                      { name: "Recruiters", value: Number(superStats.activeRecruiters) || 0 },
                    ]}
                    margin={{ top: 18, right: 15, left: -12, bottom: 5 }}
                  >
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => Number(value).toLocaleString("en-IN")} />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Financial / activity snapshot */}
              <div className="analytics-mini-card">
                <div className="analytics-mini-heading">
                  <div>
                    <h3>Business Snapshot</h3>
                    <p>Revenue and operational activity at a glance</p>
                  </div>
                  <span>💰</span>
                </div>
                <div className="snapshot-grid">
                  <div className="snapshot-item">
                    <span className="snapshot-icon">💰</span>
                    <div><strong>{formatCurrency(superStats.revenue || 0)}</strong><small>Approved Revenue</small></div>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-icon">⚡</span>
                    <div><strong>{Number(superStats.activeRecruiters || 0).toLocaleString("en-IN")}</strong><small>Active Recruiters</small></div>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-icon">📌</span>
                    <div><strong>{Number(superStats.activeJobs || 0).toLocaleString("en-IN")}</strong><small>Live Jobs</small></div>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-icon">👤</span>
                    <div><strong>{Number(superStats.totalCandidates || 0).toLocaleString("en-IN")}</strong><small>Total Candidates</small></div>
                  </div>
                </div>
                <div className="insight-strip">
                  <span>🤖</span>
                  <div>
                    <strong>Automated Insight</strong>
                    <p>
                      {Number(superStats.totalJobs || 0) > 0
                        ? `${Math.round(((Number(superStats.activeJobs || 0) / Number(superStats.totalJobs || 1)) * 100))}% of all jobs are currently active.`
                        : "No jobs are available yet. Add a vacancy to start tracking hiring activity."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real six-month trend when the full analytics endpoint is available */}
            {stats?.monthlyTrend?.length > 0 && (
              <div className="analytics-mini-card" style={{ marginTop: "22px" }}>
                <div className="analytics-mini-heading">
                  <div>
                    <h3>Six-Month Hiring & Revenue Trend</h3>
                    <p>Applications, jobs and collected revenue from the live analytics endpoint</p>
                  </div>
                  <span>📉</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.monthlyTrend} margin={{ top: 12, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="execAppsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="count" allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="revenue" orientation="right" stroke="#059669" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
                    <Tooltip formatter={(value, name) => name === "Revenue" ? formatCurrency(value) : Number(value).toLocaleString("en-IN")} />
                    <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 700 }} />
                    <Area yAxisId="count" type="monotone" dataKey="applications" stroke="#0284c7" strokeWidth={3} fill="url(#execAppsGradient)" name="Applications" />
                    <Area yAxisId="count" type="monotone" dataKey="jobs" stroke="#6366f1" strokeWidth={3} fill="none" name="Jobs" />
                    <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fill="none" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {loading && (
        <div className="client-stats-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="stat-card-skeleton" key={i}></div>
          ))}
        </div>
      )}

      {stats && (
        <>
          {/* Main Stat Grid */}
          <div className="client-stats-grid">
            {statCards.map((card, i) => (
              <div
                className="cand-stat-card-3d fade-in-up"
                key={card.key}
                style={{
                  "--accent-color": card.color,
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div className="card-bg-light-glow"></div>
                <div className="card-top" style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span
                    className="icon-avatar"
                    style={{
                      background: `${card.color}15`,
                      color: card.color,
                      borderColor: `${card.color}35`,
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "16px",
                      border: "1.5px solid",
                    }}
                  >
                    {card.icon}
                  </span>
                  <span
                    className={`trend-pill ${card.trend.startsWith("+") ? "positive" : "negative"}`}
                  >
                    {card.trend}
                  </span>
                </div>
                <div className="card-content-area" style={{ position: 'relative', zIndex: 2 }}>
                  <span className="card-val" style={{ color: card.color }}>
                    <AnimatedNumber value={stats[card.key] ?? 0} />
                  </span>
                  <span className="card-lbl">{card.label}</span>
                </div>
                <div
                  className="card-glow-bar"
                  style={{ background: card.color }}
                ></div>
              </div>
            ))}
          </div>

          {/* Analytics Graphs Row 1 */}
          <div className="client-grid-2 fade-in-up" style={{ marginBottom: "28px" }}>
            {/* Area Chart: Monthly Platform Growth */}
            <div className="cand-card-3d chart-box">
              <div className="card-bg-light-glow"></div>
              <div className="panel-title-row" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div className="title-icon-wrapper" style={{ width: "40px", height: "40px", background: "#e0f2fe", border: "1.5px solid #bae6fd", borderRadius: "10px", display: "grid", placeItems: "center", fontSize: "18px" }}>📈</div>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: "0 0 2px" }}>Applications &amp; Jobs Growth Trends</h2>
                  <p className="panel-subtitle">Month-over-month platform engagement volume</p>
                </div>
              </div>
              <div className="chart-container-3d" style={{ position: 'relative', zIndex: 2 }}>
                <ResponsiveContainer width="100%" height={310}>
                  <AreaChart
                    data={stats.monthlyTrend || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#0284c7"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0284c7"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="gradJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
                        color: "#0f172a",
                        fontWeight: "700",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stroke="#0284c7"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#gradApps)"
                      name="Applications"
                    />
                    <Area
                      type="monotone"
                      dataKey="jobs"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#gradJobs)"
                      name="Active Jobs"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="card-glow-bar"></div>
            </div>

            {/* Donut Chart: ATS Candidate Pipeline */}
            <div className="cand-card-3d chart-box">
              <div className="card-bg-light-glow"></div>
              <div className="panel-title-row" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div className="title-icon-wrapper" style={{ width: "40px", height: "40px", background: "#f3e8ff", border: "1.5px solid #e9d5ff", borderRadius: "10px", display: "grid", placeItems: "center", fontSize: "18px" }}>📊</div>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: "0 0 2px" }}>ATS Candidate Pipeline</h2>
                  <p className="panel-subtitle">Current stage conversion breakdown</p>
                </div>
              </div>
              <div className="chart-container-3d" style={{ position: 'relative', zIndex: 2 }}>
                <ResponsiveContainer width="100%" height={310}>
                  <PieChart>
                    <Pie
                      data={pipelineChartData}
                      cx="50%"
                      cy="48%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {pipelineChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
                        color: "#0f172a",
                        fontWeight: "700",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "11.5px",
                        color: "#64748b",
                        fontWeight: "700",
                        paddingTop: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card-glow-bar"></div>
            </div>
          </div>

          {/* Revenue Analytics Bar Chart */}
          <div className="cand-card-3d" style={{ marginBottom: "28px" }}>
            <div className="card-bg-light-glow"></div>
            <div className="panel-title-row" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div className="title-icon-wrapper" style={{ width: "40px", height: "40px", background: "#ecfdf5", border: "1.5px solid #a7f3d0", borderRadius: "10px", display: "grid", placeItems: "center", fontSize: "18px" }}>💰</div>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: "0 0 2px" }}>Revenue &amp; Placement Growth</h2>
                <p className="panel-subtitle">Financial realization tracking across active quarters</p>
              </div>
            </div>
            <div className="chart-container-3d" style={{ position: 'relative', zIndex: 2 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stats.monthlyTrend || []}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
                      color: "#0f172a",
                      fontWeight: "700",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#059669"
                    radius={[8, 8, 0, 0]}
                    name="Revenue (₹)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card-glow-bar"></div>
          </div>

          {/* Candidate Pipeline Cards Grid */}
          <div className="cand-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="panel-title-row" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div className="title-icon-wrapper" style={{ width: "40px", height: "40px", background: "#fef3c7", border: "1.5px solid #fde68a", borderRadius: "10px", display: "grid", placeItems: "center", fontSize: "18px" }}>🎯</div>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: "0 0 2px" }}>Pipeline Stage Breakdown</h2>
                <p className="panel-subtitle">Detailed individual metric tiles per interview phase</p>
              </div>
            </div>
            <div className="client-stats-grid" style={{ position: 'relative', zIndex: 2, marginBottom: 0 }}>
              {Object.entries(stats.pipelineCounts || {}).map(
                ([status, count]) => (
                  <div
                    className="cand-stat-card-3d"
                    key={status}
                    style={{ "--accent-color": PIPELINE_COLORS[status] || "#0284c7", padding: "18px 16px" }}
                  >
                    <div className="card-bg-light-glow"></div>
                    <div className="card-content-area" style={{ position: 'relative', zIndex: 2 }}>
                      <span className="card-val" style={{ color: PIPELINE_COLORS[status] || "#0284c7" }}>
                        <AnimatedNumber value={count} />
                      </span>
                      <span className="card-lbl">
                        {pipelineLabels[status] || status}
                      </span>
                    </div>
                    <div
                      className="card-glow-bar"
                      style={{
                        background: PIPELINE_COLORS[status] || "#0284c7",
                      }}
                    ></div>
                  </div>
                ),
              )}
            </div>
            <div className="card-glow-bar"></div>
          </div>
        </>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .executive-analytics-panel {
          overflow: hidden;
        }

        .analytics-mini-card {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #dbe4f0;
          border-radius: 18px;
          padding: 20px;
          min-width: 0;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.035);
        }

        .analytics-mini-card:hover {
          border-color: #bfdbfe;
          box-shadow: 0 14px 32px rgba(79, 70, 229, 0.09);
        }

        .analytics-mini-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }

        .analytics-mini-heading h3 {
          margin: 0 0 4px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 900;
        }

        .analytics-mini-heading p {
          margin: 0;
          color: #64748b;
          font-size: 11.5px;
          font-weight: 600;
        }

        .analytics-mini-heading > span {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          flex: 0 0 auto;
        }

        .snapshot-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .snapshot-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 14px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .snapshot-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          flex: 0 0 auto;
        }

        .snapshot-item strong {
          display: block;
          color: #0f172a;
          font-size: 15px;
          font-weight: 900;
          line-height: 1.2;
        }

        .snapshot-item small {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.35px;
        }

        .insight-strip {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 14px;
          padding: 13px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, #eef2ff, #f5f3ff);
          border: 1px solid #ddd6fe;
        }

        .insight-strip > span {
          font-size: 20px;
          line-height: 1;
        }

        .insight-strip strong {
          display: block;
          color: #4338ca;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .insight-strip p {
          margin: 3px 0 0;
          color: #475569;
          font-size: 11.5px;
          line-height: 1.45;
          font-weight: 600;
        }

        .light-admin-dashboard {
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
        .admin-dash-marquee-banner {
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

        .admin-dash-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .admin-dash-marquee-track span {
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
        .cand-card-3d:hover .card-glow-bar,
        .cand-stat-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .dash-greeting {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 800;
          color: #0284c7;
          margin: 0 0 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dash-wave {
          display: inline-block;
          animation: wave 2s infinite;
          transform-origin: 70% 70%;
        }

        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }

        .dash-date-badge {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          padding: 3px 10px;
          border-radius: 12px;
          color: #475569;
          text-transform: none;
          font-weight: 700;
          font-size: 11.5px;
          margin-left: 6px;
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

        .dash-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 13px;
          color: #334155;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
        }

        .live-pulse {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          box-shadow: 0 0 10px #059669;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(5, 150, 105, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
        }

        .role-highlight {
          color: #9333ea;
          text-transform: capitalize;
        }

        /* Quick Actions Row */
        .quick-actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
        }

        .quick-action-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          padding: 10px 18px;
          border-radius: 14px;
          font-size: 13.5px;
          font-weight: 800;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
          transition: all 0.25s ease;
        }

        .quick-action-chip:hover {
          background: #f1f5f9;
          border-color: #0284c7;
          color: #0f172a;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.15);
        }

        .highlight-chip {
          background: linear-gradient(135deg, #e0f2fe, #ede9fe);
          border-color: #bae6fd;
        }

        .quick-badge {
          background: #0284c7;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .quick-action-arrow {
          opacity: 0.5;
          transform: translateX(-2px);
          transition: all 0.2s ease;
        }

        .quick-action-chip:hover .quick-action-arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        /* Stat Cards Grid */
        .client-stats-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .cand-stat-card-3d {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 22px 20px;
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

        .trend-pill {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 8px;
        }

        .trend-pill.positive {
          background: #ecfdf5;
          color: #059669;
          border: 1.5px solid #a7f3d0;
        }

        .trend-pill.negative {
          background: #fef2f2;
          color: #dc2626;
          border: 1.5px solid #fecaca;
        }

        .card-val {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1.1;
          margin-bottom: 4px;
          display: block;
        }

        .card-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Glassmorphism Panel / Card */
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

        .super-panel {
          border: 1.5px solid #e9d5ff;
          background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%);
        }

        .secure-badge {
          font-size: 12px;
          color: #059669;
          background: #ecfdf5;
          border: 1.5px solid #a7f3d0;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 800;
        }

        .panel-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .client-grid-2 {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        .cv-action-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13.5px;
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
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover {
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

        /* Skeleton loader */
        .stat-card-skeleton {
          height: 120px;
          border-radius: 20px;
          background: linear-gradient(
            100deg,
            #f1f5f9 30%,
            #e2e8f0 50%,
            #f1f5f9 70%
          );
          background-size: 200% 100%;
          animation: shimmer 1.6s ease-in-out infinite;
          border: 1.5px solid #cbd5e1;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1024px) {
          .client-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .light-admin-dashboard {
            padding: 16px;
          }
          .cand-title {
            font-size: 26px;
          }
          .client-stats-grid {
            grid-template-columns: 1fr;
          }
          .quick-actions-row {
            gap: 8px;
          }
          .quick-action-chip {
            flex: 1 1 calc(50% - 6px);
            justify-content: center;
            padding: 10px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;