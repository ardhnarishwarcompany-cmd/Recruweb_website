import { useEffect, useState, useCallback } from "react";
import { api, API_URL } from "../../utils/api";
import JoiningTrackerStepper from "../../components/JoiningTrackerStepper";
import ScrollIndicator from "../../components/ScrollIndicator";

const STATUSES = [
  "new",
  "reviewed",
  "shortlisted",
  "interview",
  "offered",
  "rejected",
];

const scoreColor = (score) => {
  if (score == null)
    return {
      bg: "#f1f5f9",
      text: "#64748b",
      border: "#cbd5e1",
    };
  if (score >= 70)
    return {
      bg: "#ecfdf5",
      text: "#059669",
      border: "#a7f3d0",
    };
  if (score >= 40)
    return {
      bg: "#fef3c7",
      text: "#d97706",
      border: "#fde68a",
    };
  return {
    bg: "#fef2f2",
    text: "#dc2626",
    border: "#fecaca",
  };
};

const AdminCandidates = () => {
  const [applications, setApplications] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [screeningId, setScreeningId] = useState(null);

  // Glass Toast Alert state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const load = useCallback(() => {
    setLoading(true);
    api.applications
      .getInbox({
        status: statusFilter === "all" ? "" : statusFilter,
        assignedToId: assignedFilter,
        search,
        page,
        limit: 20,
      })
      .then((res) => {
        if (res?.success) {
          setApplications(res.data);
          setTotalPages(res.totalPages || 1);
          setCount(res.count || 0);
        }
        setLoading(false);
      });
  }, [statusFilter, assignedFilter, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.team.getAssignableUsers().then((res) => {
      if (res?.success) setRecruiters(res.data);
    });
  }, []);

  const handleStatusChange = async (id, status) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    const res = await api.applications.updateStatus(id, status);
    if (res?.success) {
      showToast(`Stage updated to ${status.toUpperCase()}`, "success");
      if (selected?.id === id) setSelected(res.data);
    } else {
      showToast("Failed to update status", "error");
    }
  };

  const handleAssign = async (id, userId) => {
    const res = await api.applications.assign(id, userId);
    if (res?.success) {
      setApplications((prev) => prev.map((a) => (a.id === id ? res.data : a)));
      showToast("Recruiter assigned successfully!", "success");
      if (selected?.id === id) setSelected(res.data);
    } else {
      showToast("Failed to assign recruiter", "error");
    }
  };

  const handleScreen = async (id) => {
    setScreeningId(id);
    const res = await api.applications.screen(id);
    if (res?.success) {
      const updated = {
        resumeScore: res.data.score,
        resumeSkills: res.data.skills,
        resumeSummary: res.data.summary,
        screeningMethod: res.data.method,
        screenedAt: new Date().toISOString(),
      };
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      );
      if (selected?.id === id) setSelected((s) => ({ ...s, ...updated }));
      showToast("AI Resume Screening completed!", "success");
    } else {
      showToast(res?.message || "Screening failed", "error");
    }
    setScreeningId(null);
  };

  const openDetail = async (app) => {
    try {
      setSelected(app);
      const res = await api.applications.getById(app.id);
      if (res?.success && res.data) {
        setSelected(res.data);
      }
    } catch (error) {
      console.error("Failed to load candidate details:", error);
    }
  };

  return (
    <div className="light-candidates-container">
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
      <div className="cand-marquee-banner">
        <div className="cand-marquee-track">
          <span>✨ Recruweb Enterprise Candidate Command Center &amp; Inbox</span>
          <span>•</span>
          <span>👥 Real-time AI Resume Screening &amp; Recruitment Pipelines</span>
          <span>•</span>
          <span>⭐ Applicant Tracking System &amp; Recruiter Assignments</span>
        </div>
      </div>

      {/* Glass Toast Notification */}
      {toast.show && (
        <div className={`glass-toast-alert ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" ? "✨" : "⚠️"}
          </span>
          <span className="toast-msg">{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Candidate <span className="gradient-text">Command Center</span>
          </h1>
          <p className="cand-subtitle">
            Managing <strong className="highlight-count">{count}</strong> total
            applicants • Real-time AI screening &amp; recruitment pipelines
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="cand-tabs-bar" style={{ position: 'relative', zIndex: 2 }}>
        <button
          className={`cand-tab-btn${statusFilter === "all" ? " active" : ""}`}
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
        >
          🚀 All Applications
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`cand-tab-btn${statusFilter === s ? " active" : ""}`}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Search & Recruiter Filter Toolbar */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="cand-search-input"
            placeholder="Search by candidate name, email, phone, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-select-wrap" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "0 16px", borderRadius: "12px" }}>
          <span className="filter-icon">👤</span>
          <select
            className="cand-select-dark"
            value={assignedFilter}
            onChange={(e) => {
              setAssignedFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Recruiters</option>
            <option value="unassigned">Unassigned</option>
            {recruiters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Table Card */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Fetching candidates from
              database...
            </div>
          ) : applications.length === 0 ? (
            <div className="cand-empty-state">
              🚫 No candidates found for the selected filters.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Job Applied For</th>
                    <th>Contact Info</th>
                    <th>AI Resume Score</th>
                    <th>Assigned Recruiter</th>
                    <th>Applied Date</th>
                    <th>Current Stage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const scoreMeta = scoreColor(app.resumeScore);
                    return (
                      <tr key={app.id} className="table-row-hover">
                        <td
                          onClick={() => openDetail(app)}
                          className="clickable-name"
                        >
                          <div className="cand-avatar-name">
                            <span className="cand-avatar">
                              {app.firstName
                                ? app.firstName.charAt(0).toUpperCase()
                                : "C"}
                            </span>
                            <div>
                              <strong className="cand-fullname">
                                {app.firstName} {app.lastName}
                              </strong>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="job-title-text">
                            {app.job ? `${app.job.title}` : "—"}
                          </span>
                          {app.job?.company && (
                            <div className="job-company-text">
                              🏢 {app.job.company}
                            </div>
                          )}
                        </td>
                        <td className="contact-cell">
                          <div>✉️ {app.email}</div>
                          <div>📞 {app.phone}</div>
                        </td>
                        <td>
                          {app.resumeScore != null ? (
                            <span
                              className="score-badge-pill"
                              style={{
                                background: scoreMeta.bg,
                                color: scoreMeta.text,
                                borderColor: scoreMeta.border,
                              }}
                            >
                              {Math.round(app.resumeScore)}/100
                            </span>
                          ) : (
                            <span className="unscreened-text">Not screened</span>
                          )}
                          <div>
                            <button
                              className="btn-screen-dark"
                              disabled={!app.resume || screeningId === app.id}
                              onClick={() => handleScreen(app.id)}
                              title={
                                !app.resume
                                  ? "No resume uploaded"
                                  : "Run resume screening"
                              }
                            >
                              {screeningId === app.id
                                ? "Screening..."
                                : app.resumeScore != null
                                  ? "⚡ Re-screen"
                                  : "✨ Screen Resume"}
                            </button>
                          </div>
                        </td>
                        <td>
                          <select
                            className="cand-table-select"
                            value={app.assignedToId || ""}
                            onChange={(e) => handleAssign(app.id, e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {recruiters.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="date-text">
                          {new Date(app.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <select
                            className={`cand-table-select stage-${app.status}`}
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app.id, e.target.value)
                            }
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => openDetail(app)}
                          >
                            View Timeline ↗
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="cand-pagination-bar">
              <button
                className="cand-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <span className="cand-page-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                className="cand-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Candidate Detail Drawer Overlay */}
      {selected && (
        <div className="cand-drawer-overlay" onClick={() => setSelected(null)}>
          <div
            className="cand-glass-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header-3d">
              <div>
                <h2>
                  {selected.firstName} {selected.lastName}
                </h2>
                <p className="drawer-subtext">
                  Applied for:{" "}
                  <strong>
                    {selected.job
                      ? `${selected.job.title} (${selected.job.company})`
                      : "General Application"}
                  </strong>
                </p>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>

            <div className="drawer-scroll-body">
              {/* Profile Overview Card */}
              <div className="drawer-card-section">
                <h4>👤 Profile Details</h4>
                <div className="details-grid-2">
                  <div>
                    <span className="det-label">Email:</span>
                    <span className="det-val">{selected.email || "—"}</span>
                  </div>
                  <div>
                    <span className="det-label">Phone:</span>
                    <span className="det-val">{selected.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="det-label">Experience:</span>
                    <span className="det-val">
                      {selected.experience
                        ? `${selected.experience} Years`
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="det-label">Current Company:</span>
                    <span className="det-val">
                      {selected.currentCompany || "—"}
                    </span>
                  </div>
                </div>
                {selected.resume && (
                  <div style={{ marginTop: "16px" }}>
                    <a
                      href={
                        selected.resume.startsWith("http")
                          ? selected.resume
                          : `${API_URL.replace(/\/api$/, "")}${selected.resume}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download-resume"
                    >
                      📄 Preview / Download Resume ↗
                    </a>
                  </div>
                )}
              </div>

              {/* AI Resume Screening Box */}
              <div className="drawer-card-section glass-highlight-card">
                <h4>✨ AI Resume Screening Result</h4>
                {selected.resumeScore != null ? (
                  <>
                    <div className="ai-score-row">
                      <span>Screening Score:</span>
                      <span
                        className="score-badge-pill"
                        style={{
                          background: scoreColor(selected.resumeScore).bg,
                          color: scoreColor(selected.resumeScore).text,
                          borderColor: scoreColor(selected.resumeScore).border,
                        }}
                      >
                        {Math.round(selected.resumeScore)} / 100
                      </span>
                      <span className="method-tag">
                        (
                        {selected.screeningMethod === "ai+keyword"
                          ? "AI + Keyword"
                          : "Keyword Match"}
                        )
                      </span>
                    </div>

                    {selected.resumeSkills?.length > 0 && (
                      <div className="skills-row-chips">
                        <span className="det-label">Extracted Skills:</span>
                        <div className="chips-flex">
                          {selected.resumeSkills.map((sk, i) => (
                            <span key={i} className="skill-chip">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.resumeSummary && (
                      <div className="summary-quote-box">
                        <p>{selected.resumeSummary}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="no-data-text">
                    Resume has not been AI screened yet.
                  </p>
                )}

                <button
                  className="cv-action-btn primary glow-btn"
                  disabled={!selected.resume || screeningId === selected.id}
                  onClick={() => handleScreen(selected.id)}
                  style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}
                >
                  {screeningId === selected.id
                    ? "Screening in Progress..."
                    : "Run AI Resume Analysis ✨"}
                </button>
              </div>

              {/* Status Tracking Timeline */}
              <div className="drawer-card-section">
                <h4>📜 Status Tracking (Timeline)</h4>

                {Array.isArray(selected?.statusHistory) &&
                selected.statusHistory.length > 0 ? (
                  <div className="timeline-tree">
                    {[...selected.statusHistory].reverse().map((h, idx) => (
                      <div className="timeline-node" key={idx}>
                        <div className="node-dot"></div>

                        <div className="node-content">
                          <div className="node-status">
                            {h?.status || "Status Updated"}
                          </div>

                          {h?.notes && (
                            <div className="node-notes">{h.notes}</div>
                          )}

                          <div className="node-meta">
                            {h?.changedByName || "System"}
                            {" • "}
                            {h?.changedAt
                              ? new Date(h.changedAt).toLocaleString("en-IN")
                              : "Date unavailable"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data-text">
                    No timeline stage changes recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-candidates-container {
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
        .cand-marquee-banner {
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

        .cand-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .cand-marquee-track span {
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

        .highlight-count {
          color: #0284c7;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
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

        /* Glass Toast Alert */
        .glass-toast-alert {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border-radius: 16px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
          color: #0f172a;
          font-weight: 800;
          font-size: 14px;
        }

        .glass-toast-alert.success {
          border-color: #a7f3d0;
          background: #ecfdf5;
          color: #059669;
        }

        .glass-toast-alert.error {
          border-color: #fecaca;
          background: #fef2f2;
          color: #dc2626;
        }

        /* Filter Tabs Bar */
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

        .cand-tabs-bar::-webkit-scrollbar {
          height: 4px;
        }
        .cand-tabs-bar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
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
          text-transform: capitalize;
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

        .cand-search-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
        }

        .cand-select-dark {
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          padding: 10px 0;
        }

        /* Table Glass Panel */
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

        .clickable-name {
          cursor: pointer;
        }

        .cand-avatar-name {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cand-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: white;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .cand-fullname {
          color: #0f172a;
          font-weight: 900;
        }

        .job-title-text {
          font-weight: 900;
          color: #0f172a;
        }

        .job-company-text {
          font-size: 11.5px;
          color: #64748b;
          margin-top: 2px;
          font-weight: 700;
        }

        .contact-cell {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
          line-height: 1.5;
        }

        .score-badge-pill {
          display: inline-block;
          font-size: 12px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 20px;
          border: 1.5px solid;
        }

        .unscreened-text {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          font-style: italic;
        }

        .btn-screen-dark {
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          color: #0284c7;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 6px;
          transition: all 0.2s;
        }

        .btn-screen-dark:hover:not(:disabled) {
          background: #bae6fd;
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

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
        }

        /* Pagination */
        .cand-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1.5px solid #e2e8f0;
        }

        .cand-page-btn {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          padding: 6px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cand-page-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .cand-page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .cand-page-info {
          font-size: 13px;
          color: #64748b;
          font-weight: 700;
        }

        /* Glass Drawer Right */
        .cand-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }

        .cand-glass-drawer {
          width: 100%;
          max-width: 520px;
          height: 100vh;
          background: #ffffff;
          border-left: 1.5px solid #cbd5e1;
          display: flex;
          flex-direction: column;
          box-shadow: -20px 0 60px rgba(15, 23, 42, 0.2);
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

        .glass-highlight-card {
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 8px 25px rgba(2, 132, 199, 0.08);
        }

        .drawer-card-section h4 {
          font-size: 14.5px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 14px;
        }

        .details-grid-2 {
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
          margin-bottom: 2px;
        }

        .det-val {
          font-size: 13.5px;
          color: #0f172a;
          font-weight: 800;
        }

        .btn-download-resume {
          display: inline-block;
          color: #0284c7;
          font-weight: 800;
          font-size: 13px;
          text-decoration: none;
        }

        .btn-download-resume:hover {
          text-decoration: underline;
        }

        .ai-score-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
        }

        .method-tag {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 700;
        }

        .skills-row-chips {
          margin-bottom: 12px;
        }

        .chips-flex {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .skill-chip {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 8px;
          border: 1.5px solid #bae6fd;
        }

        .summary-quote-box {
          background: #f3e8ff;
          border: 1.5px solid #e9d5ff;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          color: #334155;
          font-weight: 700;
        }

        /* Timeline Tree */
        .timeline-tree {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-left: 8px;
        }

        .timeline-node {
          position: relative;
          padding-left: 20px;
          border-left: 2px solid #0284c7;
        }

        .node-dot {
          position: absolute;
          left: -6px;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #0284c7;
          box-shadow: 0 0 10px rgba(2, 132, 199, 0.5);
        }

        .node-status {
          font-size: 13.5px;
          font-weight: 900;
          color: #0f172a;
          text-transform: capitalize;
        }

        .node-notes {
          font-size: 12.5px;
          color: #334155;
          font-weight: 700;
          margin-top: 2px;
        }

        .node-meta {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
          margin-top: 2px;
        }

        .no-data-text {
          font-size: 13px;
          color: #64748b;
          margin: 0;
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
      `}</style>
    </div>
  );
};

export default AdminCandidates;