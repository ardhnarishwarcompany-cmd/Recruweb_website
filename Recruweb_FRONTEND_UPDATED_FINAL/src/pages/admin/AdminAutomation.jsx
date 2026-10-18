import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

const statusMeta = (status) => {
  switch (status) {
    case "sent":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
        dot: "#059669",
      };
    case "failed":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
        dot: "#dc2626",
      };
    case "skipped_not_configured":
      return {
        bg: "#f1f5f9",
        text: "#64748b",
        border: "#cbd5e1",
        dot: "#64748b",
      };
    default:
      return {
        bg: "#f1f5f9",
        text: "#64748b",
        border: "#cbd5e1",
        dot: "#64748b",
      };
  }
};

export default function AdminAutomation() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState("");

  // manual send form
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({
    channel: "email",
    candidateId: "",
    to: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const [statsRes, logsRes] = await Promise.all([
      api.automation.getStats(),
      api.automation.getLogs(),
    ]);
    if (statsRes?.success) setStats(statsRes.data);
    if (logsRes?.success) setLogs(logsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    api.candidates
      .getAll({ limit: 500 })
      .then((r) => r?.success && setCandidates(r.data || []));
  }, []);

  const runNow = async () => {
    setRunning(true);
    setRunMessage("");
    const res = await api.automation.runRemindersNow();
    setRunMessage(res?.message || "Done.");
    setRunning(false);
    load();
  };

  const sendManual = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendMessage("");
    const res = await api.automation.send(form);
    if (res?.success) setSendMessage("Sent successfully.");
    else if (res?.data?.skipped)
      setSendMessage(
        `Skipped — ${res.data.reason}. Configure this channel in Settings first.`,
      );
    else setSendMessage(res?.message || res?.data?.error || "Failed to send.");
    setSending(false);
    load();
  };

  return (
    <div className="light-auto-container">
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
      <div className="auto-marquee-banner">
        <div className="auto-marquee-track">
          <span>✨ Recruweb Enterprise Automation Hub &amp; Notifications</span>
          <span>•</span>
          <span>📧 Email, WhatsApp &amp; SMS Automation, Interview &amp; Joining Reminders</span>
          <span>•</span>
          <span>⭐ Real-time Messaging &amp; Activity Tracking</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Automation Hub{" "}
            <span className="gradient-text">
              — Notifications &amp; Reminders
            </span>
          </h1>
          <p className="cand-subtitle">
            Email, WhatsApp &amp; SMS automation, interview &amp; joining
            reminders. WhatsApp/SMS need credentials in{" "}
            <Link to="/admin/settings" className="auto-link">
              Settings
            </Link>{" "}
            to deliver.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Stat Cards Grid */}
      {stats && (
        <div className="client-stats-grid" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <span className="stat-val" style={{ color: "#0284c7" }}>{stats.total}</span>
            <span className="stat-lbl">Total Sends Logged</span>
            <div className="card-glow-bar" style={{ background: "#0284c7" }}></div>
          </div>
          {Object.entries(stats.byChannel).map(([ch, count], idx) => {
            const colors = ["#6366f1", "#059669", "#d97706", "#9333ea"];
            const cColor = colors[idx % colors.length];
            return (
              <div className="cand-stat-card-3d" key={ch}>
                <div className="card-bg-light-glow"></div>
                <span className="stat-val" style={{ color: cColor }}>{count}</span>
                <span
                  className="stat-lbl"
                  style={{ textTransform: "capitalize" }}
                >
                  {ch} Channel
                </span>
                <div className="card-glow-bar" style={{ background: cColor }}></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Two Column Forms Grid */}
      <div className="client-grid-2" style={{ position: 'relative', zIndex: 2, marginBottom: "28px" }}>
        {/* Run Reminders Card */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "10px" }}>⚡ Run Reminders Now</h3>
            <p className="card-desc" style={{ fontSize: "13.5px", color: "#64748b", fontWeight: "600", marginBottom: "20px", lineHeight: 1.5, flex: 1 }}>
              Interview Reminders (next 24h) &amp; Joining Reminders
              (tomorrow&apos;s joiners) run automatically every 30 minutes.
              Trigger them immediately here for testing.
            </p>
            <button
              className="cv-action-btn primary glow-btn"
              onClick={runNow}
              disabled={running}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {running ? "Running Reminders..." : "Run Reminders Now ✨"}
            </button>
            {runMessage && (
              <div className="cand-msg-banner" style={{ marginTop: "16px", background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                {runMessage}
              </div>
            )}
          </div>
          <div className="card-glow-bar"></div>
        </div>

        {/* Manual Send Form Card */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>✉️ Send Manual Message</h3>
            <form onSubmit={sendManual} className="manual-form-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Channel</label>
                  <select
                    className="cand-input"
                    value={form.channel}
                    onChange={(e) =>
                      setForm({ ...form, channel: e.target.value })
                    }
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Recipient Candidate</label>
                  <select
                    className="cand-input"
                    value={form.candidateId}
                    onChange={(e) =>
                      setForm({ ...form, candidateId: e.target.value, to: "" })
                    }
                  >
                    <option value="">Custom recipient</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!form.candidateId && (
                <div className="input-group-3d">
                  <label>Recipient Address</label>
                  <input
                    className="cand-input"
                    placeholder={
                      form.channel === "email"
                        ? "Recipient email"
                        : "Recipient phone (+91...)"
                    }
                    value={form.to}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                  />
                </div>
              )}

              {form.channel === "email" && (
                <div className="input-group-3d">
                  <label>Subject</label>
                  <input
                    className="cand-input"
                    placeholder="Email Subject"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="input-group-3d">
                <label>Message Content *</label>
                <textarea
                  required
                  rows={3}
                  className="cand-input"
                  style={{ resize: "vertical" }}
                  placeholder="Type message here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="cv-action-btn primary glow-btn"
                disabled={sending}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {sending ? "Sending Message..." : "Send Message ✨"}
              </button>
              {sendMessage && (
                <div className="cand-msg-banner" style={{ marginTop: "12px", background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                  {sendMessage}
                </div>
              )}
            </form>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      </div>

      {/* Automation Log Glass Panel */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h3 className="panel-title" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>📋 Automation Activity Log</h3>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading automation logs...
            </div>
          ) : !logs.length ? (
            <div className="cand-empty-state">
              No automation activity recorded yet.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Type</th>
                    <th>Recipient</th>
                    <th>Subject / Message Preview</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => {
                    const meta = statusMeta(l.status);
                    return (
                      <tr key={l.id} className="table-row-hover">
                        <td>
                          <span className="channel-pill">{l.channel}</span>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{l.type.replace(/_/g, " ")}</td>
                        <td className="recipient-text" style={{ color: "#0f172a", fontWeight: "800" }}>{l.recipient}</td>
                        <td className="preview-cell" style={{ color: "#334155", fontWeight: "600" }}>{l.subject || l.message}</td>
                        <td>
                          <span
                            className="status-pill-badge"
                            style={{
                              background: meta.bg,
                              color: meta.text,
                              borderColor: meta.border,
                            }}
                          >
                            {l.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="date-text">{fmtDateTime(l.createdAt)}</td>
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
        .light-auto-container {
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
        .auto-marquee-banner {
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

        .auto-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .auto-marquee-track span {
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

        .auto-link {
          color: #0284c7;
          text-decoration: none;
          font-weight: 800;
        }
        .auto-link:hover {
          text-decoration: underline;
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

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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

        .channel-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
          text-transform: capitalize;
          display: inline-block;
        }

        .status-pill-badge {
          font-size: 11.5px;
          font-weight: 900;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: capitalize;
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

        @media (max-width: 1024px) {
          .client-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}