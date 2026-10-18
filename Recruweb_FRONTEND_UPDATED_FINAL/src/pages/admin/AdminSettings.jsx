import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import GlobalPreferences from "../../components/GlobalPreferences";
import ScrollIndicator from "../../components/ScrollIndicator";

const TABS = [
  { key: "company", label: "🏢 Company Settings" },
  { key: "email", label: "📧 Email Settings" },
  { key: "whatsapp", label: "💬 WhatsApp Settings" },
  { key: "sms", label: "📱 SMS Settings" },
  { key: "global", label: "🌍 Region & Currency" },
];

const FIELD_CONFIG = {
  company: [
    { name: "companyName", label: "Company Name", type: "text" },
    { name: "website", label: "Website", type: "text" },
    { name: "supportEmail", label: "Support Email", type: "email" },
    { name: "supportPhone", label: "Support Phone", type: "text" },
    { name: "address", label: "Address", type: "text" },
    { name: "gstNumber", label: "GST Number", type: "text" },
    { name: "timezone", label: "Timezone", type: "text" },
  ],
  email: [
    { name: "provider", label: "Provider", type: "text" },
    { name: "smtpHost", label: "SMTP Host", type: "text" },
    { name: "smtpPort", label: "SMTP Port", type: "number" },
    { name: "smtpUser", label: "SMTP Username", type: "text" },
    { name: "smtpPassword", label: "SMTP Password", type: "password" },
    { name: "fromName", label: "From Name", type: "text" },
    { name: "fromEmail", label: "From Email", type: "email" },
  ],
  whatsapp: [
    { name: "provider", label: "Provider", type: "text" },
    { name: "phoneNumberId", label: "Phone Number ID", type: "text" },
    { name: "businessAccountId", label: "Business Account ID", type: "text" },
    { name: "accessToken", label: "Access Token", type: "password" },
  ],
  sms: [
    { name: "provider", label: "Provider", type: "text" },
    { name: "accountSid", label: "Account SID", type: "text" },
    { name: "authToken", label: "Auth Token", type: "password" },
    { name: "senderId", label: "Sender ID", type: "text" },
  ],
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    api.settings.getAll().then((res) => {
      if (res.success) setSettings(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (settings) setForm(settings[activeTab] || {});
    setMessage("");
  }, [activeTab, settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await api.settings.update(activeTab, form);
    setSaving(false);
    if (res.success) {
      setSettings((prev) => ({ ...prev, [activeTab]: res.data }));
      setMessage("Settings saved successfully.");
    } else {
      setMessage(res.message || "Failed to save settings.");
    }
  };

  const fields = FIELD_CONFIG[activeTab] || [];

  return (
    <div className="light-set-container">
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
      <div className="set-marquee-banner">
        <div className="set-marquee-track">
          <span>✨ Recruweb Enterprise System Settings &amp; Configurations</span>
          <span>•</span>
          <span>🏢 Manage Company Profile, Email Gateway, WhatsApp API &amp; SMS Integration Settings</span>
          <span>•</span>
          <span>⭐ Real-time System Customization</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            System Settings{" "}
            <span className="gradient-text">— Configurations</span>
          </h1>
          <p className="cand-subtitle">
            Manage company profile, email gateway, WhatsApp API, and SMS integration settings.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="cand-tabs-bar" style={{ position: 'relative', zIndex: 2 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`cand-tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Glass Panel Form Container */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {activeTab === "global" ? (
            <div className="set-form-body">
              <GlobalPreferences />
            </div>
          ) : loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading configurations...
            </div>
          ) : (
            <form onSubmit={handleSave} className="set-form-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {activeTab !== "company" && (
                <div className="toggle-container-box" style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "14px 18px", borderRadius: "14px", marginBottom: "4px" }}>
                  <label className="checkbox-label-row" style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                    <span className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={!!form.isEnabled}
                        onChange={(e) =>
                          setForm({ ...form, isEnabled: e.target.checked })
                        }
                      />
                      <span className="admin-toggle-slider" />
                    </span>
                    <span
                      style={{
                        fontWeight: "800",
                        color: form.isEnabled ? "#059669" : "#dc2626",
                      }}
                    >
                      {form.isEnabled
                        ? "Channel Status: Enabled"
                        : "Channel Status: Disabled"}
                    </span>
                  </label>
                </div>
              )}

              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {fields.map((f) => (
                  <div className="input-group-3d" key={f.name}>
                    <label>{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      className="cand-input"
                      value={form[f.name] ?? ""}
                      onChange={handleChange}
                      placeholder={
                        f.type === "password"
                          ? "Leave unchanged to keep current value"
                          : `Enter ${f.label.toLowerCase()}...`
                      }
                    />
                  </div>
                ))}
              </div>

              {message && <div className="cand-msg-banner" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>ℹ️ {message}</div>}

              <button
                type="submit"
                className="cv-action-btn primary glow-btn"
                disabled={saving}
                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
              >
                {saving ? "Saving Changes..." : "Save Configuration Settings ✨"}
              </button>
            </form>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-set-container {
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
        .set-marquee-banner {
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

        .set-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .set-marquee-track span {
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

        .cand-header-3d:hover .card-glow-bar {
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

        .cv-action-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
        }

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cand-tabs-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          background: #ffffff;
          padding: 6px;
          border-radius: 18px;
          border: 1.5px solid #cbd5e1;
          margin-bottom: 24px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
        }

        .cand-tab-btn {
          padding: 9px 18px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 13.5px;
          font-weight: 800;
          border-radius: 12px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .cand-tab-btn.active {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
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

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-group-3d {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group-3d label {
          font-size: 12.5px;
          font-weight: 800;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
        }

        .cand-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
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

        .cand-msg-banner {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 800;
          border: 1.5px solid;
        }

        @media (max-width: 768px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;