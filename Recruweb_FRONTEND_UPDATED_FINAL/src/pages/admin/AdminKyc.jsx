import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const statusColor = {
  pending: "#d97706",
  approved: "#059669",
  rejected: "#dc2626",
};

export default function AdminKyc() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [message, setMessage] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.kyc.getAll(filter);
    if (res?.success) setDocs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const approve = async (id) => {
    const res = await api.kyc.review(id, "approved");
    if (res?.success) {
      setMessage("Document approved.");
      load();
    } else {
      setMessage(res?.message || "Failed to approve.");
    }
  };

  const submitReject = async (id) => {
    if (!rejectReason.trim()) return;
    const res = await api.kyc.review(id, "rejected", rejectReason);
    if (res?.success) {
      setMessage("Document rejected.");
      setRejectingId(null);
      setRejectReason("");
      load();
    } else {
      setMessage(res?.message || "Failed to reject.");
    }
  };

  return (
    <div className="light-kyc-container">
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
      <div className="kyc-marquee-banner">
        <div className="kyc-marquee-track">
          <span>✨ Recruweb Enterprise KYC Document Review Queue</span>
          <span>•</span>
          <span>📄 Review Identity &amp; Compliance Documents Submitted by Candidates &amp; HR Partners</span>
          <span>•</span>
          <span>⭐ Real-time Approvals, Rejections &amp; Audit Tracking</span>
        </div>
      </div>

      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            KYC Document <span className="gradient-text">Review Queue</span>
          </h1>
          <p className="cand-subtitle">
            Review identity/compliance documents submitted by candidates and HR Partners.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <div className="cand-tabs-bar" style={{ position: 'relative', zIndex: 2 }}>
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`cand-tab-btn${filter === s ? " active" : ""}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {message && <div className="cand-msg-banner" style={{ marginBottom: "24px", position: 'relative', zIndex: 2, background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>ℹ️ {message}</div>}

      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading…
            </div>
          ) : !docs.length ? (
            <div className="cand-empty-state">No documents in this state.</div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>File</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>{d.user?.name}</strong>
                        <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>{d.user?.email} · {d.user?.role}</div>
                      </td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{d.documentType}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-preview-link"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          onClick={async () => {
                            try {
                              await api.kyc.previewDocument(d.id, d.fileName);
                            } catch (err) {
                              setMessage(err?.message || "Unable to preview this document.");
                            }
                          }}
                        >
                          {d.fileName || "View"} ↗
                        </button>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: 900,
                            textTransform: "capitalize",
                            color: statusColor[d.status] || "#64748b",
                            background: d.status === "approved" ? "#ecfdf5" : d.status === "rejected" ? "#fef2f2" : "#fef3c7",
                            border: `1.5px solid ${d.status === "approved" ? "#a7f3d0" : d.status === "rejected" ? "#fecaca" : "#fde68a"}`,
                          }}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td>
                        {d.status === "pending" && (
                          rejectingId === d.id ? (
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason…"
                                className="cand-input"
                                style={{ width: "160px", padding: "6px 10px", fontSize: "12px" }}
                              />
                              <button
                                className="cv-action-btn"
                                style={{ background: "#dc2626", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                                onClick={() => submitReject(d.id)}
                              >
                                Confirm
                              </button>
                              <button
                                className="cv-action-btn secondary"
                                style={{ padding: "6px 12px", fontSize: "12px" }}
                                onClick={() => setRejectingId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <button
                                className="cv-action-btn primary glow-btn"
                                style={{ padding: "6px 14px", fontSize: "12px" }}
                                onClick={() => approve(d.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="cv-action-btn"
                                style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                                onClick={() => setRejectingId(d.id)}
                              >
                                Reject
                              </button>
                            </div>
                          )
                        )}
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
        .light-kyc-container {
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
        .kyc-marquee-banner {
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

        .kyc-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .kyc-marquee-track span {
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

        .btn-preview-link {
          display: inline-block;
          color: #0284c7;
          font-weight: 800;
          font-size: 13px;
          text-decoration: none;
        }
        .btn-preview-link:hover { text-decoration: underline; }

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

        .cand-msg-banner {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 800;
          border: 1.5px solid;
        }
      `}</style>
    </div>
  );
}