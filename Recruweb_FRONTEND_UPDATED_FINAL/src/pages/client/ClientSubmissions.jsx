import { useEffect, useState } from "react";
import { api, API_URL } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const FILE_BASE = API_URL.replace(/\/api\/?$/, "");

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS_LABELS = {
  submitted: "Awaiting Your Review",
  "client-approved": "Approved by You",
  "client-rejected": "Rejected by You",
  "interview-scheduled": "Interview Scheduled",
  "interview-completed": "Interview Completed",
  "offer-extended": "Offer Awaiting Your Approval",
  "offer-approved": "Offer Approved by You",
  "offer-rejected": "Offer Rejected by You",
  withdrawn: "Withdrawn",
};

const statusMeta = (status) => {
  switch (status) {
    case "client-approved":
    case "offer-approved":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
      };
    case "client-rejected":
    case "offer-rejected":
    case "withdrawn":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
      };
    case "offer-extended":
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
      };
    case "interview-scheduled":
    case "interview-completed":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
      };
    default:
      return {
        bg: "#f3e8ff",
        text: "#9333ea",
        border: "#e9d5ff",
      };
  }
};

export default function ClientSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [remarksDraft, setRemarksDraft] = useState({});

  const load = async () => {
    const res = await api.clientPortal.getSubmissions();
    if (res?.success) setSubmissions(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (action, id) => {
    setBusyId(id);
    const remarks = remarksDraft[id] || "";
    const fn = {
      approveCandidate: api.clientPortal.approveCandidate,
      rejectCandidate: api.clientPortal.rejectCandidate,
      approveOffer: api.clientPortal.approveOffer,
      rejectOffer: api.clientPortal.rejectOffer,
    }[action];
    const res = await fn(id, remarks);
    if (!res?.success) {
      alert(res?.message || "Action failed");
    }
    await load();
    setBusyId(null);
  };

  if (loading)
    return (
      <div className="light-sub-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading candidate submissions...
        </div>
      </div>
    );

  return (
    <div className="light-sub-container">
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
      <div className="sub-marquee-banner">
        <div className="sub-marquee-track">
          <span>✨ Recruweb Corporate Candidate Submissions &amp; Review Hub</span>
          <span>•</span>
          <span>👥 Evaluate Candidate Resumes &amp; Active Applications</span>
          <span>•</span>
          <span>⭐ Official Corporate Offer Sign-offs &amp; Approvals</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Candidate Submissions{" "}
            <span className="gradient-text">— Review Hub</span>
          </h1>
          <p className="cand-subtitle">
            Evaluate candidates submitted by your recruiter, review resumes, and approve or reject offers.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {!submissions.length ? (
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>
            No candidates have been submitted against your requirements yet.
          </div>
          <div className="card-glow-bar"></div>
        </div>
      ) : (
        <div className="submissions-stack">
          {submissions.map((s) => {
            const meta = statusMeta(s.status);
            return (
              <div key={s.id} className="cand-card-3d">
                <div className="card-bg-light-glow"></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="card-top-flex">
                    <div className="candidate-info-block">
                      <h3 className="candidate-name">
                        {s.candidate?.firstName} {s.candidate?.lastName}{" "}
                        <span className="code-tag">
                          ({s.candidate?.candidateCode})
                        </span>
                      </h3>
                      <div className="requirement-tag">
                        For Position: <strong>{s.requirement?.title}</strong>
                      </div>
                      <div className="candidate-meta-line">
                        <span>
                          Exp:{" "}
                          <strong>{s.candidate?.experience ?? "—"} yrs</strong>
                        </span>{" "}
                        ·
                        <span>
                          {" "}
                          Current:{" "}
                          <strong>{s.candidate?.currentCompany || "—"}</strong>
                        </span>{" "}
                        ·
                        <span>
                          {" "}
                          Expected CTC:{" "}
                          <strong>
                            {s.candidate?.expectedCTC
                              ? `₹${s.candidate.expectedCTC}`
                              : "—"}
                          </strong>
                        </span>
                      </div>
                      {s.candidate?.skills?.length > 0 && (
                        <div className="candidate-skills-row">
                          Skills: {s.candidate.skills.join(", ")}
                        </div>
                      )}
                      {s.candidate?.resume && (
                        <div className="resume-link-wrap">
                          <a
                            href={`${FILE_BASE}${s.candidate.resume}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-resume-view"
                          >
                            📄 View Candidate Resume
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="status-badge-col">
                      <span
                        className="status-pill-badge"
                        style={{
                          background: meta.bg,
                          color: meta.text,
                          borderColor: meta.border,
                        }}
                      >
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                      <div className="submitted-date-lbl">
                        Submitted {fmtDate(s.createdAt)}
                      </div>
                    </div>
                  </div>

                  {s.status === "offer-extended" && (
                    <div className="offer-details-box">
                      <strong>💼 Corporate Offer Details</strong>
                      <div className="offer-info-grid">
                        <div>
                          Amount:{" "}
                          <strong>
                            {s.offerCurrency} {s.offerAmount}
                          </strong>
                        </div>
                        <div>
                          Joining Date:{" "}
                          <strong>{fmtDate(s.offerJoiningDate)}</strong>
                        </div>
                      </div>
                      {s.offerNotes && (
                        <div className="offer-notes-text">
                          Notes: {s.offerNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {(s.status === "submitted" ||
                    s.status === "offer-extended") && (
                    <div className="action-control-box">
                      <input
                        placeholder="Optional remarks or feedback..."
                        value={remarksDraft[s.id] || ""}
                        onChange={(e) =>
                          setRemarksDraft({
                            ...remarksDraft,
                            [s.id]: e.target.value,
                          })
                        }
                        className="cand-input"
                      />
                      <div className="btn-actions-flex">
                        {s.status === "submitted" && (
                          <>
                            <button
                              className="btn-approve"
                              disabled={busyId === s.id}
                              onClick={() => act("approveCandidate", s.id)}
                            >
                              ✓ Approve Candidate
                            </button>
                            <button
                              className="btn-reject"
                              disabled={busyId === s.id}
                              onClick={() => act("rejectCandidate", s.id)}
                            >
                              ✕ Reject Candidate
                            </button>
                          </>
                        )}
                        {s.status === "offer-extended" && (
                          <>
                            <button
                              className="btn-approve"
                              disabled={busyId === s.id}
                              onClick={() => act("approveOffer", s.id)}
                            >
                              ✓ Approve Offer
                            </button>
                            <button
                              className="btn-reject"
                              disabled={busyId === s.id}
                              onClick={() => act("rejectOffer", s.id)}
                            >
                              ✕ Reject Offer
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {s.clientRemarks && (
                    <div className="client-remarks-box">
                      <em>Your remarks: {s.clientRemarks}</em>
                    </div>
                  )}
                </div>
                <div className="card-glow-bar"></div>
              </div>
            );
          })}
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-sub-container {
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
        .sub-marquee-banner {
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

        .sub-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .sub-marquee-track span {
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
          margin-bottom: 24px;
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

        .submissions-stack {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 20px;
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

        .card-top-flex {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .candidate-info-block {
          flex: 1;
        }

        .candidate-name {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .code-tag {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
        }

        .requirement-tag {
          font-size: 13.5px;
          color: #0284c7;
          margin-bottom: 6px;
          font-weight: 800;
        }

        .candidate-meta-line {
          font-size: 13px;
          color: #334155;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .candidate-skills-row {
          font-size: 12.5px;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .resume-link-wrap {
          margin-top: 10px;
        }

        .btn-resume-view {
          display: inline-block;
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          color: #0284c7;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-resume-view:hover {
          background: #bae6fd;
        }

        .status-badge-col {
          text-align: right;
        }

        .status-pill-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: capitalize;
        }

        .submitted-date-lbl {
          font-size: 12px;
          color: #64748b;
          margin-top: 8px;
          font-weight: 600;
        }

        .offer-details-box {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          padding: 16px;
          margin-top: 18px;
        }

        .offer-details-box strong {
          color: #0f172a;
          font-size: 13.5px;
          font-weight: 900;
        }

        .offer-info-grid {
          display: flex;
          gap: 20px;
          margin-top: 6px;
          font-size: 13.5px;
          color: #334155;
          font-weight: 700;
        }

        .offer-notes-text {
          font-size: 13px;
          color: #64748b;
          margin-top: 6px;
          font-weight: 600;
        }

        .action-control-box {
          margin-top: 18px;
          border-top: 1.5px solid #e2e8f0;
          padding-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
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
          transition: border-color 0.2s;
        }

        .cand-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
        }

        .btn-actions-flex {
          display: flex;
          gap: 12px;
        }

        .btn-approve {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          transition: transform 0.2s;
        }

        .btn-approve:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-reject {
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          color: #dc2626;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-reject:hover:not(:disabled) {
          background: #fee2e2;
        }

        .client-remarks-box {
          margin-top: 14px;
          font-size: 13px;
          color: #64748b;
          background: #f8fafc;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          font-weight: 600;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 80vh;
          color: #0284c7;
          font-weight: 800;
        }

        .cand-loader {
          width: 24px;
          height: 24px;
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
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          padding: 40px;
        }
      `}</style>
    </div>
  );
}