import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import MeetingRoom from "../../components/interview/MeetingRoom";
import useAuth from "../../hooks/useAuth";
import { useGlobalPrefs } from "../../context/GlobalPrefsContext";
import { formatInTimezone } from "../../utils/globalFormat";
import ScrollIndicator from "../../components/ScrollIndicator";

const statusMeta = (status) => {
  switch (status) {
    case "scheduled":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
      };
    case "completed":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
      };
    case "cancelled":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
      };
    default:
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
      };
  }
};

export default function CandidateInterviews() {
  const { user } = useAuth();
  const { timezone } = useGlobalPrefs();
  const fmtDateTime = (d) =>
    formatInTimezone(d, timezone, { dateStyle: "medium", timeStyle: "short" });
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    startAt: "",
    notes: "",
    interviewMode: "video",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [activeMeeting, setActiveMeeting] = useState(null);

  const load = async () => {
    const res = await api.candidatePortal.getInterviews();
    if (res?.success) setInterviews(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const res = await api.candidatePortal.bookInterview(form);
    if (res?.success) {
      setMessage("Interview request sent successfully to your recruiter.");
      setForm({ startAt: "", notes: "", interviewMode: "video" });
      load();
    } else {
      setMessage(res?.message || "Failed to request interview.");
    }
    setSubmitting(false);
  };

  return (
    <div className="light-cand-int-container">
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
            Interview Schedule{" "}
            <span className="gradient-text">— Career Portal</span>
          </h1>
          <p className="cand-subtitle">
            Request interview slots with your recruiter and monitor your upcoming session history.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Form Card for Booking */}
      <div className="cand-card-3d" style={{ marginBottom: "28px" }}>
        <div className="card-bg-light-glow"></div>
        <h3 className="form-heading" style={{ position: 'relative', zIndex: 2 }}>📅 Book / Request Interview Slot</h3>
        <form onSubmit={submit} className="cand-form-body" style={{ position: 'relative', zIndex: 2 }}>
          <div className="input-group-3d">
            <label>Preferred Date &amp; Time *</label>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              required
              className="cand-input"
            />
          </div>

          <div className="input-group-3d">
            <label>Interview Mode</label>
            <select
              className="cand-input"
              value={form.interviewMode}
              onChange={(e) =>
                setForm({ ...form, interviewMode: e.target.value })
              }
            >
              <option value="video">🎥 Video Call (instant link generated)</option>
              <option value="phone">📞 Phone Call</option>
              <option value="onsite">🏢 Onsite / In-Person</option>
            </select>
          </div>

          <div className="input-group-3d">
            <label>Notes &amp; Availability (optional)</label>
            <textarea
              rows={3}
              className="cand-input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Share your preferred timezone or availability notes..."
              style={{ resize: "vertical" }}
            />
          </div>

          <button className="cv-action-btn primary glow-btn" disabled={submitting} style={{ justifyContent: 'center', width: '100%' }}>
            {submitting ? "Sending Request..." : "🚀 Request Interview Slot ✨"}
          </button>

          {message && <div className="cand-msg-banner">ℹ️ {message}</div>}
        </form>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Panel Interview History Table */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <h3 className="panel-heading" style={{ position: 'relative', zIndex: 2 }}>📋 Your Interview History</h3>
        {loading ? (
          <div className="cand-loading-state" style={{ position: 'relative', zIndex: 2 }}>
            <span className="cand-loader"></span> Loading interview schedules...
          </div>
        ) : !interviews.length ? (
          <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>No interviews scheduled yet.</div>
        ) : (
          <div className="cand-table-wrap" style={{ position: 'relative', zIndex: 2 }}>
            <table className="cand-light-table">
              <thead>
                <tr>
                  <th>Session Title</th>
                  <th>Date &amp; Time</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Notes &amp; Description</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((ev) => {
                  const meta = statusMeta(ev.status);
                  return (
                    <tr key={ev.id} className="table-row-hover">
                      <td>
                        <strong>{ev.title || "Interview Session"}</strong>
                      </td>
                      <td className="date-time-text">
                        {fmtDateTime(ev.startAt)}
                        <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: "600" }}>
                          {timezone}
                        </div>
                      </td>
                      <td>
                        {ev.interviewMode === "video" && ev.meetingLink ? (
                          <button
                            className="join-meeting-btn"
                            onClick={() => setActiveMeeting(ev)}
                            disabled={ev.status === "cancelled"}
                          >
                            🎥 Join
                          </button>
                        ) : ev.interviewMode === "phone" ? (
                          <span className="mode-badge">📞 Phone</span>
                        ) : ev.interviewMode === "onsite" ? (
                          <span className="mode-badge">🏢 Onsite</span>
                        ) : (
                          <span className="mode-badge">—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className="status-pill-badge"
                          style={{
                            background: meta.bg,
                            color: meta.text,
                            borderColor: meta.border,
                          }}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td className="notes-text">{ev.description || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="card-glow-bar"></div>
      </div>

      {activeMeeting && (
        <MeetingRoom
          meetingLink={activeMeeting.meetingLink}
          displayName={user?.name || "Candidate"}
          onClose={() => setActiveMeeting(null)}
        />
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-cand-int-container {
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

        .form-heading {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 18px;
        }

        .cand-form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group-3d {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group-3d label {
          font-size: 13px;
          font-weight: 800;
          color: #334155;
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

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cand-msg-banner {
          background: #e0e7ff;
          border: 1.5px solid #c7d2fe;
          color: #4338ca;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
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

        .date-time-text {
          font-weight: 800;
          color: #4f46e5;
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

        .notes-text {
          color: #64748b;
          max-width: 280px;
          font-weight: 600;
        }

        .join-meeting-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 8px 14px;
          font-weight: 800;
          font-size: 12.5px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          transition: all 0.2s;
        }

        .join-meeting-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .join-meeting-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .mode-badge {
          font-size: 13px;
          color: #475569;
          font-weight: 700;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
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