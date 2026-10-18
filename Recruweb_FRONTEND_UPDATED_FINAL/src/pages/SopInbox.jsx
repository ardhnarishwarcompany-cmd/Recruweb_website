import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import ScrollIndicator from "../components/ScrollIndicator";

export default function SopInbox() {
  const [items, setItems] = useState([]);
  const location = useLocation();
  const portalBase = location.pathname.startsWith("/admin") ? "/admin" : location.pathname.startsWith("/candidate") ? "/candidate" : location.pathname.startsWith("/client") ? "/client" : location.pathname.startsWith("/hr-partner") ? "/hr-partner" : "";
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.sops.inbox();
    if (res?.success) setItems(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    const note = action === "reject" ? window.prompt("Reason for rejection (optional):") : "";
    const res = await api.sops.inboxAction(id, action, note);
    if (res?.success) load();
    else window.alert(res?.message || "Unable to update SOP request.");
  };

  const pending = items.filter((x) => ["pending", "later"].includes(x.status));

  return (
    <div className="sop-inbox-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="si-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="si-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      <section className="si-hero-section-light">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="si-badge">
            <span className="si-badge-dot"></span>
            <span>EMAIL-LIKE APPROVAL INBOX</span>
          </div>
          <h1 className="si-hero-title">
            SOP Approval <span className="gradient-text">Inbox</span>
          </h1>
          <p className="si-hero-subtitle">
            Review policy emails here without leaving Recruweb. Approve now, keep it for later, or reject with a reason.
          </p>
          <div className="si-inbox-count-pill" style={{ display: 'inline-block', marginTop: '16px', background: '#e0e7ff', color: '#4f46e5', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', border: '1px solid #c7d2fe' }}>
            {pending.length} action{pending.length === 1 ? "" : "s"} pending
          </div>
        </div>
        <ScrollIndicator />
      </section>

      <section className="section" style={{ paddingTop: '30px', position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          {loading ? (
            <div className="sop-loading" style={{ textAlign: 'center', padding: '40px', fontWeight: '700', color: '#64748b' }}>Loading inbox…</div>
          ) : (
            <div className="sop-inbox-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {items.map((item) => (
                <div className={`sop-card-3d ${item.status !== "pending" ? "sop-mail-done" : ""}`} key={item.id} style={{ padding: '24px' }}>
                  <div className="card-bg-light-glow"></div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                    <div className="sop-mail-icon" style={{ fontSize: '28px', background: '#f1f5f9', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✉️</div>
                    <div className="sop-mail-body" style={{ flex: 1 }}>
                      <div className="sop-mail-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>{item.sop?.title || "SOP Review Request"}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="sop-mail-subject" style={{ fontSize: '14px', fontWeight: '700', color: '#4f46e5', marginBottom: '8px' }}>{item.emailSubject}</div>
                      <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px', fontWeight: '600' }}>{item.emailBody.split("\n").slice(0, 4).join(" ")}</p>
                      
                      <div className="sop-mail-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link to={`${portalBase}/sops/${item.sopId}`} className="cv-action-btn secondary" style={{ padding: '8px 14px', fontSize: '12.5px', textDecoration: 'none' }}>Open SOP</Link>
                        {item.status === "pending" || item.status === "later" ? (
                          <>
                            <button className="cv-action-btn primary" style={{ padding: '8px 14px', fontSize: '12.5px', background: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }} onClick={() => act(item.id, "approve")}>✓ Approve</button>
                            <button className="cv-action-btn secondary" style={{ padding: '8px 14px', fontSize: '12.5px' }} onClick={() => act(item.id, "later")}>⏰ Approve Later</button>
                            <button className="cv-action-btn secondary" style={{ padding: '8px 14px', fontSize: '12.5px', background: '#fee2e2', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => act(item.id, "reject")}>✕ Reject</button>
                          </>
                        ) : (
                          <span className={`sop-status sop-status-${item.status}`} style={{ fontSize: '12px', fontWeight: '800', padding: '4px 12px', borderRadius: '10px', background: '#e2e8f0', color: '#334155', textTransform: 'uppercase' }}>{item.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-glow-bar"></div>
                </div>
              ))}
              {!items.length && <div className="sop-empty" style={{ textAlign: 'center', padding: '60px', background: '#ffffff', borderRadius: '20px', border: '1.5px solid #cbd5e1', fontWeight: '700', color: '#64748b' }}>Your SOP inbox is clear.</div>}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .sop-inbox-wrapper-light {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 1150px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .si-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .si-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatSopParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatSopParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .si-hero-section-light {
          position: relative;
          padding: 110px 0 60px;
          background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                      #f8fafc;
          color: #0f172a;
          text-align: center;
          overflow: hidden;
          z-index: 1;
        }

        .si-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(99, 102, 241, 0.1);
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          padding: 7px 18px;
          border-radius: 50px;
          font-size: 12.5px;
          font-weight: 800;
          color: #4f46e5;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
        }

        .si-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .si-hero-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 14px;
          letter-spacing: -1px;
          color: #0f172a;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .si-hero-subtitle {
          font-size: 16.5px;
          color: #64748b;
          line-height: 1.6;
          max-width: 650px;
          margin: 0 auto;
        }

        .sop-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          border: 1.5px solid #cbd5e1;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1deg);
        }

        .sop-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
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

        .cv-action-btn {
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
        }

        .cv-action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
        }

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
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

        .sop-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }
      `}</style>
    </div>
  );
}