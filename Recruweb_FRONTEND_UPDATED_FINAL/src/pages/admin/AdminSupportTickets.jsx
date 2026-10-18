import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const statusColor = {
  open: "#d97706",
  in_progress: "#0284c7",
  resolved: "#059669",
  closed: "#64748b",
};

const statusMeta = (status) => {
  switch (status) {
    case "resolved":
      return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
    case "in_progress":
      return { bg: "#e0f2fe", text: "#0284c7", border: "#bae6fd" };
    case "closed":
      return { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" };
    default:
      return { bg: "#fef3c7", text: "#d97706", border: "#fde68a" };
  }
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.supportTickets.getAll(filter);
    if (res?.success) setTickets(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openTicket = async (id) => {
    const res = await api.supportTickets.getDetail(id);
    if (res?.success) setSelected(res.data);
  };

  const updateStatus = async (status) => {
    if (!selected) return;
    const res = await api.supportTickets.update(selected.id, { status });
    if (res?.success) {
      openTicket(selected.id);
      load();
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selected) return;
    const res = await api.supportTickets.addReply(selected.id, replyText);
    if (res?.success) {
      setReplyText("");
      openTicket(selected.id);
    }
  };

  if (selected) {
    return (
      <div className="light-support-container">
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
        <div className="support-marquee-banner">
          <div className="support-marquee-track">
            <span>✨ Recruweb Enterprise Support Tickets &amp; Helpdesk</span>
            <span>•</span>
            <span>🎫 Ticket Thread, Live Replies &amp; Status Management</span>
            <span>•</span>
            <span>⭐ Resolution &amp; Client Communication Queue</span>
          </div>
        </div>

        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <button
              onClick={() => setSelected(null)}
              className="cv-action-btn secondary"
              style={{ marginBottom: "16px" }}
            >
              ← Back to queue
            </button>
            <h1 className="cand-title" style={{ fontSize: "24px", marginBottom: "6px" }}>{selected.subject}</h1>
            <p className="drawer-subtext" style={{ marginBottom: "16px" }}>
              Raised by <strong>{selected.raisedBy?.name}</strong> ({selected.raisedBy?.role})
            </p>

            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
              {["open", "in_progress", "resolved", "closed"].map((s) => {
                const meta = statusMeta(s);
                const isActive = selected.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className="cv-action-btn"
                    style={{
                      background: isActive ? meta.text : "#f1f5f9",
                      color: isActive ? "#ffffff" : "#334155",
                      border: `1.5px solid ${isActive ? meta.text : "#cbd5e1"}`,
                      textTransform: "capitalize",
                      fontWeight: "800",
                    }}
                  >
                    {s.replace("_", " ")}
                  </button>
                );
              })}
            </div>

            <div className="thread" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {selected.replies?.map((r) => (
                <div
                  key={r.id}
                  className="note-bubble-card"
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #cbd5e1",
                    padding: "16px",
                    borderRadius: "14px",
                  }}
                >
                  <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", marginBottom: "6px" }}>
                    {r.author?.name} ({r.author?.role}) · {new Date(r.createdAt).toLocaleString("en-IN")}
                  </div>
                  <p style={{ margin: 0, color: "#0f172a", fontWeight: "600", fontSize: "13.5px" }}>{r.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={submitReply} style={{ display: "flex", gap: "10px" }}>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="cand-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="cv-action-btn primary glow-btn">
                Send ✨
              </button>
            </form>
          </div>
          <div className="card-glow-bar"></div>
        </div>

        <ScrollIndicator />
      </div>
    );
  }

  return (
    <div className="light-support-container">
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
      <div className="support-marquee-banner">
        <div className="support-marquee-track">
          <span>✨ Recruweb Enterprise Support Tickets &amp; Helpdesk</span>
          <span>•</span>
          <span>🎫 Requests Raised by Candidates, Clients, and HR Partners</span>
          <span>•</span>
          <span>⭐ Real-time Ticket Status Management &amp; Queue Filtering</span>
        </div>
      </div>

      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Support <span className="gradient-text">Tickets</span>
          </h1>
          <p className="cand-subtitle">Requests raised by candidates, clients, and HR Partners.</p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <div className="cand-tabs-bar" style={{ position: 'relative', zIndex: 2 }}>
        {["", "open", "in_progress", "resolved", "closed"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`cand-tab-btn${filter === s ? " active" : ""}`}
            style={{ textTransform: "capitalize" }}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading…
            </div>
          ) : !tickets.length ? (
            <div className="cand-empty-state">No tickets found.</div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Raised By</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => {
                    const meta = statusMeta(t.status);
                    return (
                      <tr key={t.id} onClick={() => openTicket(t.id)} className="table-row-hover">
                        <td>
                          <strong style={{ color: "#0f172a", fontWeight: "900" }}>{t.subject}</strong>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{t.raisedBy?.name} ({t.raisedBy?.role})</td>
                        <td>
                          <span className={`priority-pill prio-${t.priority}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: 20,
                              fontSize: "11.5px",
                              fontWeight: 800,
                              textTransform: "capitalize",
                              background: meta.bg,
                              color: meta.text,
                              border: `1.5px solid ${meta.border}`,
                            }}
                          >
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="date-text">{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
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

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-support-container {
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
        .support-marquee-banner {
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

        .support-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .support-marquee-track span {
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
          cursor: pointer;
        }

        .priority-pill {
          font-size: 11px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          text-transform: uppercase;
          border: 1.5px solid;
        }
        .priority-pill.prio-high { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .priority-pill.prio-medium { background: #fef3c7; color: #d97706; border-color: #fde68a; }
        .priority-pill.prio-low { background: #e0f2fe; color: #0284c7; border-color: #bae6fd; }

        .date-text { font-size: 12.5px; color: #64748b; font-weight: 700; }
        .drawer-subtext { font-size: 13px; color: #64748b; font-weight: 700; margin: 0; }

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
          padding: 50px 20px;
          color: #64748b;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}