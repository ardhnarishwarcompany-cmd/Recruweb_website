import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import MeetingRoom from "../../components/interview/MeetingRoom";
import useAuth from "../../hooks/useAuth";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

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

export default function ClientInterviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMeeting, setActiveMeeting] = useState(null);

  useEffect(() => {
    api.clientPortal.getInterviews().then((res) => {
      if (res?.success) setInterviews(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="light-int-container">
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
      <div className="int-marquee-banner">
        <div className="int-marquee-track">
          <span>✨ Recruweb Corporate Interview Schedule &amp; Video Rooms</span>
          <span>•</span>
          <span>📅 Monitor Booked Sessions &amp; Live Video Meetings</span>
          <span>•</span>
          <span>⭐ Seamless Recruiter &amp; Candidate Synchronization</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Interview Schedule{" "}
            <span className="gradient-text">— Portal Hub</span>
          </h1>
          <p className="cand-subtitle">
            Track and monitor booked interview sessions for candidates submitted against your requirements.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Panel Content Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading interview schedules...
            </div>
          ) : !interviews.length ? (
            <div className="cand-empty-state">No interviews scheduled yet.</div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Date &amp; Time</th>
                    <th>Location / Mode</th>
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
                          <strong style={{ color: "#0f172a" }}>
                            {ev.candidate
                              ? `${ev.candidate.firstName} ${ev.candidate.lastName || ""}`
                              : "—"}
                          </strong>
                        </td>
                        <td className="date-time-text">
                          {fmtDateTime(ev.startAt)}
                        </td>
                        <td>
                          {ev.interviewMode === "video" && ev.meetingLink ? (
                            <button
                              className="join-meeting-btn"
                              onClick={() => setActiveMeeting(ev)}
                              disabled={ev.status === "cancelled"}
                            >
                              🎥 Join Meeting
                            </button>
                          ) : (
                            <span className="location-tag">
                              {ev.location || (ev.interviewMode ? ev.interviewMode : "—")}
                            </span>
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
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {activeMeeting && (
        <MeetingRoom
          meetingLink={activeMeeting.meetingLink}
          displayName={user?.name || "Client"}
          onClose={() => setActiveMeeting(null)}
        />
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-int-container {
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
        .int-marquee-banner {
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

        .int-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .int-marquee-track span {
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

        .cand-card-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 32px;
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

        .date-time-text {
          font-weight: 800;
          color: #0284c7;
        }

        .location-tag {
          font-weight: 800;
          color: #0f172a;
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

        .notes-text {
          color: #64748b;
          max-width: 300px;
          font-weight: 600;
        }

        .join-meeting-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 8px 16px;
          font-weight: 800;
          font-size: 12.5px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          transition: opacity 0.2s;
        }

        .join-meeting-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .join-meeting-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #0284c7;
          font-weight: 800;
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
}