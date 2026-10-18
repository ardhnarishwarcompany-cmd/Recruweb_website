import { useEffect, useState, Fragment } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const TABS = [
  { key: "login", label: "🔐 Login History" },
  { key: "activity", label: "📊 Activity Logs" },
  { key: "changes", label: "🔄 Changes Tracking" },
];

const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

const statusBadgeClass = (status) =>
  status === "failed" ? "badge-pill-red" : "badge-pill-green";

const LoginHistoryTable = ({ rows }) => (
  <table className="cand-light-table">
    <thead>
      <tr>
        <th>User Account</th>
        <th>Action Performed</th>
        <th>Status</th>
        <th>IP Address</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r.id} className="table-row-hover">
          <td>
            <strong style={{ color: "#0f172a", fontWeight: "900" }}>{r.userName || r.userEmail || "Unknown"}</strong>
            <div className="sub-email-text" style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", marginTop: "2px" }}>{r.userEmail}</div>
          </td>
          <td style={{ color: "#334155", fontWeight: "700" }}>{r.action.replace(/_/g, " ")}</td>
          <td>
            <span
              className={`audit-badge-pill ${statusBadgeClass(r.status)}`}
              style={{
                background: r.status === "failed" ? "#fef2f2" : "#ecfdf5",
                color: r.status === "failed" ? "#dc2626" : "#059669",
                borderColor: r.status === "failed" ? "#fecaca" : "#a7f3d0",
                fontSize: "11.5px",
                fontWeight: "900",
                padding: "4px 12px",
                borderRadius: "20px",
                border: "1.5px solid",
                textTransform: "capitalize",
                display: "inline-block",
              }}
            >
              {r.status}
            </span>
          </td>
          <td className="code-text" style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: "800" }}>{r.ipAddress || "—"}</td>
          <td className="date-text">{fmt(r.createdAt)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ActivityLogsTable = ({ rows }) => (
  <table className="cand-light-table">
    <thead>
      <tr>
        <th>User Account</th>
        <th>Module</th>
        <th>Action</th>
        <th>Description</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r.id} className="table-row-hover">
          <td>
            <strong style={{ color: "#0f172a", fontWeight: "900" }}>{r.userName || r.userEmail || "System"}</strong>
          </td>
          <td>
            <span className="module-pill" style={{ background: "#e0f2fe", color: "#0284c7", fontSize: "11.5px", fontWeight: "900", padding: "4px 11px", borderRadius: "12px", border: "1.5px solid #bae6fd", display: "inline-block" }}>{r.module}</span>
          </td>
          <td style={{ color: "#334155", fontWeight: "700" }}>{r.action.replace(/_/g, " ")}</td>
          <td className="desc-text" style={{ color: "#334155", fontWeight: "600", maxWidth: "350px" }}>{r.description || "—"}</td>
          <td className="date-text">{fmt(r.createdAt)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ChangesTable = ({ rows, expandedId, onToggle }) => (
  <table className="cand-light-table">
    <thead>
      <tr>
        <th>User Account</th>
        <th>Module</th>
        <th>Target Record</th>
        <th>Action</th>
        <th>Timestamp</th>
        <th>Changes Diff</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <Fragment key={r.id}>
          <tr className="table-row-hover">
            <td>
              <strong style={{ color: "#0f172a", fontWeight: "900" }}>{r.userName || r.userEmail || "System"}</strong>
            </td>
            <td>
              <span className="module-pill" style={{ background: "#e0f2fe", color: "#0284c7", fontSize: "11.5px", fontWeight: "900", padding: "4px 11px", borderRadius: "12px", border: "1.5px solid #bae6fd", display: "inline-block" }}>{r.module}</span>
            </td>
            <td>
              <span className="code-text" style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: "800" }}>
                {r.targetType} {r.targetId ? `#${r.targetId}` : ""}
              </span>
            </td>
            <td style={{ color: "#334155", fontWeight: "700" }}>{r.action.replace(/_/g, " ")}</td>
            <td className="date-text">{fmt(r.createdAt)}</td>
            <td>
              <button
                className="cv-action-btn secondary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => onToggle(r.id)}
              >
                {expandedId === r.id ? "Hide Diff" : "View Diff"}
              </button>
            </td>
          </tr>
          {expandedId === r.id && (
            <tr>
              <td
                colSpan={6}
                style={{ background: "#f1f5f9", padding: "16px", borderBottom: "1.5px solid #cbd5e1" }}
              >
                <div className="diff-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="diff-box" style={{ background: "#ffffff", border: "1.5px solid #fecaca", padding: "14px", borderRadius: "14px" }}>
                    <div className="diff-title red-text" style={{ fontSize: "13px", fontWeight: "900", marginBottom: "8px", color: "#dc2626" }}>❌ Before Change</div>
                    <pre className="json-pre-box" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px", borderRadius: "10px", fontSize: "12px", color: "#334155", fontWeight: "600", overflowX: "auto", margin: 0 }}>
                      {JSON.stringify(r.changes?.before ?? null, null, 2)}
                    </pre>
                  </div>
                  <div className="diff-box" style={{ background: "#ffffff", border: "1.5px solid #a7f3d0", padding: "14px", borderRadius: "14px" }}>
                    <div className="diff-title green-text" style={{ fontSize: "13px", fontWeight: "900", marginBottom: "8px", color: "#059669" }}>✅ After Change</div>
                    <pre className="json-pre-box" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px", borderRadius: "10px", fontSize: "12px", color: "#334155", fontWeight: "600", overflowX: "auto", margin: 0 }}>
                      {JSON.stringify(r.changes?.after ?? null, null, 2)}
                    </pre>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </Fragment>
      ))}
    </tbody>
  </table>
);

