import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

export default function ClientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.clientPortal.getDashboard().then((res) => {
      if (res?.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="light-client-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Initializing Executive Intelligence Hub...
        </div>
      </div>
    );

  const cards = [
    {
      label: "Open Positions",
      value: data?.openPositions ?? 0,
      to: "/client/requirements",
      color: "#0284c7",
      trend: "+15.8% this month",
      icon: "🎯",
    },
    {
      label: "Total Requirements",
      value: data?.totalRequirements ?? 0,
      to: "/client/requirements",
      color: "#4f46e5",
      trend: "Active Pipeline",
      icon: "📑",
    },
    {
      label: "Candidate Submissions",
      value: data?.candidateSubmissions ?? 0,
      to: "/client/submissions",
      color: "#9333ea",
      trend: "AI Screened",
      icon: "👥",
    },
    {
      label: "Upcoming Interviews",
      value: data?.upcomingInterviews ?? 0,
      to: "/client/interviews",
      color: "#d97706",
      trend: "Scheduled",
      icon: "📅",
    },
    {
      label: "Offers Awaiting Approval",
      value: data?.pendingOfferApprovals ?? 0,
      to: "/client/submissions",
      color: "#dc2626",
      trend: "Action Required",
      icon: "⚡",
    },
    {
      label: "Unread Messages",
      value: data?.unreadMessages ?? 0,
      to: "/client/chat",
      color: "#059669",
      trend: "Live Chat",
      icon: "💬",
    },
  ];

  const maxMetric = Math.max(
    1,
    data?.openPositions || 0,
    data?.totalRequirements || 0,
    data?.candidateSubmissions || 0,
    data?.upcomingInterviews || 0,
    data?.pendingOfferApprovals || 0,
    data?.unreadMessages || 0,
  );

  const conversionScore = data?.totalRequirements
    ? Math.min(
        100,
        Math.round(
          ((data?.candidateSubmissions || 0) / (data?.totalRequirements * 3)) *
            100,
        ),
      )
    : 82;

  return (
    <div className="light-client-container">
      {/* Live Floating Particles Background */}
      <div className="cand-particles-container">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="cand-particle"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + ((i * 17) % 70)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${10 + (i % 5)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Marquee Banner */}
      <div className="client-marquee-banner">
        <div className="client-marquee-track">
          <span>✨ Recruweb Corporate Client Executive Intelligence Hub</span>
          <span>•</span>
          <span>🎯 Real-time Hiring Velocity &amp; Candidate Sourcing Metrics</span>
          <span>•</span>
          <span>⭐ Automated AI Screening &amp; Corporate Sign-off Workflows</span>
        </div>
      </div>

      {/* Header Banner Hub */}
      <div className="cand-header-3d" style={{ marginBottom: "20px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div className="header-text-block">
            <div className="live-status-pill">
              <span className="pulsing-dot"></span> Live Corporate Portal
            </div>
            <h1 className="cand-title" style={{ marginTop: '4px' }}>
              Welcome Back,{" "}
              <span className="gradient-text">
                {data?.clientName || "Corporate Partner"}
              </span>
            </h1>
            <p className="cand-subtitle">
              Your real-time hiring ecosystem, candidate velocity metrics, and corporate approvals synchronized.
            </p>
          </div>
          <div className="header-action-group">
            <Link to="/client/requirements" className="cv-action-btn primary glow-btn" style={{ textDecoration: 'none' }}>
              + New Requirement ✨
            </Link>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Styled Policy Center / SOP Dashboard Card */}
      <div className="cand-card-3d" style={{ marginBottom: "24px", padding: "24px 32px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #0284c7, #6366f1)", borderRadius: "14px", display: "grid", placeItems: "center", fontSize: "24px", color: "#fff", boxShadow: "0 4px 15px rgba(2, 132, 199, 0.3)" }}>📘</div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "900", color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.5px" }}>Policy Center</span>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "2px 0 4px" }}>SOPs &amp; Operating Procedures</h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "600" }}>Access every approved SOP, open the full process instantly, and keep your policy approvals in one place.</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ background: "#f1f5f9", border: "1.5px solid #cbd5e1", padding: "8px 14px", borderRadius: "12px", textAlign: "center" }}>
              <strong style={{ display: "block", fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>2</strong>
              <small style={{ fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Live SOPs</small>
            </div>
            <div style={{ background: "#f1f5f9", border: "1.5px solid #cbd5e1", padding: "8px 14px", borderRadius: "12px", textAlign: "center" }}>
              <strong style={{ display: "block", fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>0</strong>
              <small style={{ fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Inbox Actions</small>
            </div>
            <Link to="/client/sops" className="cv-action-btn secondary" style={{ textDecoration: "none", fontSize: "13px" }}>
              View all SOPs →
            </Link>
            <Link to="/client/sop-inbox" className="cv-action-btn primary glow-btn" style={{ textDecoration: "none", fontSize: "13px" }}>
              Open SOP Inbox →
            </Link>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="client-stats-grid">
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
            <div
              className="card-glow-bar"
              style={{ background: c.color || "#6366f1" }}
            ></div>
          </Link>
        ))}
      </div>

      {/* Multi-Series Analytics Section */}
      <div className="client-grid-2" style={{ marginTop: "24px" }}>
        {/* Graph 1: Pipeline Distribution Bar Matrix */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="card-heading-3d" style={{ position: 'relative', zIndex: 2 }}>
            <span>📊 Recruitment Pipeline Distribution</span>
            <span className="sub-tag">Active Metrics</span>
          </div>
          <div className="graph-bars-stack" style={{ position: 'relative', zIndex: 2 }}>
            {cards.map((c) => (
              <div key={c.label} className="graph-row">
                <div className="graph-label">{c.label}</div>
                <div className="graph-track">
                  <div
                    className="graph-fill"
                    style={{
                      width: `${Math.max(15, (c.value / maxMetric) * 100)}%`,
                      background: `linear-gradient(90deg, ${c.color}33, ${c.color})`,
                      color: "#ffffff",
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

        {/* Graph 2: Hiring Velocity & Conversion Efficiency Gauge */}
        <div className="cand-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="card-heading-3d" style={{ position: 'relative', zIndex: 2 }}>
            <span>⚡ Hiring Velocity &amp; Efficiency</span>
            <span className="sub-tag">AI Evaluated</span>
          </div>

          <div className="kpi-gauge-box" style={{ position: 'relative', zIndex: 2 }}>
            <div
              className="gauge-ring-outer"
              style={{
                background: `conic-gradient(#059669 0% ${conversionScore}%, rgba(203, 213, 225, 0.4) 0% 100%)`,
              }}
            >
              <div className="gauge-ring-inner">
                <span className="gauge-score">{conversionScore}%</span>
                <span className="gauge-label">Health</span>
              </div>
            </div>
            <div className="gauge-details">
              <strong>Optimal Pipeline Velocity</strong>
              <p>
                Your open requisitions are experiencing accelerated candidate matching through automated AI audits.
              </p>
              <div className="efficiency-pills">
                <span className="pill-item">🚀 Sourcing: Active</span>
                <span className="pill-item">⭐ Quality: 4.9/5</span>
              </div>
            </div>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      </div>

      {/* Bottom Urgent Corporate Actions Hub */}
      <div className="cand-card-3d" style={{ marginTop: "28px" }}>
        <div className="card-bg-light-glow"></div>
        <div className="card-heading-3d" style={{ position: 'relative', zIndex: 2 }}>
          <span>🚀 Corporate Governance &amp; Action Hub</span>
        </div>
        <div className="action-hub-content-flex" style={{ position: 'relative', zIndex: 2 }}>
          {data?.pendingOfferApprovals > 0 ? (
            <div className="alert-box-urgent">
              <div className="alert-icon">⚠️</div>
              <div className="alert-text">
                <strong>{data.pendingOfferApprovals} candidate offer(s)</strong>{" "}
                require your official corporate sign-off.
              </div>
              <Link to="/client/submissions" className="btn-alert-action">
                Approve Offers
              </Link>
            </div>
          ) : (
            <div className="alert-box-success">
              <div className="alert-icon">✅</div>
              <div className="alert-text">
                All candidate offers are synchronized and fully approved. Zero pending bottlenecks.
              </div>
            </div>
          )}

          <div className="new-role-card-box">
            <div className="role-box-icon">💼</div>
            <div className="role-box-info">
              <strong>Scale Your Enterprise Team</strong>
              <p>
                Create new job specifications instantly and let your dedicated account managers initiate executive search.
              </p>
            </div>
            <Link to="/client/requirements" className="btn-role-action">
              + Post Requirement
            </Link>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-client-container {
          position: relative;
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 3vw 80px;
          color: #0f172a;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

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
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          border-radius: 50%;
          opacity: 0.4;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        .client-marquee-banner {
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

        .client-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .client-marquee-track span {
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
          box-shadow: 0 20px 50px rgba(56, 189, 248, 0.14);
          border-color: rgba(56, 189, 248, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #38bdf8, #6366f1);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .cand-header-3d:hover .card-glow-bar,
        .cand-card-3d:hover .card-glow-bar,
        .cand-stat-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        .live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ecfdf5;
          border: 1.5px solid #a7f3d0;
          color: #059669;
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pulsing-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          box-shadow: 0 0 10px #059669;
          animation: pulse-glow 1.5s infinite;
        }

        @keyframes pulse-glow {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 1; box-shadow: 0 0 15px #059669; }
          100% { transform: scale(0.95); opacity: 0.8; }
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
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          box-shadow: 0 6px 18px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.4);
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

        .client-stats-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .cand-stat-card-3d {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 22px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-stat-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(56, 189, 248, 0.14);
          border-color: rgba(56, 189, 248, 0.4);
        }

        .card-top-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .card-emoji-icon {
          font-size: 24px;
        }

        .card-trend-badge {
          font-size: 11px;
          font-weight: 800;
          background: #f1f5f9;
          color: #475569;
          border: 1.5px solid #cbd5e1;
          padding: 3px 8px;
          border-radius: 10px;
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
          font-size: 26px;
          font-weight: 900;
        }

        .client-grid-2 {
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
          box-shadow: 0 20px 50px rgba(56, 189, 248, 0.14);
          border-color: rgba(56, 189, 248, 0.4);
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
          color: #0284c7;
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          padding: 4px 10px;
          border-radius: 10px;
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
          width: 160px;
          font-size: 13px;
          font-weight: 800;
          color: #334155;
        }

        .graph-track {
          flex: 1;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          overflow: hidden;
          padding: 2px;
        }

        .graph-fill {
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
          box-shadow: 0 0 20px rgba(5, 150, 105, 0.2);
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
          margin: 0 0 12px;
          line-height: 1.4;
          font-weight: 600;
        }

        .efficiency-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pill-item {
          background: #e0f2fe;
          color: #0284c7;
          border: 1.5px solid #bae6fd;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .action-hub-content-flex {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .alert-box-urgent {
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          padding: 18px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
        }

        .alert-box-success {
          background: #ecfdf5;
          border: 1.5px solid #a7f3d0;
          padding: 18px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #059669;
          font-size: 13.5px;
          font-weight: 800;
        }

        .alert-icon {
          font-size: 24px;
        }

        .alert-text {
          flex: 1;
          font-size: 13.5px;
          color: #991b1b;
          font-weight: 700;
        }

        .btn-alert-action {
          background: #dc2626;
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
        }

        .new-role-card-box {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          padding: 18px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .role-box-icon {
          font-size: 30px;
        }

        .role-box-info {
          flex: 1;
        }

        .role-box-info strong {
          display: block;
          font-size: 14px;
          color: #0f172a;
          margin-bottom: 2px;
          font-weight: 900;
        }

        .role-box-info p {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .btn-role-action {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
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

        @media (max-width: 1024px) {
          .client-grid-2, .action-hub-content-flex {
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