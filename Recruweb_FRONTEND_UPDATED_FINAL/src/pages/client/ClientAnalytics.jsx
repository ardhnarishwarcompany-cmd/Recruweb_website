import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

// Client Analytics — merged in from D RTPN's client analytics endpoint.
export default function ClientAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.clientPortal.getAnalytics();
      if (res?.success) setData(res.data);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="light-analytics-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading analytics…
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="light-analytics-container">
        <div className="cand-empty-state">No analytics available.</div>
      </div>
    );

  const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

  return (
    <div className="light-analytics-container">
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
      <div className="analytics-marquee-banner">
        <div className="analytics-marquee-track">
          <span>✨ Recruweb Corporate Analytics &amp; Intelligence Hub</span>
          <span>•</span>
          <span>📊 Real-time Requirements, Pipeline Funnel &amp; Financials</span>
          <span>•</span>
          <span>⭐ Enterprise Performance Metrics &amp; Invoice Breakdown</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "28px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Corporate <span className="gradient-text">Analytics</span>
          </h1>
          <p className="cand-subtitle">
            Comprehensive breakdown of requirements status, candidate submission funnels, and corporate invoices.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Requirements by Status */}
      <h2 className="panel-heading" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>📊 Requirements by Status</h2>
      <div className="analytics-grid" style={{ position: 'relative', zIndex: 2, marginBottom: "32px" }}>
        {Object.entries(data.requirementStatusCounts).map(([status, count]) => (
          <div key={status} className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="stat-lbl" style={{ position: 'relative', zIndex: 2, textTransform: "capitalize" }}>{status}</div>
            <div className="stat-val" style={{ position: 'relative', zIndex: 2, color: "#0284c7" }}>{count}</div>
            <div className="card-glow-bar" style={{ background: "#0284c7" }}></div>
          </div>
        ))}
        {!Object.keys(data.requirementStatusCounts).length && (
          <div className="cand-empty-state" style={{ gridColumn: "1 / -1" }}>No requirements yet.</div>
        )}
      </div>

      {/* Candidate Submission Funnel */}
      <h2 className="panel-heading" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>👥 Candidate Submission Funnel</h2>
      <div className="analytics-grid" style={{ position: 'relative', zIndex: 2, marginBottom: "32px" }}>
        {Object.entries(data.submissionFunnel).map(([stage, count]) => (
          <div key={stage} className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="stat-lbl" style={{ position: 'relative', zIndex: 2, textTransform: "capitalize" }}>{stage.replace(/-/g, " ")}</div>
            <div className="stat-val" style={{ position: 'relative', zIndex: 2, color: "#4f46e5" }}>{count}</div>
            <div className="card-glow-bar" style={{ background: "#4f46e5" }}></div>
          </div>
        ))}
      </div>

      {/* Invoices Breakdown */}
      <h2 className="panel-heading" style={{ position: 'relative', zIndex: 2, marginBottom: "16px" }}>🧾 Invoices &amp; Financial Summary</h2>
      <div className="analytics-grid" style={{ position: 'relative', zIndex: 2 }}>
        <div className="cand-stat-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="stat-lbl" style={{ position: 'relative', zIndex: 2 }}>Total Billed</div>
          <div className="stat-val" style={{ position: 'relative', zIndex: 2, color: "#0f172a" }}>{fmt(data.invoices.totalBilled)}</div>
          <div className="card-glow-bar" style={{ background: "#64748b" }}></div>
        </div>
        <div className="cand-stat-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="stat-lbl" style={{ position: 'relative', zIndex: 2 }}>Total Paid</div>
          <div className="stat-val" style={{ position: 'relative', zIndex: 2, color: "#059669" }}>{fmt(data.invoices.totalPaid)}</div>
          <div className="card-glow-bar" style={{ background: "#059669" }}></div>
        </div>
        <div className="cand-stat-card-3d">
          <div className="card-bg-light-glow"></div>
          <div className="stat-lbl" style={{ position: 'relative', zIndex: 2 }}>Outstanding</div>
          <div className="stat-val" style={{ position: 'relative', zIndex: 2, color: "#d97706" }}>{fmt(data.invoices.totalOutstanding)}</div>
          <div className="card-glow-bar" style={{ background: "#d97706" }}></div>
        </div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-analytics-container {
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
        .analytics-marquee-banner {
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

        .analytics-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .analytics-marquee-track span {
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
        .cand-stat-card-3d:hover .card-glow-bar {
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

        .panel-heading {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .cand-stat-card-3d {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 22px 24px;
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

        .stat-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .stat-val {
          font-size: 26px;
          font-weight: 900;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 50vh;
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

        .cand-empty-state {
          text-align: center;
          padding: 40px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}