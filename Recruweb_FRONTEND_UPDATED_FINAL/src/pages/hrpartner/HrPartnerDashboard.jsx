import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const statusColor = { open: "#d97706", in_progress: "#0284c7", resolved: "#059669", closed: "#64748b" };

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.supportTickets.getMine();
    if (res?.success) setTickets(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openTicket = async (id) => {
    const res = await api.supportTickets.getDetail(id);
    if (res?.success) setSelected(res.data);
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await api.supportTickets.create({ subject, category, priority, message });
    if (res?.success) {
      setSubject(""); setCategory(""); setMessage(""); setPriority("medium");
      setShowForm(false);
      load();
    }
    setSaving(false);
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

  // Compute stats for charts and graphs
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const closedCount = tickets.filter(t => t.status === "closed").length;

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

        <div className="cand-card-3d" style={{ maxWidth: "900px", margin: "0 auto", padding: "36px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <button onClick={() => setSelected(null)} className="cv-action-btn secondary" style={{ marginBottom: "16px", padding: "8px 16px", fontSize: "12.5px" }}>← Back to tickets</button>
            <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>{selected.subject}</h1>
            <p style={{ color: statusColor[selected.status], fontWeight: "800", marginBottom: "20px", fontSize: "13.5px", textTransform: "capitalize" }}>
              {selected.status.replace("_", " ")} · {selected.priority} priority
            </p>

            <div className="thread" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", maxHeight: "400px", overflowY: "auto" }}>
              {selected.replies?.map((r) => (
                <div key={r.id} style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "6px", fontWeight: "700" }}>
                    {r.author?.name} ({r.author?.role}) · {new Date(r.createdAt).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "14px", color: "#334155", fontWeight: "600", lineHeight: "1.5" }}>{r.message}</div>
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
              <button type="submit" className="cv-action-btn primary glow-btn" style={{ padding: "12px 24px" }}>Send</button>
            </form>
          </div>
          <div className="card-glow-bar"></div>
        </div>
        <ScrollIndicator />
        <style>{styles}</style>
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
          <span>✨ Recruweb Enterprise Support &amp; Ticketing Suite</span>
          <span>•</span>
          <span>🎫 Direct Resolution Tracking with HR &amp; Admin</span>
          <span>•</span>
          <span>⭐ 24/7 Priority Assistance &amp; Query Management</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Support <span className="gradient-text">Tickets</span>
            </h1>
            <p className="cand-subtitle">
              Need assistance? Create a support ticket and our team will resolve your query promptly.
            </p>
          </div>
          <button onClick={() => setShowForm((s) => !s)} className="cv-action-btn primary glow-btn">
            {showForm ? "Cancel" : "+ New Ticket"}
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Analytics & Graph Visualizer Section */}
      <div className="cand-grid-2" style={{ marginBottom: "28px" }}>
        {/* Graph 1: Ticket Status Distribution Bar Chart */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="card-heading-3d" style={{ position: 'relative', zIndex: 2 }}>
            <span>📊 Ticket Status Metrics</span>
            <span className="sub-tag">Live Analytics</span>
          </div>
          <div className="graph-bars-stack" style={{ position: 'relative', zIndex: 2 }}>
            {[
              { label: "Open", count: openCount, color: "#d97706" },
              { label: "In Progress", count: inProgressCount, color: "#0284c7" },
              { label: "Resolved", count: resolvedCount, color: "#059669" },
              { label: "Closed", count: closedCount, color: "#64748b" },
            ].map((bar) => {
              const percentage = totalCount > 0 ? Math.max(15, Math.round((bar.count / totalCount) * 100)) : 15;
              return (
                <div key={bar.label} className="graph-row">
                  <div className="graph-label">{bar.label}</div>
                  <div className="graph-track">
                    <div
                      className="graph-fill animated-bar"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${bar.color}33, ${bar.color})`,
                        color: "#ffffff",
                      }}
                    >
                      <span className="fill-val-text">{bar.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card-glow-bar"></div>
        </div>

        {/* Graph 2: Ticket Summary & Resolution Index */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="card-heading-3d" style={{ position: 'relative', zIndex: 2 }}>
            <span>⭐ Resolution Efficiency Index</span>
            <span className="sub-tag">AI Evaluated</span>
          </div>

          <div className="kpi-gauge-box" style={{ position: 'relative', zIndex: 2 }}>
            <div
              className="gauge-ring-outer"
              style={{
                background: `conic-gradient(#059669 0% ${totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%, rgba(203, 213, 225, 0.4) 0% 100%)`,
              }}
            >
              <div className="gauge-ring-inner">
                <span className="gauge-score">{totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}%` : "0%"}</span>
                <span className="gauge-label">Resolved</span>
              </div>
            </div>
            <div className="gauge-details">
              <strong>Support Performance</strong>
              <p>
                Track ticket turnaround times and active query resolutions handled by the Recruweb support team.
              </p>
              <div className="efficiency-pills">
                <span className="pill-item">🚀 Total Tickets: {totalCount}</span>
                <span className="pill-item">⭐ Active Support: 24/7</span>
              </div>
            </div>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      </div>

      {showForm && (
        <div className="cand-card-3d" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <form onSubmit={submitTicket} style={{ position: 'relative', zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="input-group-3d">
              <label style={{ fontSize: "12.5px", fontWeight: "800", color: "#334155", marginBottom: "6px", display: "block" }}>Subject *</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief subject of your issue"
                className="cand-input"
              />
            </div>
            <div className="input-group-3d">
              <label style={{ fontSize: "12.5px", fontWeight: "800", color: "#334155", marginBottom: "6px", display: "block" }}>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Billing, Technical, Onboarding"
                className="cand-input"
              />
            </div>
            <div className="input-group-3d" style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "800", color: "#334155", marginBottom: "6px", display: "block" }}>Priority Level</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="cand-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="input-group-3d" style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "800", color: "#334155", marginBottom: "6px", display: "block" }}>Description *</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail…"
                className="cand-input"
                style={{ minHeight: "100px", resize: "vertical" }}
              />
            </div>
            <button type="submit" disabled={saving} className="cv-action-btn primary glow-btn" style={{ gridColumn: "1 / -1", justifyContent: "center" }}>
              {saving ? "Submitting Ticket..." : "Submit Ticket ✨"}
            </button>
          </form>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Tickets Table Card */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <h2 className="panel-heading" style={{ position: 'relative', zIndex: 2 }}>🎫 My Support Requests</h2>
        {loading ? (
          <div className="cand-loading-state" style={{ position: 'relative', zIndex: 2 }}>
            <span className="cand-loader"></span> Loading tickets...
          </div>
        ) : !tickets.length ? (
          <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>No support tickets yet. Click "+ New Ticket" to create one.</div>
        ) : (
          <div className="cand-table-wrap" style={{ position: 'relative', zIndex: 2 }}>
            <table className="cand-light-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created On</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} onClick={() => openTicket(t.id)} className="table-row-hover" style={{ cursor: "pointer" }}>
                    <td><strong>{t.subject}</strong></td>
                    <td>{t.category || "—"}</td>
                    <td style={{ textTransform: "capitalize", fontWeight: "700" }}>{t.priority}</td>
                    <td>
                      <span className="status-pill-badge" style={{ background: t.status === 'resolved' ? '#ecfdf5' : t.status === 'in_progress' ? '#e0f2fe' : '#fef3c7', color: statusColor[t.status], borderColor: t.status === 'resolved' ? '#a7f3d0' : t.status === 'in_progress' ? '#bae6fd' : '#fde68a' }}>
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ color: "#64748b", fontWeight: "600" }}>{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

        /* Marquee Ribbon */
        .support-marquee-banner {
          background: linear-gradient(90deg, #4f46e5, #9333ea);
          color: #ffffff;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
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

        .cand-grid-2 {
          position: relative;
          z-index: 2;
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
          display: flex;
          flex-direction: column;
        }

        .cand-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-heading-3d {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sub-tag {
          font-size: 11.5px;
          color: #4f46e5;
          background: #e0e7ff;
          border: 1px solid #c7d2fe;
          padding: 4px 10px;
          border-radius: 8px;
          font-weight: 800;
        }

        .graph-bars-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
          justify-content: center;
        }

        .graph-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .graph-label {
          width: 110px;
          font-size: 13px;
          font-weight: 800;
          color: #334155;
        }

        .graph-track {
          flex: 1;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          overflow: hidden;
          padding: 2px;
        }

        .graph-fill.animated-bar {
          font-size: 12px;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          justify-content: flex-end;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .kpi-gauge-box {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          justify-content: center;
        }

        .gauge-ring-outer {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(5, 150, 105, 0.2);
        }

        .gauge-ring-inner {
          width: 92px;
          height: 92px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .gauge-score {
          font-size: 22px;
          font-weight: 900;
          color: #059669;
        }

        .gauge-label {
          font-size: 10.5px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
        }

        .gauge-details {
          flex: 1;
        }

        .gauge-details strong {
          display: block;
          font-size: 14.5px;
          color: #0f172a;
          margin-bottom: 4px;
          font-weight: 800;
        }

        .gauge-details p {
          font-size: 12.5px;
          color: #64748b;
          margin: 0 0 10px;
          line-height: 1.4;
          font-weight: 600;
        }

        .efficiency-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pill-item {
          background: #e0e7ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 8px;
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
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
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

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
        }

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover:not(:disabled) {
          background: #e2e8f0;
          border-color: #94a3b8;
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
          border: 1.5px solid;
          text-transform: capitalize;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 50vh;
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
          padding: 40px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .cand-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}