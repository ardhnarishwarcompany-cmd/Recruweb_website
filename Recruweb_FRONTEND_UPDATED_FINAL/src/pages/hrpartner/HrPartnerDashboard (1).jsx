import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import SopDashboardCard from "../../components/SopDashboardCard";
import ScrollIndicator from "../../components/ScrollIndicator";

export default function HrPartnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.hrPartner.getMyDashboard();
      if (response?.success) {
        setData(response.data);
      } else {
        setError(response?.message || "Unable to load dashboard");
      }
    } catch (err) {
      setError(err?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading)
    return (
      <div className="light-hr-dash-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading your HR dashboard…
        </div>
      </div>
    );

  if (error)
    return (
      <div className="light-hr-dash-container">
        <div className="form-error" style={{ padding: '20px', background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fecaca', borderRadius: '14px', fontWeight: '800', textAlign: 'center', margin: '40px auto', maxWidth: '600px' }}>{error}</div>
      </div>
    );

  const profile = data?.profile;
  const stats = data?.stats || {};

  const cardItems = [
    { label: "Open Vacancies", value: stats.openVacancies ?? 0, color: "#0284c7", icon: "📋" },
    { label: "My Submissions", value: stats.submissions ?? 0, color: "#4f46e5", icon: "📤" },
    { label: "Pending Review", value: stats.pendingSubmissions ?? 0, color: "#d97706", icon: "⏳" },
    { label: "Client Approved", value: stats.approvedSubmissions ?? 0, color: "#059669", icon: "✅" },
    { label: "KYC Pending", value: stats.kycPending ?? 0, color: "#ea580c", icon: "🪪" },
    { label: "Wallet Balance", value: `₹${Number(stats.walletBalance || 0).toLocaleString("en-IN")}`, color: "#9333ea", icon: "💰" },
  ];

  return (
    <div className="light-hr-dash-container">
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
      <div className="hr-marquee-banner">
        <div className="hr-marquee-track">
          <span>✨ Recruweb HR Partner Partnership Suite</span>
          <span>•</span>
          <span>💼 Live Vacancies &amp; Candidate Sourcing Hub</span>
          <span>•</span>
          <span>⭐ Real-time Wallet Earnings &amp; KYC Tracking</span>
        </div>
      </div>

      <SopDashboardCard />

      <div className="cand-header-3d" style={{ marginTop: '20px' }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <span className="cand-eyebrow">HR PARTNER PORTAL</span>
            <h1 className="cand-title" style={{ marginTop: '4px' }}>Welcome, {profile?.user?.name || "HR Partner"}</h1>
            <p className="cand-subtitle">
              One live workspace for vacancies, candidate submissions, KYC, wallet and Admin communication.
            </p>
          </div>
          <span className={`status-badge-custom ${profile?.status || "pending"}`}>
            {profile?.status || "pending"}
          </span>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <div className="cand-stats-grid">
        {cardItems.map((c) => (
          <div className="cand-stat-card-3d" key={c.label}>
            <div className="card-bg-light-glow"></div>
            <div className="card-top-flex" style={{ position: 'relative', zIndex: 2 }}>
              <span className="card-emoji-icon">{c.icon}</span>
            </div>
            <div className="stat-lbl" style={{ position: 'relative', zIndex: 2 }}>{c.label}</div>
            <div className="stat-val" style={{ color: c.color, position: 'relative', zIndex: 2 }}>{c.value}</div>
            <div className="card-glow-bar" style={{ background: c.color }}></div>
          </div>
        ))}
      </div>

      {profile?.status === "pending" && (
        <div className="cand-card-3d" style={{ background: '#fef3c7', borderColor: '#fde68a', padding: '20px 28px', marginTop: '24px' }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2, color: '#92400e', fontWeight: '800', fontSize: '14px' }}>
            ⚠️ Your HR Partner account is awaiting Admin approval. Complete KYC to keep the approval workflow moving.
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-hr-dash-container {
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
        .hr-marquee-banner {
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

        .hr-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .hr-marquee-track span {
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
        .cand-stat-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        .cand-eyebrow {
          font-size: 11.5px;
          font-weight: 900;
          color: #4f46e5;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .cand-title {
          font-size: 30px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .status-badge-custom {
          padding: 6px 16px;
          border-radius: 20px;
          text-transform: capitalize;
          font-size: 12px;
          font-weight: 800;
          border: 1.5px solid;
        }
        .status-badge-custom.approved { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .status-badge-custom.pending { background: #fef3c7; color: #d97706; border-color: #fde68a; }
        .status-badge-custom.rejected { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

        .cand-stats-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
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
          margin-bottom: 10px;
        }

        .card-emoji-icon {
          font-size: 24px;
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
          font-size: 24px;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
      `}</style>
    </div>
  );
}