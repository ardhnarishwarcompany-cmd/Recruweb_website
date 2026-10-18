import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const statusColor = { pending: "#d97706", released: "#059669", failed: "#dc2626" };

export default function HrPartnerWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.hrPartner.getMyWallet();
      if (res?.success) setWallet(res.data);
      else setError(res?.message || "Failed to load wallet");
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="light-hr-wallet-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading wallet…
        </div>
      </div>
    );

  if (error)
    return (
      <div className="light-hr-wallet-container">
        <div className="form-error" style={{ padding: '20px', background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fecaca', borderRadius: '14px', fontWeight: '800', textAlign: 'center', margin: '40px auto', maxWidth: '600px' }}>{error}</div>
      </div>
    );

  return (
    <div className="light-hr-wallet-container">
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
      <div className="wallet-marquee-banner">
        <div className="wallet-marquee-track">
          <span>✨ Recruweb Partner Wallet &amp; Payouts Suite</span>
          <span>•</span>
          <span>💰 Real-time Earnings &amp; Secure Transaction Tracking</span>
          <span>•</span>
          <span>⭐ Fast-Track Payout Releases &amp; History</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Wallet &amp; <span className="gradient-text">Payouts</span>
          </h1>
          <p className="cand-subtitle">
            Manage your partnership earnings, active balances, and comprehensive payout history.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Balance Card */}
      <div className="cand-card-3d" style={{ maxWidth: "380px", marginBottom: "32px", padding: "28px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Current Balance</div>
          <div style={{ fontSize: "36px", fontWeight: "900", color: "#059669" }}>
            ₹{Number(wallet?.balance || 0).toLocaleString("en-IN")}
          </div>
        </div>
        <div className="card-glow-bar" style={{ background: "#059669" }}></div>
      </div>

      {/* Transaction History Card */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <h2 className="panel-heading" style={{ position: 'relative', zIndex: 2 }}>📋 Transaction History</h2>
        {!wallet?.transactions?.length ? (
          <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>No transactions yet.</div>
        ) : (
          <div className="cand-table-wrap" style={{ position: 'relative', zIndex: 2 }}>
            <table className="cand-light-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.map((t) => (
                  <tr key={t.id} className="table-row-hover">
                    <td style={{ color: "#64748b", fontWeight: "600" }}>{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                    <td><span className="pill-badge">{t.type}</span></td>
                    <td style={{ fontWeight: "900", color: "#0f172a" }}>₹{Number(t.amount).toLocaleString("en-IN")}</td>
                    <td>
                      <span className="status-pill-badge" style={{ background: t.status === 'released' ? '#ecfdf5' : t.status === 'failed' ? '#fef2f2' : '#fef3c7', color: statusColor[t.status], borderColor: t.status === 'released' ? '#a7f3d0' : t.status === 'failed' ? '#fecaca' : '#fde68a' }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ color: "#64748b", fontWeight: "600" }}>{t.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-hr-wallet-container {
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
          opacity: 0.4;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        /* Marquee Ribbon */
        .wallet-marquee-banner {
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

        .wallet-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .wallet-marquee-track span {
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
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .pill-badge {
          background: #e0e7ff;
          color: #4f46e5;
          border: 1.5px solid #c7d2fe;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11.5px;
          font-weight: 800;
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

        .status-pill-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: capitalize;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 50vh;
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
          padding: 40px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}