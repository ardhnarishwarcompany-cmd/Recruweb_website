import { useEffect, useState } from "react";
import { api, API_URL } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const TABS = [
  { key: "profile", label: "👤 Profile Details" },
  { key: "resume", label: "📄 Resume" },
  { key: "documents", label: "📂 Documents" },
  { key: "skills", label: "⚡ Skills" },
];

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  alternatePhone: "",
  experience: "",
  currentCompany: "",
  currentCTC: "",
  expectedCTC: "",
  noticePeriod: "",
};

export default function CandidateProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    const res = await api.candidatePortal.getProfile();
    if (res?.success) {
      setProfile(res.data);
      setForm({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        phone: res.data.phone || "",
        alternatePhone: res.data.alternatePhone || "",
        experience: res.data.experience ?? "",
        currentCompany: res.data.currentCompany || "",
        currentCTC: res.data.currentCTC ?? "",
        expectedCTC: res.data.expectedCTC ?? "",
        noticePeriod: res.data.noticePeriod ?? "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await api.candidatePortal.updateProfile(form);
    if (res?.success) {
      setProfile(res.data);
      setMessage("Profile saved successfully.");
    } else {
      setMessage(res?.message || "Failed to save profile.");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="light-cand-pro-container">
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading candidate profile...
        </div>
      </div>
    );

  return (
    <div className="light-cand-pro-container">
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
      <div className="cand-marquee-banner">
        <div className="cand-marquee-track">
          <span>✨ Welcome to Recruweb Candidate Portal</span>
          <span>•</span>
          <span>🚀 Keep your profile updated for better matching</span>
          <span>•</span>
          <span>⭐ Upload verified documents for faster hiring</span>
          <span>•</span>
          <span>💡 Showcase your core skills matrix</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Candidate Profile{" "}
            <span className="gradient-text">— Career Portal</span>
          </h1>
          <p className="cand-subtitle">
            Manage your personal details, upload resume archives, verification documents, and skill sets.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="cand-tabs-bar">
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

      {/* Glass Panel Content Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {activeTab === "profile" && (
            <form onSubmit={saveProfile} className="cand-form-body">
              <div className="form-grid-3">
                <Field label="First Name *">
                  <input
                    className="cand-input"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    required
                    placeholder="John"
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    className="cand-input"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </Field>
                <Field label="Phone *">
                  <input
                    className="cand-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    placeholder="+91 9876543210"
                  />
                </Field>
                <Field label="Alternate Phone">
                  <input
                    className="cand-input"
                    value={form.alternatePhone}
                    onChange={(e) =>
                      setForm({ ...form, alternatePhone: e.target.value })
                    }
                    placeholder="+91 9123456789"
                  />
                </Field>
                <Field label="Experience (years)">
                  <input
                    type="number"
                    step="0.1"
                    className="cand-input"
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    placeholder="3.5"
                  />
                </Field>
                <Field label="Current Company">
                  <input
                    className="cand-input"
                    value={form.currentCompany}
                    onChange={(e) =>
                      setForm({ ...form, currentCompany: e.target.value })
                    }
                    placeholder="Tech Corp"
                  />
                </Field>
                <Field label="Current CTC (INR/yr)">
                  <input
                    type="number"
                    className="cand-input"
                    value={form.currentCTC}
                    onChange={(e) =>
                      setForm({ ...form, currentCTC: e.target.value })
                    }
                    placeholder="800000"
                  />
                </Field>
                <Field label="Expected CTC (INR/yr)">
                  <input
                    type="number"
                    className="cand-input"
                    value={form.expectedCTC}
                    onChange={(e) =>
                      setForm({ ...form, expectedCTC: e.target.value })
                    }
                    placeholder="1200000"
                  />
                </Field>
                <Field label="Notice Period (days)">
                  <input
                    type="number"
                    className="cand-input"
                    value={form.noticePeriod}
                    onChange={(e) =>
                      setForm({ ...form, noticePeriod: e.target.value })
                    }
                    placeholder="30"
                  />
                </Field>
              </div>

              {message && <div className="cand-msg-banner">ℹ️ {message}</div>}

              <button className="cv-action-btn primary glow-btn" disabled={saving} style={{ justifyContent: 'center', width: '100%' }}>
                {saving ? "Saving Profile..." : "💾 Save Profile Changes"}
              </button>
            </form>
          )}

          {activeTab === "resume" && (
            <ResumeTab profile={profile} onUpdated={loadProfile} />
          )}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "skills" && (
            <SkillsTab profile={profile} onUpdated={loadProfile} />
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-cand-pro-container {
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
        .cand-marquee-banner {
          background: linear-gradient(90deg, #4f46e5, #9333ea);
          color: #ffffff;
          padding: 10px 0;
          border-radius: 30px;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          margin-bottom: 24px;
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.25);
        }

        .cand-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .cand-marquee-track span {
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

        .cand-tabs-bar {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          background: #ffffff;
          padding: 8px;
          border-radius: 18px;
          border: 1.5px solid #cbd5e1;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
        }

        .cand-tab-btn {
          padding: 11px 22px;
          background: transparent;
          border: none;
          color: #475569;
          font-size: 13.5px;
          font-weight: 800;
          border-radius: 12px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .cand-tab-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .cand-tab-btn.active {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
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
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .cand-form-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .input-group-3d {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group-3d label {
          font-size: 13px;
          font-weight: 800;
          color: #334155;
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
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
        }

        /* File Upload Box */
        .file-dropzone-wrapper {
          position: relative;
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
          border-radius: 18px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .file-dropzone-wrapper:hover {
          border-color: #6366f1;
          background: #f5f3ff;
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.15);
        }

        .file-dropzone-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .dropzone-icon {
          font-size: 38px;
        }

        .dropzone-text-main {
          font-size: 14.5px;
          font-weight: 800;
          color: #0f172a;
        }

        .dropzone-text-sub {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .selected-file-badge {
          background: #ecfdf5;
          border: 1.5px solid #a7f3d0;
          color: #059669;
          font-weight: 800;
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
        }

        .cv-action-btn {
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14.5px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
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

        .cand-msg-banner {
          background: #e0e7ff;
          border: 1.5px solid #c7d2fe;
          color: #4338ca;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
        }

        .resume-view-box {
          margin-bottom: 20px;
          font-size: 14px;
          color: #334155;
          font-weight: 700;
        }

        .link-accent {
          color: #4f46e5;
          font-weight: 800;
          text-decoration: underline;
        }

        .upload-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .skills-add-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .skills-chips-flex {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .skill-pill {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-skill-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: #ef4444;
          font-weight: 900;
          font-size: 14px;
        }

        .cand-table-wrap {
          overflow-x: auto;
          margin-top: 16px;
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

const Field = ({ label, children }) => (
  <div className="input-group-3d">
    <label>{label}</label>
    {children}
  </div>
);

const ResumeTab = ({ profile, onUpdated }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    const res = await api.candidatePortal.uploadResume(file);
    setMessage(
      res?.success
        ? "Resume uploaded successfully."
        : res?.message || "Upload failed.",
    );
    setUploading(false);
    setFile(null);
    onUpdated();
  };

  return (
    <div className="upload-stack">
      {profile?.resume ? (
        <div className="resume-view-box">
          📄 Current resume uploaded:{" "}
          <a
            href={`${API_URL.replace("/api", "")}${profile.resume}`}
            target="_blank"
            rel="noreferrer"
            className="link-accent"
          >
            View / Download PDF
          </a>
        </div>
      ) : (
        <div className="resume-view-box" style={{ color: "#ef4444" }}>
          ⚠️ No resume uploaded yet. Upload one to get screened.
        </div>
      )}

      {/* File Dropzone */}
      <div className="file-dropzone-wrapper">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="file-dropzone-input"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="dropzone-icon">📄</div>
        <div className="dropzone-text-main">
          {file ? file.name : "Click to browse or drop your resume here"}
        </div>
        <div className="dropzone-text-sub">
          Supports PDF, DOC, DOCX up to 10MB
        </div>
      </div>

      {file && (
        <div className="selected-file-badge">✅ Selected: {file.name}</div>
      )}

      <button
        className="cv-action-btn primary glow-btn"
        disabled={!file || uploading}
        onClick={upload}
        style={{ justifyContent: 'center' }}
      >
        {uploading ? "Uploading Resume..." : "📤 Upload Resume File"}
      </button>

      {message && <div className="cand-msg-banner">{message}</div>}
    </div>
  );
};

const DocumentsTab = () => {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const res = await api.candidatePortal.getDocuments();
    if (res?.success) setDocuments(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    await api.candidatePortal.uploadDocument(file, label);
    setUploading(false);
    setFile(null);
    setLabel("");
    load();
  };

  if (loading)
    return <div className="cand-empty-state">Loading documents...</div>;

  return (
    <div className="upload-stack">
      <div className="input-group-3d">
        <label>Document Label / Type</label>
        <input
          type="text"
          placeholder="e.g. Identity Proof, Highest Degree Marksheet, Relieving Letter"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="cand-input"
        />
      </div>

      <div className="file-dropzone-wrapper">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-dropzone-input"
        />
        <div className="dropzone-icon">📁</div>
        <div className="dropzone-text-main">
          {file ? file.name : "Click to select verification document"}
        </div>
        <div className="dropzone-text-sub">
          ID Proof, Educational Certificates, or Experience Letters
        </div>
      </div>

      {file && (
        <div className="selected-file-badge">
          ✅ Ready to upload: {file.name}
        </div>
      )}

      <button
        className="cv-action-btn primary glow-btn"
        disabled={!file || uploading}
        onClick={upload}
        style={{ justifyContent: 'center' }}
      >
        {uploading ? "Uploading Document..." : "+ Upload Verification Document"}
      </button>

      {!documents.length ? (
        <div className="cand-empty-state" style={{ marginTop: 20 }}>
          No verification documents uploaded yet.
        </div>
      ) : (
        <div className="cand-table-wrap">
          <table className="cand-light-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Uploaded At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d, i) => (
                <tr key={i} className="table-row-hover">
                  <td>
                    <strong>{d.name}</strong>
                  </td>
                  <td style={{ color: "#64748b" }}>
                    {new Date(d.uploadedAt).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <a
                      href={`${API_URL.replace("/api", "")}${d.path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="link-accent"
                    >
                      View File
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SkillsTab = ({ profile, onUpdated }) => {
  const [skills, setSkills] = useState(profile?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSkills(profile?.skills || []);
  }, [profile]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills([...skills, trimmed]);
    setNewSkill("");
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const save = async () => {
    setSaving(true);
    await api.candidatePortal.updateProfile({ skills });
    setSaving(false);
    onUpdated();
  };

  return (
    <div>
      <div className="skills-add-row">
        <input
          type="text"
          placeholder="Add a skill (e.g. React, Node.js, Python, SQL)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          className="cand-input"
        />
        <button
          className="cv-action-btn primary"
          style={{ width: "auto", padding: "0 24px" }}
          onClick={addSkill}
        >
          Add Skill
        </button>
      </div>

      <div className="skills-chips-flex">
        {skills.length === 0 && (
          <span style={{ color: "#64748b", fontWeight: "600" }}>
            No skills added yet. Add your core competencies above.
          </span>
        )}
        {skills.map((skill) => (
          <span key={skill} className="skill-pill">
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="btn-skill-remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <button className="cv-action-btn primary glow-btn" onClick={save} disabled={saving} style={{ justifyContent: 'center', width: '100%' }}>
        {saving ? "Saving Skills..." : "💾 Save Skills Matrix"}
      </button>
    </div>
  );
};