import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useGlobalPrefs } from "../../context/GlobalPrefsContext";
import { formatCurrency as formatInCurrency } from "../../utils/globalFormat";
import ScrollIndicator from "../../components/ScrollIndicator";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const funnelLabels = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  rejected: "Rejected",
};

const CEODashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currency: displayCurrency } = useGlobalPrefs();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.analytics.getCEODashboard(displayCurrency).then((res) => {
      if (!mounted) return;
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load CEO dashboard");
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [displayCurrency]);

  const revenueDisplay = data?.revenueConverted
    ? {
        collected: formatInCurrency(
          data.revenueConverted.totalCollected,
          data.revenueConverted.currency,
        ),
        outstanding: formatInCurrency(
          data.revenueConverted.totalOutstanding,
          data.revenueConverted.currency,
        ),
        note: data.revenueConverted.stale
          ? `Converted at last known rate (${new Date(data.revenueConverted.fetchedAt).toLocaleDateString()}), may be slightly stale`
          : `Live-converted from ₹ (INR) just now`,
      }
    : data
      ? {
          collected: formatCurrency(data.revenue.totalCollected),
          outstanding: formatCurrency(data.revenue.totalOutstanding),
          note:
            displayCurrency && displayCurrency !== "INR"
              ? "Showing original ₹ (INR) — live conversion unavailable"
              : null,
        }
      : { collected: "", outstanding: "", note: null };

  const headline = data
    ? [
        {
          label: "Revenue Collected",
          value: revenueDisplay.collected,
          color: "#059669",
        },
        {
          label: "Outstanding Balance",
          value: revenueDisplay.outstanding,
          color: "#dc2626",
        },
        { label: "Active Jobs", value: data.jobs.activeJobs, color: "#0284c7" },
        {
          label: "Applications (This Month)",
          value: data.applications.thisMonth,
          delta: data.applications.growthPct,
          color: "#9333ea",
        },
        {
          label: "Active Clients",
          value: data.clients.active,
          color: "#d97706",
        },
        {
          label: "New Joiners (This Month)",
          value: data.newJoinersThisMonth,
          color: "#059669",
        },
      ]
    : [];

  const maxRevenue = data
    ? Math.max(1, ...data.revenueTrend.map((r) => r.revenue))
    : 1;
  const maxFunnel = data ? Math.max(1, ...Object.values(data.funnel)) : 1;

  return (
    <div className="light-ceo-container">
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
      <div className="ceo-marquee-banner">
        <div className="ceo-marquee-track">
          <span>✨ Recruweb Enterprise CEO Executive Dashboard &amp; Analytics</span>
          <span>•</span>
          <span>📈 Live Executive Snapshot of Revenue, Hiring Pipeline &amp; Team Performance</span>
          <span>•</span>
          <span>⭐ Real-time Operations &amp; Financial Metrics</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            CEO Executive Dashboard{" "}
            <span className="gradient-text">— Analytics</span>
          </h1>
          <p className="cand-subtitle">
            Live executive snapshot of revenue, hiring pipeline &amp; team performance across operations.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {loading && (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading CEO dashboard insights...
        </div>
      )}
      {error && <div className="cand-msg-banner" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', marginBottom: '24px', position: 'relative', zIndex: 2 }}>⚠️ {error}</div>}

      {data && (
        <>
          {revenueDisplay.note && (
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: "20px",
                fontWeight: 700,
                position: 'relative',
                zIndex: 2,
              }}
            >
              🌍 {revenueDisplay.note}
            </div>
          )}

          {/* Executive Stat Cards Grid */}
          <div className="client-stats-grid" style={{ position: 'relative', zIndex: 2 }}>
            {headline.map((card) => (
              <div className="cand-stat-card-3d" key={card.label}>
                <div className="card-bg-light-glow"></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div className="stat-lbl">{card.label}</div>
                  <div
                    className="stat-val"
                    style={{ color: card.color || "#0f172a" }}
                  >
                    {card.value}
                    {typeof card.delta === "number" && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: card.delta >= 0 ? "#059669" : "#dc2626",
                          fontSize: "13px",
                          fontWeight: 900,
                        }}
                      >
                        {card.delta >= 0 ? "▲" : "▼"} {Math.abs(card.delta)}%
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="card-glow-bar"
                  style={{ background: card.color || "#0284c7" }}
                ></div>
              </div>
            ))}
          </div>

          {/* Revenue Trend Card */}
          <div className="cand-card-3d" style={{ position: 'relative', zIndex: 2, marginBottom: "28px" }}>
            <div className="card-bg-light-glow"></div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="card-heading-3d" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "18px" }}>
                📈 Revenue Trend (Last 6 Months)
              </div>
              <div className="revenue-bars-container" style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "180px", padding: "0 8px" }}>
                {data.revenueTrend.map((m) => (
                  <div key={m.month} className="revenue-col-wrap" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    <div
                      title={formatCurrency(m.revenue)}
                      className="revenue-bar-fill"
                      style={{
                        height: `${Math.max(8, (m.revenue / maxRevenue) * 140)}px`,
                        width: "55%",
                        minHeight: "4px",
                        background: "linear-gradient(180deg, #0284c7, #6366f1)",
                        borderRadius: "8px 8px 0 0",
                        boxShadow: "0 4px 15px rgba(2, 132, 199, 0.25)",
                        transition: "height 0.3s ease",
                      }}
                    />
                    <div className="revenue-month-lbl" style={{ fontSize: "12px", marginTop: "10px", color: "#64748b", fontWeight: "800" }}>{m.month}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-glow-bar"></div>
          </div>

          {/* Hiring Funnel Card */}
          <div className="cand-card-3d" style={{ position: 'relative', zIndex: 2, marginBottom: "28px" }}>
            <div className="card-bg-light-glow"></div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="card-heading-3d" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "18px" }}>
                🎯 Hiring Funnel (Applied Candidate Module)
              </div>
              <div className="funnel-stack" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(data.funnel).map(([status, count]) => (
                  <div key={status} className="funnel-row" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div className="funnel-label-col" style={{ width: "120px", fontSize: "13.5px", fontWeight: "800", color: "#334155" }}>
                      {funnelLabels[status] || status}
                    </div>
                    <div className="funnel-bar-track" style={{ flex: 1, background: "#f1f5f9", border: "1.5px solid #cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
                      <div
                        className="funnel-bar-fill"
                        style={{
                          width: `${Math.max(6, (count / maxFunnel) * 100)}%`,
                          background: "linear-gradient(135deg, #0284c7, #6366f1)",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: "900",
                          padding: "6px 12px",
                          borderRadius: "10px",
                          boxShadow: "0 4px 15px rgba(2, 132, 199, 0.25)",
                        }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-glow-bar"></div>
          </div>

          {/* Two Column Grid: Leaderboard & Top Clients */}
          <div className="client-grid-2" style={{ position: 'relative', zIndex: 2 }}>
            {/* Recruiter Leaderboard */}
            <div className="cand-card-3d">
              <div className="card-bg-light-glow"></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="card-heading-3d" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>🏆 Recruiter Leaderboard</div>
                {data.recruiterLeaderboard.length === 0 ? (
                  <div className="cand-empty-state">No assigned candidates yet</div>
                ) : (
                  <div className="cand-table-wrap">
                    <table className="cand-light-table">
                      <thead>
                        <tr>
                          <th>Recruiter Name</th>
                          <th>Assigned</th>
                          <th>Offers Made</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recruiterLeaderboard.map((r) => (
                          <tr key={r.id} className="table-row-hover">
                            <td>
                              <strong style={{ color: "#0f172a", fontWeight: "900" }}>{r.name}</strong>
                            </td>
                            <td>
                              <span className="badge-pill-cyan" style={{ background: "#e0f2fe", color: "#0284c7", fontSize: "11.5px", fontWeight: "900", padding: "4px 11px", borderRadius: "12px", border: "1.5px solid #bae6fd" }}>
                                {r.assignedCandidates}
                              </span>
                            </td>
                            <td>
                              <span className="badge-pill-green" style={{ background: "#ecfdf5", color: "#059669", fontSize: "11.5px", fontWeight: "900", padding: "4px 11px", borderRadius: "12px", border: "1.5px solid #a7f3d0" }}>
                                {r.offersMade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="card-glow-bar"></div>
            </div>

            {/* Top Clients by Revenue */}
            <div className="cand-card-3d">
              <div className="card-bg-light-glow"></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="card-heading-3d" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>🏢 Top Clients by Revenue</div>
                {data.topClients.length === 0 ? (
                  <div className="cand-empty-state">No payments recorded yet</div>
                ) : (
                  <div className="cand-table-wrap">
                    <table className="cand-light-table">
                      <thead>
                        <tr>
                          <th>Client Account</th>
                          <th>Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topClients.map((c) => (
                          <tr key={c.clientId} className="table-row-hover">
                            <td>
                              <strong style={{ color: "#0f172a", fontWeight: "900" }}>{c.name}</strong>
                            </td>
                            <td>
                              <span
                                style={{ color: "#059669", fontWeight: "900" }}
                              >
                                {formatCurrency(c.revenue)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="card-glow-bar"></div>
            </div>
          </div>
        </>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-ceo-container {
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
        .ceo-marquee-banner {
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

        .ceo-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .ceo-marquee-track span {
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

        .client-stats-grid {
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

        .stat-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-val {
          font-size: 22px;
          font-weight: 900;
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

        .client-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
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
          padding: 60px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .client-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CEODashboard;