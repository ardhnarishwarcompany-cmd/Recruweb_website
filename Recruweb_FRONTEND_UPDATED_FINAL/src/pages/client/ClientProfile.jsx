import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const EDITABLE_FIELDS = [
  ["name", "Company Name"],
  ["industry", "Industry"],
  ["website", "Website"],
  ["email", "Contact Email"],
  ["phone", "Contact Phone"],
  ["address", "Address"],
  ["city", "City"],
  ["state", "State"],
  ["country", "Country"],
];

export default function ClientProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await api.clientPortal.getProfile();
    if (res?.success) {
      setProfile(res.data);
      setForm(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await api.clientPortal.updateProfile(form);
    if (res?.success) {
      setMessage("Profile updated successfully.");
      setProfile(res.data);
    } else {
      setMessage(res?.message || "Failed to update profile.");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="light-pro-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading company profile...
        </div>
      </div>
    );

  return (
    <div className="light-pro-container">
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
      <div className="pro-marquee-banner">
        <div className="pro-marquee-track">
          <span>✨ Recruweb Corporate Entity &amp; Profile Management Suite</span>
          <span>•</span>
          <span>🏢 Manage Corporate Details, Contacts &amp; Account Settings</span>
          <span>•</span>
          <span>⭐ Secure Data Sync with Enterprise Database</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Company Profile{" "}
            <span className="gradient-text">— Corporate Portal</span>
          </h1>
          <p className="cand-subtitle">
            Manage your corporate entity details, contact information, and account settings.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Profile Meta Summary Card */}
      <div className="cand-card-3d" style={{ marginBottom: "28px", padding: "20px 28px" }}>
        <div className="card-bg-light-glow"></div>
        <div className="summary-meta-flex" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap", fontSize: "13.5px", fontWeight: "700", color: "#64748b" }}>
          <div>
            Client Code:{" "}
            <strong style={{ color: "#0284c7", fontWeight: "900" }}>
              {profile?.clientCode || "—"}
            </strong>
          </div>
          <div>
            Account Status:{" "}
            <span style={{ color: "#059669", fontWeight: "900", textTransform: "capitalize" }}>{profile?.status}</span>
          </div>
          {profile?.accountManager && (
            <div>
              Account Manager:{" "}
              <strong style={{ color: "#9333ea", fontWeight: "900" }}>
                {profile.accountManager.name}
              </strong>
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Form Card */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <form onSubmit={submit} className="pro-form-body" style={{ position: 'relative', zIndex: 2 }}>
          <div className="form-grid-2">
            {EDITABLE_FIELDS.map(([field, fieldLabel]) => (
              <div key={field} className="input-group-3d">
                <label style={{ fontSize: "12.5px", fontWeight: "800", color: "#334155", marginBottom: "6px", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>{fieldLabel}</label>
                <input
                  name={field}
                  className="cand-input"
                  value={form[field] || ""}
                  onChange={change}
                  placeholder={`Enter ${fieldLabel.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>

          <button className="cv-action-btn primary glow-btn" disabled={saving} style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>
            {saving ? "Saving Changes..." : "💾 Save Profile Changes ✨"}
          </button>

          {message && (
            <div className="cand-msg-banner" style={{ textAlign: "center" }}>
              ℹ️ {message}
            </div>
          )}
        </form>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-pro-container {
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
        .pro-marquee-banner {
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

        .pro-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .pro-marquee-track span {
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

        .pro-form-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .cand-input {
          width: 100%;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .cand-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
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

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cand-msg-banner {
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          color: #0369a1;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
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

        @media (max-width: 768px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}