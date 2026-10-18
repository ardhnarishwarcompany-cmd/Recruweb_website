import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const TABS = [
  { key: "salary", label: "💰 Salary Guides" },
  { key: "interview", label: "🎯 Interview Questions" },
  { key: "templates", label: "📄 Document Templates" },
  { key: "compliance", label: "📋 Compliance Checklists" },
];

const emptySalary = {
  roleTitle: "",
  category: "Noida",
  experienceLevel: "entry",
  minSalary: "",
  maxSalary: "",
  avgSalary: "",
};
const emptyQuestion = {
  category: "HR Round",
  question: "",
  answerTips: "",
  difficulty: "medium",
};
const emptyChecklist = {
  title: "",
  category: "",
  description: "",
  itemsText: "",
};

const SalaryGuideManager = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptySalary);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.resourceCenter
      .getSalaryGuides()
      .then((res) => setItems(res?.data || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.resourceCenter.createSalaryGuide(form);
    if (res.success) {
      setForm(emptySalary);
      load();
    } else alert(res.message || "Failed to add");
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this salary guide?")) return;
    await api.resourceCenter.deleteSalaryGuide(id);
    load();
  };

  return (
    <div>
      <div className="section-header-box" style={{ marginBottom: "20px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "12px" }}>
        <h3 className="section-title" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px" }}>✨ Add New Salary Benchmark Guide</h3>
        <p className="section-desc" style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "600" }}>
          Configure market rate ranges for roles across locations &amp; experience levels.
        </p>
      </div>

      <form className="res-form-grid" onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="input-group-3d">
          <label>Role Title *</label>
          <input
            className="cand-input"
            placeholder="e.g. Senior Backend Engineer"
            value={form.roleTitle}
            onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
            required
          />
        </div>
        <div className="input-group-3d">
          <label>Category / Location</label>
          <select
            className="cand-input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {["Noida", "Delhi NCR", "BPO", "Sales", "IT"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group-3d">
          <label>Experience Level</label>
          <select
            className="cand-input"
            value={form.experienceLevel}
            onChange={(e) =>
              setForm({ ...form, experienceLevel: e.target.value })
            }
          >
            {["fresher", "entry", "mid", "senior", "leadership"].map((l) => (
              <option
                key={l}
                value={l}
                style={{ textTransform: "capitalize" }}
              >
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group-3d">
          <label>Min Salary (₹) *</label>
          <input
            type="number"
            className="cand-input"
            placeholder="300000"
            value={form.minSalary}
            onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
            required
          />
        </div>
        <div className="input-group-3d">
          <label>Max Salary (₹) *</label>
          <input
            type="number"
            className="cand-input"
            placeholder="600000"
            value={form.maxSalary}
            onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
            required
          />
        </div>
        <div className="input-group-3d">
          <label>Avg Salary (₹ - Optional)</label>
          <input
            type="number"
            className="cand-input"
            placeholder="450000"
            value={form.avgSalary}
            onChange={(e) => setForm({ ...form, avgSalary: e.target.value })}
          />
        </div>
        <div className="full-width" style={{ gridColumn: "span 3", marginTop: "4px" }}>
          <button className="cv-action-btn primary glow-btn" type="submit" style={{ width: "100%", justifyContent: "center" }}>
            🚀 Publish Salary Guide ✨
          </button>
        </div>
      </form>

      {loading ? (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading salary guides...
        </div>
      ) : !items.length ? (
        <div className="cand-empty-state">No salary guides added yet.</div>
      ) : (
        <div className="cand-table-wrap" style={{ marginTop: "24px" }}>
          <table className="cand-light-table">
            <thead>
              <tr>
                <th>Role Title</th>
                <th>Category / Location</th>
                <th>Experience Level</th>
                <th>Salary Range</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((g) => (
                <tr key={g.id} className="table-row-hover">
                  <td>
                    <strong style={{ color: "#0f172a", fontWeight: "900" }}>{g.roleTitle}</strong>
                  </td>
                  <td>
                    <span className="cat-pill">{g.category}</span>
                  </td>
                  <td style={{ textTransform: "capitalize", color: "#334155", fontWeight: "700" }}>
                    {g.experienceLevel}
                  </td>
                  <td>
                    <span style={{ color: "#059669", fontWeight: "900" }}>
                      ₹{Number(g.minSalary).toLocaleString("en-IN")} – ₹
                      {Number(g.maxSalary).toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td>
                    <button
                      className="cv-action-btn"
                      style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                      onClick={() => remove(g.id)}
                    >
                      Delete
                    </button>
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

const InterviewQuestionManager = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyQuestion);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.resourceCenter
      .getInterviewQuestions()
      .then((res) => setItems(res?.data || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.resourceCenter.createInterviewQuestion(form);
    if (res.success) {
      setForm(emptyQuestion);
      load();
    } else alert(res.message || "Failed to add");
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await api.resourceCenter.deleteInterviewQuestion(id);
    load();
  };

  return (
    <div>
      <div className="section-header-box" style={{ marginBottom: "20px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "12px" }}>
        <h3 className="section-title" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px" }}>✨ Add Interview Question &amp; Tips</h3>
        <p className="section-desc" style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "600" }}>
          Equip recruiters and candidates with targeted interview questions.
        </p>
      </div>

      <form className="res-form-grid" onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="input-group-3d">
          <label>Category</label>
          <select
            className="cand-input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {["HR Round", "Sales", "BPO", "IT / Technical"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group-3d">
          <label>Difficulty Level</label>
          <select
            className="cand-input"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
          >
            {["easy", "medium", "hard"].map((d) => (
              <option
                key={d}
                value={d}
                style={{ textTransform: "capitalize" }}
              >
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group-3d full-width" style={{ gridColumn: "span 3" }}>
          <label>Interview Question *</label>
          <textarea
            className="cand-input"
            rows={3}
            style={{ resize: "vertical" }}
            placeholder="e.g. Tell me about a time you handled a difficult client."
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
          />
        </div>
        <div className="input-group-3d full-width" style={{ gridColumn: "span 3" }}>
          <label>Answer / Interviewer Tips (Optional)</label>
          <textarea
            className="cand-input"
            rows={3}
            style={{ resize: "vertical" }}
            placeholder="Look for structured problem-solving and patience..."
            value={form.answerTips}
            onChange={(e) => setForm({ ...form, answerTips: e.target.value })}
          />
        </div>
        <div className="full-width" style={{ gridColumn: "span 3" }}>
          <button className="cv-action-btn primary glow-btn" type="submit" style={{ width: "100%", justifyContent: "center" }}>
            🚀 Publish Interview Question ✨
          </button>
        </div>
      </form>

      {loading ? (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading questions...
        </div>
      ) : !items.length ? (
        <div className="cand-empty-state">No interview questions added yet.</div>
      ) : (
        <div className="cand-table-wrap" style={{ marginTop: "24px" }}>
          <table className="cand-light-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Question</th>
                <th>Difficulty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id} className="table-row-hover">
                  <td>
                    <span className="cat-pill">{q.category}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a", fontWeight: "900" }}>{q.question}</strong>
                    {q.answerTips && (
                      <div className="sub-tips">💡 {q.answerTips}</div>
                    )}
                  </td>
                  <td style={{ textTransform: "capitalize", color: "#334155", fontWeight: "700" }}>
                    {q.difficulty}
                  </td>
                  <td>
                    <button
                      className="cv-action-btn"
                      style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                      onClick={() => remove(q.id)}
                    >
                      Delete
                    </button>
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

const TemplateManager = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("offer_letter");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = () =>
    api.resourceCenter
      .getTemplates()
      .then((res) => setItems(res?.data || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file to upload");
    setUploading(true);
    const fd = new FormData();
    fd.append("type", type);
    fd.append("title", title);
    fd.append("description", description);
    fd.append("file", file);
    const res = await api.resourceCenter.createTemplate(fd);
    setUploading(false);
    if (res.success) {
      setTitle("");
      setDescription("");
      setFile(null);
      load();
    } else alert(res.message || "Upload failed");
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    await api.resourceCenter.deleteTemplate(id);
    load();
  };

  return (
    <div>
      <div className="section-header-box" style={{ marginBottom: "20px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "12px" }}>
        <h3 className="section-title" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px" }}>✨ Upload Document Template</h3>
        <p className="section-desc" style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "600" }}>
          Provide downloadable offer letters, joining kits, &amp; HR policies.
        </p>
      </div>

      <form className="res-form-grid" onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="input-group-3d">
          <label>Template Type</label>
          <select
            className="cand-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="offer_letter">Offer Letter Template</option>
            <option value="notice_period_policy">Notice Period Policy Template</option>
          </select>
        </div>
        <div className="input-group-3d">
          <label>Template Title *</label>
          <input
            className="cand-input"
            placeholder="Standard IT Offer Letter"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="input-group-3d full-width" style={{ gridColumn: "span 3" }}>
          <label>Description</label>
          <input
            className="cand-input"
            placeholder="Short description of the template..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Ultra-Modern Glowing Drag & Drop File Upload Box */}
        <div className="input-group-3d full-width" style={{ gridColumn: "span 3" }}>
          <label>Upload Document File (.pdf, .doc, .docx) *</label>
          <div className="modern-file-upload-box">
            <input
              type="file"
              id="templateFileInput"
              accept=".pdf,.doc,.docx"
              className="hidden-file-input"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="templateFileInput" className="file-upload-label">
              <div className="upload-icon">📁</div>
              <div className="upload-text-group">
                <span className="upload-title">
                  {file
                    ? file.name
                    : "Choose a template file or drag & drop here"}
                </span>
                <span className="upload-sub">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : "PDF, DOC, or DOCX format"}
                </span>
              </div>
              <span className="browse-btn-badge">Browse File</span>
            </label>
          </div>
        </div>

        <div className="full-width" style={{ gridColumn: "span 3" }}>
          <button
            className="cv-action-btn primary glow-btn"
            type="submit"
            disabled={uploading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {uploading ? "Uploading Template..." : "🚀 Upload Template File ✨"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading templates...
        </div>
      ) : !items.length ? (
        <div className="cand-empty-state">No templates uploaded yet.</div>
      ) : (
        <div className="cand-table-wrap" style={{ marginTop: "24px" }}>
          <table className="cand-light-table">
            <thead>
              <tr>
                <th>Template Title</th>
                <th>Type</th>
                <th>Downloads</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="table-row-hover">
                  <td>
                    <strong style={{ color: "#0f172a", fontWeight: "900" }}>{t.title}</strong>
                  </td>
                  <td>
                    <span className="cat-pill">{t.type}</span>
                  </td>
                  <td style={{ color: "#334155", fontWeight: "700" }}>{t.downloadCount || 0}</td>
                  <td>
                    <button
                      className="cv-action-btn"
                      style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                      onClick={() => remove(t.id)}
                    >
                      Delete
                    </button>
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

const ChecklistManager = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyChecklist);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.resourceCenter
      .getComplianceChecklists()
      .then((res) => setItems(res?.data || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const checklistItems = form.itemsText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ text }));
    const res = await api.resourceCenter.createChecklist({
      title: form.title,
      category: form.category,
      description: form.description,
      items: checklistItems,
    });
    if (res.success) {
      setForm(emptyChecklist);
      load();
    } else alert(res.message || "Failed to add");
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this checklist?")) return;
    await api.resourceCenter.deleteChecklist(id);
    load();
  };

  return (
    <div>
      <div className="section-header-box" style={{ marginBottom: "20px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "12px" }}>
        <h3 className="section-title" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px" }}>✨ Create Compliance Checklist</h3>
        <p className="section-desc" style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "600" }}>
          Ensure seamless onboarding and regulatory compliance with itemized lists.
        </p>
      </div>

      <form className="res-form-grid" onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="input-group-3d">
          <label>Checklist Title *</label>
          <input
            className="cand-input"
            placeholder="New Hire Compliance"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="input-group-3d">
          <label>Category</label>
          <input
            className="cand-input"
            placeholder="e.g. Onboarding"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
        <div className="input-group-3d full-width" style={{ gridColumn: "span 3" }}>
          <label>Description</label>
          <input
            className="cand-input"
            placeholder="Brief overview of checklist..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="input-group-3d full-width" style={{ gridColumn: "span 3" }}>
          <label>Checklist Items (One item per line) *</label>
          <textarea
            className="cand-input"
            rows={5}
            style={{ resize: "vertical" }}
            placeholder="Collect PAN & Aadhaar&#10;Verify bank account details&#10;Issue company ID card"
            value={form.itemsText}
            onChange={(e) => setForm({ ...form, itemsText: e.target.value })}
            required
          />
        </div>
        <div className="full-width" style={{ gridColumn: "span 3" }}>
          <button className="cv-action-btn primary glow-btn" type="submit" style={{ width: "100%", justifyContent: "center" }}>
            🚀 Publish Compliance Checklist ✨
          </button>
        </div>
      </form>

      {loading ? (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading checklists...
        </div>
      ) : !items.length ? (
        <div className="cand-empty-state">
          No compliance checklists added yet.
        </div>
      ) : (
        <div className="cand-table-wrap" style={{ marginTop: "24px" }}>
          <table className="cand-light-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Items Count</th>
                <th>Downloads</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="table-row-hover">
                  <td>
                    <strong style={{ color: "#0f172a", fontWeight: "900" }}>{c.title}</strong>
                  </td>
                  <td>
                    <span className="cat-pill">{c.category || "General"}</span>
                  </td>
                  <td style={{ color: "#334155", fontWeight: "700" }}>{(c.items || []).length} items</td>
                  <td style={{ color: "#334155", fontWeight: "700" }}>{c.downloadCount || 0}</td>
                  <td>
                    <button
                      className="cv-action-btn"
                      style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                      onClick={() => remove(c.id)}
                    >
                      Delete
                    </button>
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

const AdminResourceCenter = () => {
  const [tab, setTab] = useState("salary");

  return (
    <div className="light-res-container">
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
      <div className="res-marquee-banner">
        <div className="res-marquee-track">
          <span>✨ Recruweb Enterprise Free Hiring Resource Center &amp; Management Hub</span>
          <span>•</span>
          <span>💼 Salary Guides, Interview Questions, Document Templates &amp; Compliance Checklists</span>
          <span>•</span>
          <span>⭐ Real-time Public Website Synchronization</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Free Hiring Resource Center{" "}
            <span className="gradient-text">— Management Hub</span>
          </h1>
          <p className="cand-subtitle">
            Manage salary guides, interview questions, templates &amp; compliance checklists shown on the public website in real-time.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="cand-tabs-bar" style={{ position: 'relative', zIndex: 2 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`cand-tab-btn${tab === t.key ? " active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Glass Panel Content Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {tab === "salary" && <SalaryGuideManager />}
          {tab === "interview" && <InterviewQuestionManager />}
          {tab === "templates" && <TemplateManager />}
          {tab === "compliance" && <ChecklistManager />}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-res-container {
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
        .res-marquee-banner {
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

        .res-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .res-marquee-track span {
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

        /* Modern Glass Drag & Drop File Upload Box */
        .modern-file-upload-box {
          position: relative;
          width: 100%;
        }

        .hidden-file-input {
          display: none;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #f8fafc;
          border: 2px dashed #0284c7;
          padding: 18px 22px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .file-upload-label:hover {
          background: #e0f2fe;
          border-color: #6366f1;
          box-shadow: 0 0 20px rgba(2, 132, 199, 0.15);
        }

        .upload-icon {
          font-size: 28px;
        }

        .upload-text-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .upload-title {
          font-size: 14px;
          font-weight: 900;
          color: #0f172a;
        }

        .upload-sub {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
        }

        .browse-btn-badge {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 900;
          padding: 8px 16px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
          white-space: nowrap;
          transition: transform 0.2s ease;
        }

        .file-upload-label:hover .browse-btn-badge {
          transform: translateY(-1px);
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

        .cat-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
        }

        .sub-tips {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          margin-top: 4px;
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
          .res-form-grid {
            grid-template-columns: 1fr 1fr;
          }
          .full-width {
            grid-column: span 2;
          }
        }

        @media (max-width: 768px) {
          .res-form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminResourceCenter;