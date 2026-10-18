import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { getSocket } from "../../utils/socket";
import ScrollIndicator from "../../components/ScrollIndicator";

export default function CandidateJoiningTracker() {
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await api.candidatePortal.getTracker();
        if (!alive) return;
        if (res?.success) {
          setTracker(res.data);
          setError("");
        } else {
          setError(res?.message || "Failed to load your joining tracker.");
        }
      } catch (err) {
        if (alive) setError(err?.message || "Failed to load your joining tracker.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    const timer = window.setInterval(load, 10000);
    const socket = getSocket();
    socket?.on("tracker:update", load);

    return () => {
      alive = false;
      window.clearInterval(timer);
      socket?.off("tracker:update", load);
    };
  }, []);

  if (loading) {
    return (
      <div className="light-track-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading your career timeline...
        </div>
      </div>
    );
  }

  const milestones = Array.isArray(tracker?.steps)
    ? tracker.steps.map((step, index) => ({
        stage: `Phase ${String(index + 1).padStart(2, "0")}`,
        title: step.label,
        desc:
          step.note ||
          (step.status === "complete"
            ? "Completed from your live recruitment record."
            : step.status === "pending"
              ? "This stage is currently active or awaiting review."
              : step.status === "rejected"
                ? "This stage was rejected. Please follow the action shown in the portal."
                : "This stage has not been reached yet."),
        icon:
          {
            applied: "📑",
            interview: "🎥",
            offer: "⭐",
            documents: "📁",
            verification: "🔍",
            "joining-form": "📝",
            joined: "🚀",
          }[step.key] || "📍",
        status:
          step.status === "complete"
            ? "completed"
            : step.status === "rejected"
              ? "pending"
              : step.status === "pending"
                ? "in-progress"
                : "pending",
        date: step.date,
      }))
    : [];

  return (
    <div className="light-track-container">
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
      <div className="track-marquee-banner">
        <div className="track-marquee-track">
          <span>✨ Live Recruitment Lifecycle &amp; Onboarding Tracker</span>
          <span>•</span>
          <span>🚀 Real-time Pipeline Progress &amp; Milestone Updates</span>
          <span>•</span>
          <span>⭐ Verified Document Status &amp; Joining Readiness</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Joining Tracker{" "}
            <span className="gradient-text">— Live Career Timeline</span>
          </h1>
          <p className="cand-subtitle">
            Monitor your live recruitment lifecycle, pipeline stage, and onboarding progress with high-end visual tracking.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {error && (
        <div className="alert-box-urgent" style={{ marginBottom: "20px" }}>
          <div className="alert-icon">⚠️</div>
          <div className="alert-text">{error}</div>
        </div>
      )}

      {tracker && (
        <div className="cand-card-3d" style={{ padding: '36px' }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Summary KPI Cards Grid */}
            <div className="stats-grid-custom">
              <SummaryStat
                label="Current Stage"
                value={tracker.pipelineStage}
                color="#0284c7"
              />
              <SummaryStat
                label="Joining Form"
                value={tracker.joiningStatus || "Not submitted"}
                color="#4f46e5"
              />
              <SummaryStat
                label="Documents Verified"
                value={`${tracker.documentsSummary?.verified || 0} / ${tracker.documentsSummary?.total || 0}`}
                color="#059669"
              />
              <SummaryStat
                label="Documents Rejected"
                value={tracker.documentsSummary?.rejected || 0}
                color="#dc2626"
              />
            </div>

            {tracker.documentsSummary?.rejected > 0 && (
              <div
                className="alert-box-urgent"
                style={{ marginTop: "24px", marginBottom: "20px" }}
              >
                <div className="alert-icon">⚠️</div>
                <div className="alert-text">
                  One or more of your documents were rejected. Please check your{" "}
                  <strong>Profile tab</strong> to re-upload them.
                </div>
              </div>
            )}

            {/* Interactive Vertical Timeline */}
            <div className="timeline-container">
              <div className="timeline-center-line"></div>
              {milestones.map((m, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={m.title}
                    className={`timeline-row ${isEven ? "left-side" : "right-side"}`}
                  >
                    <div className="timeline-content-card">
                      <div className="timeline-card-header">
                        <span className="timeline-year-tag">{m.stage}</span>
                        <span className={`timeline-badge ${m.status}`}>
                          {m.status}
                        </span>
                      </div>
                      <h3 className="timeline-card-title">{m.title}</h3>
                      <p className="timeline-card-desc">{m.desc}</p>
                    </div>

                    <div className={`timeline-node-icon ${m.status}`}>
                      <span className="node-emoji">{m.icon}</span>
                    </div>

                    <div className="timeline-empty-spacer"></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-track-container {
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
        .track-marquee-banner {
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

        .track-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .track-marquee-track span {
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
          margin-bottom: 28px;
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
          padding: 32px;
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

        .stats-grid-custom {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .summary-stat-card {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 16px;
          padding: 18px;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .summary-stat-card:hover {
          transform: translateY(-4px);
          border-color: #6366f1;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
        }

        .stat-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .stat-val {
          font-size: 17px;
          font-weight: 900;
          text-transform: capitalize;
        }

        .stat-glow-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
        }

        /* Vertical Timeline Layout */
        .timeline-container {
          position: relative;
          margin: 50px 0 20px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .timeline-center-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 4px;
          background: linear-gradient(180deg, #6366f1 0%, #a855f7 50%, #cbd5e1 100%);
          transform: translateX(-50%);
          border-radius: 4px;
        }

        .timeline-row {
          display: flex;
          align-items: center;
          width: 100%;
          position: relative;
        }

        .left-side {
          flex-direction: row;
        }

        .right-side {
          flex-direction: row-reverse;
        }

        /* Floating Hover Animated Cards */
        .timeline-content-card {
          width: 44%;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .timeline-content-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 45px rgba(99, 102, 241, 0.2);
          border-color: #6366f1;
        }

        .timeline-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .timeline-year-tag {
          font-size: 13px;
          font-weight: 900;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .timeline-card-title {
          font-size: 17px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
        }

        .timeline-card-desc {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
          font-weight: 600;
        }

        /* Glowing Center Nodes with Pulse Effect */
        .timeline-node-icon {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          z-index: 3;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.1);
          transition: transform 0.3s ease;
        }

        .timeline-content-card:hover ~ .timeline-node-icon,
        .timeline-node-icon:hover {
          transform: translateX(-50%) scale(1.15);
        }

        .timeline-node-icon.completed {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);
        }

        .timeline-node-icon.in-progress {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #ffffff;
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
          animation: pulse-node 2s infinite;
        }

        .timeline-node-icon.pending {
          background: #e2e8f0;
          color: #64748b;
        }

        @keyframes pulse-node {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }

        .timeline-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timeline-badge.completed {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .timeline-badge.in-progress {
          background: #e0e7ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
        }

        .timeline-badge.pending {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
        }

        .timeline-empty-spacer {
          width: 44%;
        }

        .alert-box-urgent {
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          padding: 16px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
        }

        .alert-icon {
          font-size: 22px;
        }

        .alert-text {
          flex: 1;
          font-size: 13.5px;
          color: #991b1b;
        }

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

        @media (max-width: 768px) {
          .timeline-center-line {
            left: 24px;
          }
          .timeline-row, .right-side {
            flex-direction: row;
            justify-content: flex-end;
          }
          .timeline-content-card {
            width: calc(100% - 65px);
          }
          .timeline-node-icon {
            left: 24px;
          }
          .timeline-empty-spacer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

const SummaryStat = ({ label, value, color }) => (
  <div className="summary-stat-card">
    <div className="stat-lbl">{label}</div>
    <div className="stat-val" style={{ color: color || "#0f172a" }}>
      {value}
    </div>
    <div
      className="stat-glow-line"
      style={{ background: color || "#6366f1" }}
    ></div>
  </div>
);