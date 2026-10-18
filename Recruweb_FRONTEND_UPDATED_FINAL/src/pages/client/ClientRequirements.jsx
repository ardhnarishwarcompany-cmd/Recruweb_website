import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const emptyForm = {
  title: "",
  department: "",
  positions: 1,
  employmentType: "full-time",
  experienceLevel: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  priority: "medium",
  targetDate: "",
  description: "",
  skillsRequired: "",
};

const statusMeta = (status) => {
  switch (status) {
    case "open":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
      };
    case "filled":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
      };
    case "on-hold":
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
      };
    case "closed":
      return {
        bg: "#f1f5f9",
        text: "#64748b",
        border: "#cbd5e1",
      };
    default:
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
      };
  }
};

export default function ClientRequirements() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await api.clientPortal.getRequirements();
    if (res?.success) setRequirements(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const payload = {
      ...form,
      skillsRequired: form.skillsRequired
        ? String(form.skillsRequired)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
    const res = await api.clientPortal.createRequirement(payload);
    if (res?.success) {
      setMessage("Requirement submitted successfully.");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } else {
      setMessage(res?.message || "Failed to submit requirement.");
    }
    setSubmitting(false);
  };

  return (
    <div className="light-req-container">
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
      <div className="req-marquee-banner">
        <div className="req-marquee-track">
          <span>✨ Recruweb Corporate Job Requisitions &amp; Sourcing Portal</span>
          <span>•</span>
          <span>💼 Create New Vacancies &amp; Track Active Sourcing Status</span>
          <span>•</span>
          <span>⭐ Real-time Recruiter Assignment &amp; Candidate Pipeline</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Job Requirements <span className="gradient-text">— Portal</span>
            </h1>
            <p className="cand-subtitle">
              Create new job requisitions and track active sourcing status in real-time.
            </p>
          </div>
          <button
            className="cv-action-btn primary glow-btn"
            onClick={() => setShowForm((s) => !s)}
          >
            <span>{showForm ? "Cancel Form" : "+ Create Requirement ✨"}</span>
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {message && <div className="cand-msg-banner" style={{ marginBottom: "24px", position: 'relative', zIndex: 2 }}>ℹ️ {message}</div>}

      {/* Glass Form Card */}
      {showForm && (
        <div className="cand-card-3d" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 className="panel-heading">✨ Submit New Job Requisition</h3>
            <form onSubmit={submit} className="req-form-body">
              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Job Title *</label>
                  <input
                    name="title"
                    className="cand-input"
                    value={form.title}
                    onChange={change}
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Department</label>
                  <input
                    name="department"
                    className="cand-input"
                    value={form.department}
                    onChange={change}
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="input-group-3d">
                  <label>Positions Count</label>
                  <input
                    type="number"
                    min="1"
                    name="positions"
                    className="cand-input"
                    value={form.positions}
                    onChange={change}
                  />
                </div>
                <div className="input-group-3d">
                  <label>Employment Type</label>
                  <select
                    name="employmentType"
                    className="cand-input"
                    value={form.employmentType}
                    onChange={change}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Priority Level</label>
                  <select
                    name="priority"
                    className="cand-input"
                    value={form.priority}
                    onChange={change}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="input-group-3d">
                  <label>Experience Level</label>
                  <input
                    name="experienceLevel"
                    className="cand-input"
                    placeholder="e.g. 3-5 years"
                    value={form.experienceLevel}
                    onChange={change}
                  />
                </div>
                <div className="input-group-3d">
                  <label>Location</label>
                  <input
                    name="location"
                    className="cand-input"
                    placeholder="e.g. Noida / Remote"
                    value={form.location}
                    onChange={change}
                  />
                </div>
                <div className="input-group-3d">
                  <label>Target Close Date</label>
                  <input
                    type="date"
                    name="targetDate"
                    className="cand-input"
                    value={form.targetDate}
                    onChange={change}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Salary Min (INR/yr)</label>
                  <input
                    type="number"
                    name="salaryMin"
                    className="cand-input"
                    placeholder="500000"
                    value={form.salaryMin}
                    onChange={change}
                  />
                </div>
                <div className="input-group-3d">
                  <label>Salary Max (INR/yr)</label>
                  <input
                    type="number"
                    name="salaryMax"
                    className="cand-input"
                    placeholder="1200000"
                    value={form.salaryMax}
                    onChange={change}
                  />
                </div>
              </div>

              <div className="input-group-3d">
                <label>Skills Required (comma separated)</label>
                <input
                  name="skillsRequired"
                  className="cand-input"
                  placeholder="React, Node.js, SQL, TypeScript"
                  value={form.skillsRequired}
                  onChange={change}
                />
              </div>

              <div className="input-group-3d">
                <label>Job Description</label>
                <textarea
                  name="description"
                  rows={4}
                  className="cand-input"
                  style={{ resize: "vertical" }}
                  placeholder="Enter comprehensive role overview and responsibilities..."
                  value={form.description}
                  onChange={change}
                />
              </div>

              <button className="cv-action-btn primary glow-btn" disabled={submitting} style={{ justifyContent: "center", width: "100%", marginTop: "10px" }}>
                {submitting
                  ? "Submitting Requirement..."
                  : "🚀 Publish Requirement ✨"}
              </button>
            </form>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Glass Panel Track Jobs Table */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <h3 className="panel-heading" style={{ position: 'relative', zIndex: 2 }}>📋 Track Open Requisitions</h3>
        {loading ? (
          <div className="cand-loading-state" style={{ position: 'relative', zIndex: 2 }}>
            <span className="cand-loader"></span> Loading your requirements...
          </div>
        ) : !requirements.length ? (
          <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>
            You haven&apos;t raised any requirements yet. Click &quot;Create Requirement&quot; to get started.
          </div>
        ) : (
          <div className="cand-table-wrap" style={{ position: 'relative', zIndex: 2 }}>
            <table className="cand-light-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Filled / Positions</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Approved</th>
                  <th>Assigned Recruiter</th>
                  <th>Raised On</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((r) => {
                  const meta = statusMeta(r.status);
                  return (
                    <tr key={r.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a" }}>{r.title}</strong>
                      </td>
                      <td>
                        <span className="pos-badge">
                          {r.positionsFilled || 0} / {r.positions}
                        </span>
                      </td>
                      <td
                        style={{
                          textTransform: "capitalize",
                          fontWeight: "800",
                          color: "#334155",
                        }}
                      >
                        {r.priority}
                      </td>
                      <td>
                        <span
                          className="status-pill-badge"
                          style={{
                            background: meta.bg,
                            color: meta.text,
                            borderColor: meta.border,
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: "800" }}>{r.submittedCount ?? 0}</td>
                      <td style={{ fontWeight: "800" }}>{r.approvedCount ?? 0}</td>
                      <td>
                        <span className="recruiter-tag">
                          {r.assignedRecruiter?.name || "Not yet assigned"}
                        </span>
                      </td>
                      <td className="date-text">{fmtDate(r.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-req-container {
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
        .req-marquee-banner {
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

        .req-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .req-marquee-track span {
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

        .cand-msg-banner {
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          color: #0369a1;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
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

        .panel-heading {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 18px;
        }

        .req-form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
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
          transition: border-color 0.2s;
        }

        .cand-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
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

        .pos-badge {
          background: #e0f2fe;
          color: #0284c7;
          font-weight: 900;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
        }

        .status-pill-badge {
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: capitalize;
        }

        .recruiter-tag {
          font-weight: 700;
          color: #0f172a;
        }

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 600;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #0284c7;
          font-weight: 800;
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
          .form-grid-3 {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .form-grid-2, .form-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}