import React from "react";

const ICONS = {
  applied: "📋",
  interview: "🎯",
  offer: "📜",
  documents: "📁",
  verification: "🔍",
  "joining-form": "📝",
  joined: "🚀",
};

const JoiningTrackerStepper = ({ tracker = {} }) => {
  const steps = Array.isArray(tracker?.steps) ? tracker.steps : [];
  const progress = tracker?.progress || {};

  if (!steps.length) {
    return (
      <div className="tracker-empty-state">
        No recruitment activity is available yet. This tracker will update
        automatically when a real candidate event is recorded.
      </div>
    );
  }

  return (
    <>
      <style>{`
        .tracker-stepper-container {
          width: 100%;
          padding: 4px 0;
        }

        .tracker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        .tracker-card-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .tracker-card-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }

        .tracker-card-item.completed {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.25);
        }

        .tracker-card-item.active {
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
        }

        .tracker-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .step-badge-num {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
        }

        .step-icon {
          font-size: 16px;
        }

        .status-indicator-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .status-indicator-pill.done {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-indicator-pill.current {
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.4);
        }

        .status-indicator-pill.upcoming {
          background: rgba(255, 255, 255, 0.04);
          color: #64748b;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tracker-card-body {
          display: flex;
          flex-direction: column;
        }

        .tracker-step-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 4px 0;
        }

        .tracker-step-date {
          font-size: 11.5px;
          color: #94a3b8;
          margin: 0;
          font-weight: 500;
        }

        .tracker-sub-info {
          font-size: 11px;
          color: #38bdf8;
          margin-top: 4px;
          font-weight: 600;
        }

        .card-glow-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.08);
        }

        .tracker-card-item.completed .card-glow-line {
          background: #10b981;
        }

        .tracker-card-item.active .card-glow-line {
          background: #6366f1;
        }

        .tracker-progress-summary { display:flex; justify-content:space-between; gap:12px; margin-bottom:14px; color:#94a3b8; font-size:12px; }
        .tracker-progress-summary strong { color:#34d399; font-size:14px; }
        .tracker-card-item.rejected { background:rgba(244,63,94,.06); border-color:rgba(244,63,94,.35); }
        .status-indicator-pill.rejected { background:rgba(244,63,94,.15); color:#fb7185; border:1px solid rgba(244,63,94,.3); }
        .tracker-empty-state { padding:16px; border:1px dashed rgba(255,255,255,.12); border-radius:14px; color:#94a3b8; font-size:13px; }
      `}</style>
      <div className="tracker-stepper-container">
      <div className="tracker-progress-summary">
        <strong>{progress.percent ?? 0}% complete</strong>
        <span>
          {progress.completed ?? 0} of {progress.total ?? steps.length} stages
          completed
        </span>
      </div>

      <div className="tracker-grid">
        {steps.map((step, idx) => {
          const isDone = step.status === "complete";
          const isRejected = step.status === "rejected";
          const isCurrent = step.status === "pending";

          return (
            <div
              key={step.key || idx}
              className={`tracker-card-item ${isDone ? "completed" : ""} ${
                isCurrent ? "active" : ""
              } ${isRejected ? "rejected" : ""}`}
            >
              <div className="tracker-card-header">
                <span className="step-badge-num">{idx + 1}</span>
                <span className="step-icon">
                  {ICONS[step.key] || "📍"}
                </span>
                <span
                  className={`status-indicator-pill ${
                    isDone
                      ? "done"
                      : isRejected
                        ? "rejected"
                        : isCurrent
                          ? "current"
                          : "upcoming"
                  }`}
                >
                  {isDone
                    ? "Done"
                    : isRejected
                      ? "Rejected"
                      : isCurrent
                        ? "Active"
                        : "Upcoming"}
                </span>
              </div>

              <div className="tracker-card-body">
                <h5 className="tracker-step-title">{step.label}</h5>
                <p className="tracker-step-date">
                  {step.date
                    ? new Date(step.date).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : isDone
                      ? "Completed"
                      : "Pending"}
                </p>
                {step.note && (
                  <span className="tracker-sub-info">{step.note}</span>
                )}
              </div>

              <div className="card-glow-line" />
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default JoiningTrackerStepper;