const AdminAuditLogs = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const load = (targetPage = 1) => {
    setLoading(true);
    setExpandedId(null);
    const params = { page: targetPage, limit: 25 };
    if (search && activeTab === "activity") params.search = search;

    const call =
      activeTab === "login"
        ? api.auditLogs.getLoginHistory(params)
        : activeTab === "changes"
          ? api.auditLogs.getChanges(params)
          : api.auditLogs.getActivity(params);

    call.then((res) => {
      if (res.success) {
        setRows(res.data);
        setPage(res.page);
        setTotalPages(res.totalPages || 1);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    load(1);
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div className="light-audit-container">
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
      <div className="audit-marquee-banner">
        <div className="audit-marquee-track">
          <span>✨ Recruweb Enterprise Audit Logs &amp; Security Hub</span>
          <span>•</span>
          <span>📜 Track User Login History, Comprehensive Activity Trails &amp; Record Change Diffs</span>
          <span>•</span>
          <span>⭐ Real-time Compliance Monitoring</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Audit Logs{" "}
            <span className="gradient-text">— Security &amp; Activity</span>
          </h1>
          <p className="cand-subtitle">
            Track user login history, comprehensive activity trails, and record change diff tracking.
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

      {/* Glass Panel Content Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {activeTab === "activity" && (
            <form onSubmit={handleSearchSubmit} className="search-filter-row" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <input
                className="cand-input search-input"
                style={{ flex: 1 }}
                placeholder="Search by user, email, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="cv-action-btn secondary">
                Search Logs
              </button>
            </form>
          )}

          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading audit logs...
            </div>
          ) : rows.length === 0 ? (
            <div className="cand-empty-state">No audit records found.</div>
          ) : (
            <div className="cand-table-wrap">
              {activeTab === "login" && <LoginHistoryTable rows={rows} />}
              {activeTab === "activity" && <ActivityLogsTable rows={rows} />}
              {activeTab === "changes" && (
                <ChangesTable
                  rows={rows}
                  expandedId={expandedId}
                  onToggle={(id) =>
                    setExpandedId((cur) => (cur === id ? null : id))
                  }
                />
              )}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="audit-pagination" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px", borderTop: "1.5px solid #e2e8f0", paddingTop: "16px" }}>
              <button
                className="cv-action-btn secondary"
                disabled={page <= 1}
                onClick={() => load(page - 1)}
              >
                ← Previous
              </button>
              <span className="page-indicator" style={{ fontSize: "13.5px", color: "#64748b", fontWeight: "700" }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="cv-action-btn secondary"
                disabled={page >= totalPages}
                onClick={() => load(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-audit-container {
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
        .audit-marquee-banner {
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

        .audit-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .audit-marquee-track span {
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

        .cand-header-3d:hover .card-glow-bar {
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

        .cv-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        @media (max-width: 768px) {
          .diff-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAuditLogs;