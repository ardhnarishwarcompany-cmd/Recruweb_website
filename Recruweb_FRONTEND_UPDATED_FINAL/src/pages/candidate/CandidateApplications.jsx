import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const statusMeta = (status) => {
  switch (status) {
    case "offered":
    case "accepted":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
      };
    case "rejected":
    case "withdrawn":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
      };
    case "interview":
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
      };
    default:
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
      };
  }
};

export default function CandidateApplications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerMsg, setOfferMsg] = useState("");

  useEffect(() => {
    api.candidatePortal.getApplications().then((res) => {
      if (res?.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  const downloadOffer = async () => {
    const res = await api.candidatePortal.getOfferLetter();
    if (res?.success) {
      window.open(res.downloadUrl, "_blank");
    } else {
      setOfferMsg(res?.message || "Offer letter not available yet.");
    }
  };

  if (loading)
    return (
      <div className="light-cand-app-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading your applications...
        </div>
      </div>
    );

  const cards = [
    {
      label: "Applied Jobs",
      value: data?.appliedJobs?.length ?? 0,
      color: "#0284c7",
      icon: "📑",
    },
    {
      label: "Interview Status",
      value: data?.interviewStatus || "Not Scheduled",
      color: "#d97706",
      icon: "📅",
    },
    {
      label: "Offer Status",
      value: data?.offerStatus || "Not Released",
      color: "#9333ea",
      icon: "⭐",
    },
    {
      label: "Joining Status",
      value: data?.joiningStatus || "Not Started",
      color: "#059669",
      icon: "⏱️",
    },
  ];

  return (
    <div className="light-cand-app-container">
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

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            My Applications{" "}
            <span className="gradient-text">— Career Portal</span>
          </h1>
          <p className="cand-subtitle">
            Track your job applications, interview schedules, offer statuses, and joining progress.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Stat Cards Grid */}
      <div className="cand-stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="card-top-flex" style={{ position: 'relative', zIndex: 2 }}>
              <span className="card-emoji-icon">{c.icon}</span>
            </div>
            <div className="stat-lbl" style={{ position: 'relative', zIndex: 2 }}>{c.label}</div>
            <div className="stat-val" style={{ color: c.color || "#0f172a", position: 'relative', zIndex: 2 }}>
              {c.value}
            </div>
            <div className="card-glow-bar" style={{ background: c.color }}></div>
          </div>
        ))}
      </div>

      {/* Offer Released Banner Card */}
      {data?.offerStatus === "Offer Released" && (
        <div className="cand-card-3d offer-banner-card" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <div className="offer-banner-content" style={{ position: 'relative', zIndex: 2 }}>
            <div className="offer-icon">🎉</div>
            <div className="offer-info-text">
              <strong>Your official corporate offer has been released!</strong>
              <p>
                Review the compensation package and download your formal offer letter document below.
              </p>
            </div>
            <button
              className="cv-action-btn primary glow-btn"
              style={{ width: "auto", padding: "10px 22px" }}
              onClick={downloadOffer}
            >
              📥 Download Offer Letter
            </button>
          </div>
          {offerMsg && (
            <div className="cand-msg-banner" style={{ marginTop: 12, position: 'relative', zIndex: 2 }}>
              {offerMsg}
            </div>
          )}
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <h3 className="panel-heading" style={{ position: 'relative', zIndex: 2 }}>📑 Applied Job Requisitions</h3>
        {!data?.appliedJobs?.length ? (
          <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>
            You haven&apos;t applied to any jobs yet. Browse open roles on the Jobs page.
          </div>
        ) : (
          <div className="cand-table-wrap" style={{ position: 'relative', zIndex: 2 }}>
            <table className="cand-light-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Application Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {data.appliedJobs.map((a) => {
                  const meta = statusMeta(a.status);
                  return (
                    <tr key={a.id} className="table-row-hover">
                      <td>
                        <strong>{a.job?.title || "—"}</strong>
                      </td>
                      <td>{a.job?.company || "—"}</td>
                      <td>{a.job?.location || "—"}</td>
                      <td>
                        <span
                          className="status-pill-badge"
                          style={{
                            background: meta.bg,
                            color: meta.text,
                            borderColor: meta.border,
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="date-text">{fmtDate(a.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-cand-app-container {
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
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .cand-header-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-header-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .cand-header-3d:hover .card-glow-bar,
        .cand-stat-card-3d:hover .card-glow-bar,
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
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        /* Stat Cards Grid */
        .cand-stats-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .cand-stat-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 22px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-stat-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-top-flex {
          margin-bottom: 10px;
        }

        .card-emoji-icon {
          font-size: 24px;
        }

        .stat-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .stat-val {
          font-size: 22px;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Offer Banner Card */
        .offer-banner-card {
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%) !important;
          border-color: #a7f3d0 !important;
        }

        .offer-banner-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .offer-icon {
          font-size: 32px;
        }

        .offer-info-text {
          flex: 1;
        }

        .offer-info-text strong {
          display: block;
          font-size: 15.5px;
          color: #065f46;
          margin-bottom: 2px;
          font-weight: 800;
        }

        .offer-info-text p {
          font-size: 13.5px;
          color: #047857;
          margin: 0;
          font-weight: 600;
        }

        /* Glass Panel */
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
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .panel-heading {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 18px;
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

        .status-pill-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid;
          text-transform: capitalize;
        }

        .date-text {
          font-size: 12.5px;
          color: #64748b;
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
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        .cv-action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
        }

        .cand-msg-banner {
          background: #ecfdf5;
          border: 1.5px solid #a7f3d0;
          color: #065f46;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
        }

        /* Loading & Empty States */
        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 80vh;
          color: #4f46e5;
          font-weight: 800;
        }

        .cand-loader {
          width: 24px;
          height: 24px;
          border: 3px solid #4f46e5;
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
}