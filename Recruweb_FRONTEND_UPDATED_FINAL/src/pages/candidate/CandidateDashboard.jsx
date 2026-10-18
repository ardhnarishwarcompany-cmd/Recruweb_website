import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import SopDashboardCard from "../../components/SopDashboardCard";
import ScrollIndicator from "../../components/ScrollIndicator";

export default function CandidateDashboard() {
  const [profile, setProfile] = useState(null);
  const [apps, setApps] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [profileRes, appsRes] = await Promise.all([
        api.candidatePortal.getProfile(),
        api.candidatePortal.getApplications(),
      ]);
      if (profileRes?.success) setProfile(profileRes.data);
      if (appsRes?.success) setApps(appsRes.data);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="light-cand-dash-container">
        <SopDashboardCard />
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading advanced analytics...
        </div>
      </div>
    );

  const appliedCount = apps?.appliedJobs?.length ?? 0;
  const interviewScheduled =
    apps?.interviewStatus && apps?.interviewStatus !== "Not Scheduled" ? 1 : 0;
  const offerReceived =
    apps?.offerStatus && apps?.offerStatus !== "Not Released" ? 1 : 0;
  const onboardingActive =
    apps?.joiningStatus && apps?.joiningStatus !== "Not Started" ? 1 : 0;

  const cards = [
    {
      label: "Applied Jobs",
      value: appliedCount,
      to: "/candidate/applications",
      color: "#0284c7",
      trend: "Active Track",
      icon: "📑",
      chartValue: appliedCount * 25,
    },
    {
      label: "Pipeline Stage",
      value: profile?.pipelineStage || "New Lead",
      to: "/candidate/applications",
      color: "#4f46e5",
      trend: "Screening",
      icon: "🚀",
      chartValue: 65,
    },
    {
      label: "Interview Status",
      value: apps?.interviewStatus || "Not Scheduled",
      to: "/candidate/interviews",
      color: "#d97706",
      trend: "Schedule",
      icon: "📅",
      chartValue: interviewScheduled ? 90 : 20,
    },
    {
      label: "Offer Status",
      value: apps?.offerStatus || "Not Released",
      to: "/candidate/applications",
      color: "#9333ea",
      trend: "Pending",
      icon: "⭐",
      chartValue: offerReceived ? 100 : 10,
    },
    {
      label: "Joining Status",
      value: apps?.joiningStatus || "Not Started",
      to: "/candidate/onboarding",
      color: "#059669",
      trend: "Onboarding",
      icon: "⏱️",
      chartValue: onboardingActive ? 85 : 15,
    },
  ];

  const profileHealthScore =
    (profile?.resume ? 50 : 0) +
    (profile?.phone ? 30 : 0) +
    (profile?.firstName ? 20 : 0);

  return (
    <div className="light-cand-dash-container">
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

      {/* Header Banner Hub */}
      <div className="creative-header-light">
        <div className="card-bg-light-glow"></div>
        <div className="header-text-block" style={{ position: 'relative', zIndex: 2 }}>
          <div className="live-status-pill">
            <span className="pulsing-dot"></span> Candidate Intelligence Hub
          </div>
          <h1 className="cand-title">
            Welcome Back,{" "}
            <span className="gradient-text">
              {profile?.firstName || "Candidate"}
            </span>
          </h1>
          <p className="cand-subtitle">
            Advanced real-time analytics, career progression metrics, and interview readiness graphs.
          </p>
        </div>
        <div className="header-action-group" style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/candidate/profile" className="cv-action-btn primary glow-btn">
            Update Profile &amp; Resume
          </Link>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="cand-stats-grid">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="cand-stat-card-3d"
            style={{ textDecoration: "none" }}
          >
            <div className="card-bg-light-glow"></div>
            <div className="card-top-flex" style={{ position: 'relative', zIndex: 2 }}>
              <span className="card-emoji-icon">{c.icon}</span>
              <span className="card-trend-badge">{c.trend}</span>
            </div>
            <div className="stat-lbl" style={{ position: 'relative', zIndex: 2 }}>{c.label}</div>
            <div className="stat-val" style={{ color: c.color || "#0f172a", position: 'relative', zIndex: 2 }}>
              {c.value}
            </div>
            <div className="card-glow-bar" style={{ background: c.color }}></div>
          </Link>
        ))}
      </div>

      {/* Advanced Multi-Series Charts Section */}
      <div className="cand-grid-2">
        {/* Chart 1: Interactive Comparative Bar Chart Matrix */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="card-heading-3d" style={{ position: 'relative', zIndex: 2 }}>
            <span>📊 Career Progression Bar Visualizer</span>
            <span className="sub-tag">Performance Index</span>
          </div>
          <div className="graph-bars-stack" style={{ position: 'relative', zIndex: 2 }}>
            {cards.map((c) => (
              <div key={c.label} className="graph-row">
                <div className="graph-label">{c.label}</div>
                <div className="graph-track">
                  <div
                    className="graph-fill animated-bar"
                    style={{
                      width: `${Math.max(22, c.chartValue)}%`,
                      background: `linear-gradient(90deg, ${c.color}33, ${c.color})`,
                      color: '#ffffff',
                    }}
                  >
                    <span className="fill-val-text">{c.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card-glow-bar"></div>
        </div>

        {/* Chart 2: Profile Readiness & Health Score Gauge */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="card-heading-3d" style={{ position: 'relative', zIndex: 2 }}>
            <span>⭐ Recruiter Match Readiness</span>
            <span className="sub-tag">AI Evaluated</span>
          </div>

          <div className="kpi-gauge-box" style={{ position: 'relative', zIndex: 2 }}>
            <div
              className="gauge-ring-outer"
              style={{
                background: `conic-gradient(#0284c7 0% ${profileHealthScore}%, rgba(203, 213, 225, 0.4) ${profileHealthScore}% 100%)`,
              }}
            >
              <div className="gauge-ring-inner">
                <span className="gauge-score">{profileHealthScore}%</span>
                <span className="gauge-label">Readiness</span>
              </div>
            </div>
            <div className="gauge-details">
              <strong>Profile Optimization Index</strong>
              <p>
                Complete your resume and phone details to rank higher in recruiter automated matching algorithms.
              </p>
              <div className="efficiency-pills">
                <span className="pill-item">
                  🚀 Status:{" "}
                  {profileHealthScore >= 80 ? "Optimized" : "Action Needed"}
                </span>
                <span className="pill-item">⭐ Visibility: High</span>
              </div>
            </div>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      </div>

      {/* Profile Completion / Missing Data Banners */}
      {(!profile?.resume || !profile?.phone) && (
        <div className="cand-card-3d" style={{ marginTop: "24px" }}>
          <div className="card-bg-light-glow"></div>
          <div className="card-heading-3d" style={{ position: 'relative', zIndex: 2 }}>
            <span>⚠️ Action Required to Maximize Visibility</span>
          </div>
          <div className="cand-alerts-stack" style={{ position: 'relative', zIndex: 2 }}>
            {!profile?.resume && (
              <div className="alert-box-warning">
                <div className="alert-icon">📄</div>
                <div className="alert-text">
                  <strong>Your profile is missing a resume.</strong>{" "}
                  <Link to="/candidate/profile" className="alert-link">
                    Upload it now
                  </Link>{" "}
                  so recruiters can screen you for open roles.
                </div>
              </div>
            )}

            {!profile?.phone && (
              <div className="alert-box-info">
                <div className="alert-icon">📱</div>
                <div className="alert-text">
                  <strong>Add your phone number</strong> on the{" "}
                  <Link to="/candidate/profile" className="alert-link">
                    Profile tab
                  </Link>{" "}
                  so a recruiter can reach you instantly.
                </div>
              </div>
            )}
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D Styling */}
      <style>{`
        .light-cand-dash-container {
          position: relative;
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 3vw 80px;
          color: #0f172a;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        /* Floating Particles Background */
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

        .creative-header-light {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .creative-header-light:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1.5px solid rgba(16, 185, 129, 0.25);
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 800;
          color: #059669;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pulsing-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
          animation: pulse-glow 1.5s infinite;
        }

        @keyframes pulse-glow {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 1; box-shadow: 0 0 12px #10b981; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .cand-title {
          font-size: 32px;
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
          font-size: 14.5px;
          color: #64748b;
          margin: 0;
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
          text-decoration: none;
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

        .cand-stats-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .card-emoji-icon {
          font-size: 22px;
        }

        .card-trend-badge {
          font-size: 11px;
          font-weight: 800;
          background: #f1f5f9;
          color: #475569;
          padding: 3px 10px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
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
          font-size: 20px;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .cand-stat-card-3d:hover .card-glow-bar,
        .cand-card-3d:hover .card-glow-bar,
        .creative-header-light:hover .card-glow-bar {
          transform: scaleX(1);
        }

        .cand-grid-2 {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        .cand-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          border: 1.5px solid #cbd5e1;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
          display: flex;
          flex-direction: column;
        }

        .cand-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
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
          width: 130px;
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
          gap: 24px;
          flex: 1;
          justify-content: center;
        }

        .gauge-ring-outer {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px rgba(2, 132, 199, 0.2);
        }

        .gauge-ring-inner {
          width: 100px;
          height: 100px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .gauge-score {
          font-size: 24px;
          font-weight: 900;
          color: #0284c7;
        }

        .gauge-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
        }

        .gauge-details {
          flex: 1;
        }

        .gauge-details strong {
          display: block;
          font-size: 15px;
          color: #0f172a;
          margin-bottom: 6px;
          font-weight: 800;
        }

        .gauge-details p {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 14px;
          line-height: 1.5;
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
          font-size: 11.5px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 8px;
        }

        .cand-alerts-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-box-warning {
          background: #fef3c7;
          border: 1.5px solid #fde68a;
          padding: 16px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #b45309;
          font-size: 13.5px;
          font-weight: 700;
        }

        .alert-box-info {
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          padding: 16px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0369a1;
          font-size: 13.5px;
          font-weight: 700;
        }

        .alert-icon {
          font-size: 24px;
        }

        .alert-text {
          flex: 1;
        }

        .alert-link {
          color: #4f46e5;
          font-weight: 800;
          text-decoration: underline;
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

        @media (max-width: 1024px) {
          .cand-grid-2 {
            grid-template-columns: 1fr;
          }
          .kpi-gauge-box {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}