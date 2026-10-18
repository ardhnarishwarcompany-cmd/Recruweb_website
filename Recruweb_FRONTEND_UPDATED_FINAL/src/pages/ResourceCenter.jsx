import { useEffect, useState } from "react";
import { api } from "../utils/api";
import ScrollIndicator from "../components/ScrollIndicator";
import toast from "react-hot-toast";

const TABS = [
  { key: "salary", label: "Salary Guides" },
  { key: "interview", label: "Interview Questions" },
  { key: "templates", label: "Letter Templates" },
  { key: "compliance", label: "Compliance Checklists" },
  { key: "payroll", label: "Payroll Calculator" },
];

const fmtINR = (n) =>
  n === null || n === undefined ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;

const SalaryGuides = () => {
  const [guides, setGuides] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.resourceCenter
      .getSalaryGuides(category ? { category } : {})
      .then((res) => setGuides(res?.data || []))
      .finally(() => setLoading(false));
  }, [category]);

  const categories = ["Noida", "Delhi NCR", "BPO", "Sales", "IT"];

  return (
    <div>
      <div className="rc-filter-row">
        <button
          className={`rc-chip ${category === "" ? "active" : ""}`}
          onClick={() => setCategory("")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`rc-chip ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rc-empty">Loading live salary data...</div>
      ) : guides.length === 0 ? (
        <div className="rc-empty">No salary guides published yet.</div>
      ) : (
        <div className="rc-table-wrap">
          <table className="rc-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Category</th>
                <th>Experience</th>
                <th>Salary Range / month</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((g) => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 800, color: "#0f172a" }}>{g.roleTitle}</td>
                  <td>
                    <span className="rc-badge">{g.category}</span>
                  </td>
                  <td style={{ textTransform: "capitalize", fontWeight: 700 }}>
                    {g.experienceLevel}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {fmtINR(g.minSalary)} – {fmtINR(g.maxSalary)}
                  </td>
                  <td style={{ fontWeight: 800, color: "#4f46e5" }}>{fmtINR(g.avgSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const InterviewQuestions = () => {
  const [category, setCategory] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const allQuestions = [
    {
      id: 1,
      category: "HR Round",
      difficulty: "easy",
      question: "Tell me about yourself and your background.",
      answerTips:
        "Keep it to 60–90 seconds: current role, key achievements, and why you're looking for a change.",
    },
    {
      id: 2,
      category: "HR Round",
      difficulty: "easy",
      question: "Why do you want to work for our company?",
      answerTips:
        "Mention specific company values, recent milestones, or products that genuinely excite you.",
    },
    {
      id: 3,
      category: "HR Round",
      difficulty: "medium",
      question: "Where do you see yourself in 5 years?",
      answerTips:
        "Show ambition aligned with professional growth and leadership within the role you're applying for.",
    },
    {
      id: 4,
      category: "HR Round",
      difficulty: "hard",
      question:
        "Describe a situation where you had a conflict with a coworker and how you resolved it.",
      answerTips:
        "Use the STAR method (Situation, Task, Action, Result). Focus on collaboration and professional maturity.",
    },
    {
      id: 5,
      category: "Sales",
      difficulty: "easy",
      question:
        "How would you handle an angry or frustrated customer on a call?",
      answerTips:
        "Look for empathy, active listening, de-escalation techniques, and staying calm under pressure.",
    },
    {
      id: 6,
      category: "Sales",
      difficulty: "medium",
      question: "How do you handle rejection from a prospective client?",
      answerTips:
        "Give a concrete example showing resilience, asking for feedback, and maintaining a long-term follow-up strategy.",
    },
    {
      id: 7,
      category: "Sales",
      difficulty: "hard",
      question:
        "Walk me through how you'd pitch our product to a cold enterprise lead.",
      answerTips:
        "Focus on structured discovery: research, opening hook, identifying pain points, and tying value prop to ROI.",
    },
    {
      id: 8,
      category: "BPO",
      difficulty: "easy",
      question:
        "Are you comfortable working in rotating shifts and night shifts?",
      answerTips:
        "Emphasize time management, adaptability, and your reliable commute or home setup.",
    },
    {
      id: 9,
      category: "BPO",
      difficulty: "medium",
      question:
        "How do you manage high call volume without compromising service quality?",
      answerTips:
        "Mention multi-tasking, active note-taking shortcuts, and maintaining a positive tone on every single call.",
    },
    {
      id: 10,
      category: "BPO",
      difficulty: "hard",
      question:
        "A customer demands a refund that violates company policy. How do you handle it?",
      answerTips:
        "Balance company policy with customer empathy; offer valid alternatives or escalate professionally if needed.",
    },
    {
      id: 11,
      category: "IT / Technical",
      difficulty: "easy",
      question: "Explain the difference between SQL and NoSQL databases.",
      answerTips:
        "Look for understanding of structured tables vs flexible document schemas and use-case trade-offs.",
    },
    {
      id: 12,
      category: "IT / Technical",
      difficulty: "medium",
      question:
        "How do you ensure code quality and performance in a web application?",
      answerTips:
        "Mention code reviews, automated unit testing, CI/CD pipelines, and profiling tools.",
    },
    {
      id: 13,
      category: "IT / Technical",
      difficulty: "hard",
      question:
        "How would you design a scalable rate limiter for a high-traffic public API?",
      answerTips:
        "Discuss token bucket or sliding window algorithms, Redis caching, and distributed system edge cases.",
    },
  ];

  const filteredQuestions = allQuestions.filter((q) => {
    const matchCat = category === "" || q.category === category;
    const matchDiff =
      difficultyFilter === "all" || q.difficulty === difficultyFilter;
    return matchCat && matchDiff;
  });

  return (
    <div>
      <div className="rc-filter-row" style={{ marginBottom: "16px" }}>
        <button
          className={`rc-chip ${category === "" ? "active" : ""}`}
          onClick={() => setCategory("")}
        >
          All Categories
        </button>
        {["HR Round", "Sales", "BPO", "IT / Technical"].map((c) => (
          <button
            key={c}
            className={`rc-chip ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rc-filter-row" style={{ marginBottom: "24px" }}>
        <span
          style={{
            fontSize: "0.85rem",
            color: "#64748b",
            alignSelf: "center",
            marginRight: "6px",
            fontWeight: "700",
          }}
        >
          Difficulty:
        </span>
        {[
          { key: "all", label: "All Levels" },
          { key: "easy", label: "Easy" },
          { key: "medium", label: "Medium" },
          { key: "hard", label: "Hard" },
        ].map((d) => (
          <button
            key={d.key}
            className={`rc-chip ${difficultyFilter === d.key ? "active" : ""}`}
            onClick={() => setDifficultyFilter(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="rc-empty">
          No interview questions found for this filter.
        </div>
      ) : (
        <div className="rc-table-wrap">
          <table className="rc-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Level</th>
                <th style={{ width: "150px" }}>Category</th>
                <th>Interview Question & Expert Answer Tips</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => (
                <tr key={q.id}>
                  <td>
                    <span className={`rc-table-badge rc-diff-${q.difficulty}`}>
                      {q.difficulty.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="rc-badge">{q.category}</span>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "4px",
                      }}
                    >
                      {q.question}
                    </div>
                    {q.answerTips && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#475569",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 600,
                        }}
                      >
                        <span>💡</span> <span>{q.answerTips}</span>
                      </div>
                    )}
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

const Templates = () => {
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const allTemplates = [
    {
      id: "t1",
      title: "Standard Offer Letter Template",
      type: "offer_letter",
      fileType: "docx",
      description:
        "Comprehensive corporate offer letter including CTC breakdown, probation terms, benefits, and joining protocols.",
      downloadCount: 1420,
      content:
        "Dear [Candidate Name],\n\nWe are thrilled to offer you the position of [Job Title] at [Company Name]. Your starting CTC will be [Amount] per annum, structured as per company policy.\n\nYour expected date of joining is [Joining Date]. You will be on a probation period of 3 months.\n\nPlease sign and return a duplicate copy of this letter as token of your acceptance.\n\nSincerely,\nHR Management",
    },
    {
      id: "t2",
      title: "Executive Employment Agreement",
      type: "offer_letter",
      fileType: "pdf",
      description:
        "Detailed executive-level contract template covering clauses on non-disclosure, IP assignment, and compensation.",
      downloadCount: 890,
      content:
        "EXECUTIVE EMPLOYMENT AGREEMENT\n\nThis Agreement is entered into by and between [Company Name] and [Executive Name] for the role of [Title].\n\n1. Duties & Responsibilities\n2. Compensation & Benefits\n3. Non-Disclosure & Intellectual Property\n4. Termination Clauses\n\nAccepted and Agreed:\n[Signatures]",
    },
    {
      id: "t3",
      title: "Standard Notice Period Policy",
      type: "notice_period_policy",
      fileType: "docx",
      description:
        "Clear guidelines on mandatory notice periods, buyout options, handover processes, and early release conditions.",
      downloadCount: 1150,
      content:
        "NOTICE PERIOD POLICY\n\nAll permanent employees are required to serve a notice period of [60 Days] upon resignation. Employees may request an early release subject to manager approval and notice buyout policies.\n\nProper knowledge transfer and asset handover are mandatory before final settlement.",
    },
    {
      id: "t4",
      title: "Immediate Resignation & Notice Period Waiver",
      type: "notice_period_policy",
      fileType: "pdf",
      description:
        "Formal policy framework outlining exceptional circumstances for shortening or waving notice requirements.",
      downloadCount: 630,
      content:
        "NOTICE PERIOD WAIVER GUIDELINES\n\nWaiver of notice period is strictly at management discretion based on project continuity, critical replacements, and exceptional health/personal grounds.",
    },
    {
      id: "t5",
      title: "Experience & Service Certificate",
      type: "offer_letter",
      fileType: "docx",
      description:
        "Official testimonial confirming employee tenure, designation, core responsibilities, and commendable conduct.",
      downloadCount: 2300,
      content:
        "TO WHOMSOEVER IT MAY CONCERN\n\nThis is to certify that [Employee Name] was employed with us as [Designation] from [Start Date] to [End Date].\n\nDuring their tenure, their conduct, performance, and contribution to projects were exemplary. We wish them success in all future endeavors.",
    },
    {
      id: "t6",
      title: "Relieving & Full-and-Final Settlement Letter",
      type: "offer_letter",
      fileType: "docx",
      description:
        "Official relieving document stating successful handover, clearance of dues, and formal exit date.",
      downloadCount: 1840,
      content:
        "RELIEVING LETTER\n\nDear [Employee Name],\n\nWith reference to your resignation dated [Date], we accept your resignation and relieve you from your duties effective [Relieving Date].\n\nYour Full and Final (F&F) settlement has been processed and all company dues have been cleared.\n\nBest regards,\n[Company Name]",
    },
  ];

  const filteredTemplates = allTemplates.filter(
    (t) => type === "" || t.type === type,
  );

  const handleDownloadTemplate = (template, e) => {
    if (e) e.stopPropagation();
    toast.success(`Downloading "${template.title}"...`);

    const blob = new Blob([template.content], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${template.fileType}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Download started successfully!");
  };

  const copyContent = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Template text copied to clipboard!");
  };

  return (
    <div>
      <div className="rc-filter-row" style={{ marginBottom: "24px" }}>
        <button
          className={`rc-chip ${type === "" ? "active" : ""}`}
          onClick={() => setType("")}
        >
          All Templates
        </button>
        <button
          className={`rc-chip ${type === "offer_letter" ? "active" : ""}`}
          onClick={() => setType("offer_letter")}
        >
          Offer Letters & Certificates
        </button>
        <button
          className={`rc-chip ${type === "notice_period_policy" ? "active" : ""}`}
          onClick={() => setType("notice_period_policy")}
        >
          Notice Period Policies
        </button>
      </div>

      {loading ? (
        <div className="rc-empty">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="rc-empty">
          No templates published under this category yet.
        </div>
      ) : (
        <div className="rc-card-grid">
          {filteredTemplates.map((t) => (
            <div
              className="rc-card-3d"
              key={t.id}
              onClick={() => setPreviewTemplate(t)}
              style={{ cursor: "pointer", padding: "24px" }}
            >
              <div className="card-bg-light-glow"></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="rc-card-icon" style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
                <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{t.title}</h4>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.5', margin: '0 0 14px', fontWeight: '600' }}>{t.description}</p>
                <div className="rc-card-meta" style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', marginBottom: '16px' }}>
                  {t.downloadCount} downloads · Format:{" "}
                  <strong>{t.fileType.toUpperCase()}</strong>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="cv-action-btn secondary"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(t);
                    }}
                  >
                    👁 Preview
                  </button>
                  <button
                    className="cv-action-btn primary glow-btn"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                    onClick={(e) => handleDownloadTemplate(t, e)}
                  >
                    ⬇ Download
                  </button>
                </div>
              </div>
              <div className="card-glow-bar"></div>
            </div>
          ))}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <div
          className="rb-modal-overlay"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="rb-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "750px", background: "#ffffff", borderRadius: '24px', border: '1.5px solid #cbd5e1', padding: '36px', position: 'relative' }}
          >
            <div className="card-bg-light-glow"></div>
            <button
              className="rb-modal-close"
              onClick={() => setPreviewTemplate(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: '800', cursor: 'pointer', zIndex: 10 }}
            >
              ✕
            </button>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxHeight: "85vh",
                overflowY: "auto",
                position: 'relative',
                zIndex: 2,
              }}
            >
              <span className="rb-template-category" style={{ fontSize: '11.5px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' }}>
                {previewTemplate.fileType.toUpperCase()} TEMPLATE
              </span>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                {previewTemplate.title}
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "600" }}>
                {previewTemplate.description}
              </p>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "12px",
                  padding: "18px",
                  whiteSpace: "pre-wrap",
                  fontSize: "0.85rem",
                  color: "#334155",
                  lineHeight: "1.6",
                  fontWeight: "600",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {previewTemplate.content}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  className="cv-action-btn secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => copyContent(previewTemplate.content)}
                >
                  📋 Copy Text
                </button>
                <button
                  className="cv-action-btn primary glow-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={(e) => handleDownloadTemplate(previewTemplate, e)}
                >
                  ⬇ Download File ({previewTemplate.fileType.toUpperCase()})
                </button>
              </div>
            </div>
            <div className="card-glow-bar"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const ComplianceChecklists = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.resourceCenter
      .getComplianceChecklists()
      .then((res) => setChecklists(res?.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rc-empty">Loading checklists...</div>;
  if (checklists.length === 0)
    return <div className="rc-empty">No checklists published yet.</div>;

  return (
    <div className="rc-card-grid">
      {checklists.map((c) => (
        <div className="rc-card-3d" key={c.id} style={{ padding: '24px' }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="rc-card-icon" style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
            <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{c.title}</h4>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.5', margin: '0 0 14px', fontWeight: '600' }}>{c.description}</p>
            <div className="rc-card-meta" style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', marginBottom: '16px' }}>
              {(c.items || []).length} items · {c.downloadCount || 0} downloads
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="cv-action-btn secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                onClick={() => setOpen(open === c.id ? null : c.id)}
              >
                {open === c.id ? "Hide" : "Preview"}
              </button>
              <button
                className="cv-action-btn primary glow-btn"
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                onClick={() => api.resourceCenter.downloadChecklist(c.id)}
              >
                Download
              </button>
            </div>
            {open === c.id && (
              <ul className="rc-checklist-preview" style={{ marginTop: '16px', paddingLeft: '18px', fontSize: '13px', color: '#334155', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(c.items || []).map((item, i) => (
                  <li key={i}>{item.text}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="card-glow-bar"></div>
        </div>
      ))}
    </div>
  );
};

const PayrollCalculator = () => {
  const [ctc, setCtc] = useState(600000);
  const [state, setState] = useState("Uttar Pradesh");
  const [basicPercent, setBasicPercent] = useState(40);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.resourceCenter.calculatePayroll({
        annualCTC: Number(ctc),
        state,
        basicPercent: Number(basicPercent),
      });
      if (!res.success) throw new Error(res.message);
      setResult(res.data);
    } catch (err) {
      setError(err.message || "Calculation failed");
    }
    setLoading(false);
  };

  return (
    <div className="rc-card-3d" style={{ padding: '36px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-bg-light-glow"></div>
      <form className="rc-calc-form" onSubmit={calculate} style={{ position: 'relative', zIndex: 2 }}>
        <div className="form-group-custom" style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: '800', fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>Annual CTC (₹)</label>
          <input
            type="number"
            min="100000"
            step="1000"
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', fontWeight: '600', color: '#0f172a', outline: 'none' }}
          />
        </div>
        <div className="form-group-custom" style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: '800', fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>State</label>
          <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', fontWeight: '700', color: '#0f172a', outline: 'none' }}>
            {[
              "Uttar Pradesh",
              "Delhi",
              "Haryana",
              "Maharashtra",
              "Karnataka",
              "West Bengal",
              "Andhra Pradesh",
              "Telangana",
              "Tamil Nadu",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group-custom" style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: '800', fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>Basic % of CTC</label>
          <input
            type="number"
            min="30"
            max="60"
            value={basicPercent}
            onChange={(e) => setBasicPercent(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', fontWeight: '600', color: '#0f172a', outline: 'none' }}
          />
        </div>
        <button className="cv-action-btn primary glow-btn" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? "Calculating..." : "Calculate In-Hand Salary ✨"}
        </button>
      </form>

      {error && <div className="form-error" style={{ position: 'relative', zIndex: 2, marginTop: '16px', padding: '12px', background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fecaca', borderRadius: '12px', fontWeight: '700' }}>{error}</div>}

      {result && (
        <div className="rc-calc-result" style={{ position: 'relative', zIndex: 2, marginTop: '30px' }}>
          <div className="rc-calc-headline" style={{ background: '#f1f5f9', padding: '16px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: '1.5px solid #cbd5e1' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#334155' }}>Estimated Monthly In-Hand</span>
            <strong style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>{fmtINR(result.monthly.netInHand)}</strong>
          </div>
          <div className="rc-table-wrap">
            <table className="rc-table">
              <tbody>
                <tr>
                  <td style={{ fontWeight: '700' }}>Basic (monthly)</td>
                  <td style={{ fontWeight: '700', textAlign: 'right' }}>{fmtINR(result.monthly.basic)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '700' }}>HRA (monthly)</td>
                  <td style={{ fontWeight: '700', textAlign: 'right' }}>{fmtINR(result.monthly.hra)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '700' }}>Special Allowance</td>
                  <td style={{ fontWeight: '700', textAlign: 'right' }}>{fmtINR(result.monthly.specialAllowance)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '800', color: '#0f172a' }}>Gross Monthly</td>
                  <td style={{ fontWeight: '800', color: '#0f172a', textAlign: 'right' }}>{fmtINR(result.monthly.gross)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '700', color: '#ef4444' }}>Employee PF</td>
                  <td style={{ fontWeight: '700', color: '#ef4444', textAlign: 'right' }}>- {fmtINR(result.monthly.employeePF)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '700', color: '#ef4444' }}>Employee ESI</td>
                  <td style={{ fontWeight: '700', color: '#ef4444', textAlign: 'right' }}>- {fmtINR(result.monthly.employeeESI)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '700', color: '#ef4444' }}>Professional Tax</td>
                  <td style={{ fontWeight: '700', color: '#ef4444', textAlign: 'right' }}>- {fmtINR(result.monthly.professionalTax)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '700', color: '#ef4444' }}>Estimated TDS</td>
                  <td style={{ fontWeight: '700', color: '#ef4444', textAlign: 'right' }}>- {fmtINR(result.monthly.estimatedTDS)}</td>
                </tr>
                <tr className="rc-table-total" style={{ background: '#ecfdf5', borderTop: '2px solid #a7f3d0' }}>
                  <td style={{ fontWeight: '900', color: '#065f46', fontSize: '15px' }}>Net In-Hand</td>
                  <td style={{ fontWeight: '900', color: '#065f46', fontSize: '15px', textAlign: 'right' }}>{fmtINR(result.monthly.netInHand)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="rc-disclaimer" style={{ fontSize: '11.5px', color: '#64748b', marginTop: '14px', fontWeight: '600' }}>{result.disclaimer}</p>
        </div>
      )}
      <div className="card-glow-bar"></div>
    </div>
  );
};

const ResourceCenter = () => {
  const [tab, setTab] = useState("salary");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.resourceCenter.getStats().then((res) => {
      if (res?.success) setStats(res.data);
    });
  }, []);

  return (
    <div className="resource-center-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="rc-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="rc-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Marquee Banner */}
      <div className="rc-marquee-banner">
        <div className="rc-marquee-track">
          <span>✨ Welcome to Recruweb Free Hiring Resource Center</span>
          <span>•</span>
          <span>📊 Live Salary Benchmarks &amp; Market Guides</span>
          <span>•</span>
          <span>🎤 Top Interview Question Banks &amp; Answer Tips</span>
          <span>•</span>
          <span>📄 Verified Offer Letters &amp; HR Templates</span>
        </div>
      </div>

      <section
        className="hero resource-center-hero"
        style={{ minHeight: "45vh", paddingTop: "80px", position: 'relative', zIndex: 1 }}
      >
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <div className="rc-badge-hero">
              <span className="rc-badge-dot"></span>
              <span>100% Free Resource Suite</span>
            </div>
            <h1 className="section-title" style={{ fontSize: "42px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" }}>
              Free Hiring <span className="gradient-text">Resource Center</span>
            </h1>
            <p className="section-subtitle" style={{ fontSize: "16.5px", color: "#64748b", maxWidth: "700px", margin: "0 auto", fontWeight: '600' }}>
              Live salary guides, interview question banks, offer letter &amp;
              notice period templates, HR compliance checklists, and a payroll
              calculator — all in one place.
            </p>
          </div>

          {stats && (
            <div className="rc-stats-row-3d">
              <div className="rc-stat-box">
                <div className="card-bg-light-glow"></div>
                <strong style={{ position: 'relative', zIndex: 2 }}>{stats.salaryGuides}</strong> <span style={{ position: 'relative', zIndex: 2 }}>Salary Benchmarks</span>
                <div className="card-glow-bar"></div>
              </div>
              <div className="rc-stat-box">
                <div className="card-bg-light-glow"></div>
                <strong style={{ position: 'relative', zIndex: 2 }}>{stats.interviewQuestions}</strong> <span style={{ position: 'relative', zIndex: 2 }}>Interview Questions</span>
                <div className="card-glow-bar"></div>
              </div>
              <div className="rc-stat-box">
                <div className="card-bg-light-glow"></div>
                <strong style={{ position: 'relative', zIndex: 2 }}>{stats.templates}</strong> <span style={{ position: 'relative', zIndex: 2 }}>Templates</span>
                <div className="card-glow-bar"></div>
              </div>
              <div className="rc-stat-box">
                <div className="card-bg-light-glow"></div>
                <strong style={{ position: 'relative', zIndex: 2 }}>{stats.checklists}</strong> <span style={{ position: 'relative', zIndex: 2 }}>Checklists</span>
                <div className="card-glow-bar"></div>
              </div>
              <div className="rc-stat-box">
                <div className="card-bg-light-glow"></div>
                <strong style={{ position: 'relative', zIndex: 2 }}>{stats.totalDownloads}</strong> <span style={{ position: 'relative', zIndex: 2 }}>Downloads</span>
                <div className="card-glow-bar"></div>
              </div>
            </div>
          )}
        </div>
        <ScrollIndicator />
      </section>

      <section className="section" style={{ position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
        <div className="container">
          <div className="rc-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`rc-tab ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rc-tab-panel">
            {tab === "salary" && <SalaryGuides />}
            {tab === "interview" && <InterviewQuestions />}
            {tab === "templates" && <Templates />}
            {tab === "compliance" && <ComplianceChecklists />}
            {tab === "payroll" && <PayrollCalculator />}
          </div>
        </div>
      </section>

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .resource-center-wrapper-light {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow-x: hidden;
        }

        .container {
          max-width: 1150px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Particles Background */
        .rc-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .rc-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatRcParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatRcParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Marquee Ribbon */
        .rc-marquee-banner {
          background: linear-gradient(90deg, #4f46e5, #9333ea);
          color: #ffffff;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
        }

        .rc-marquee-track {
          display: inline-block;
          animation: marqueeScroll 28s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .rc-marquee-track span {
          margin: 0 20px;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .rc-badge-hero {
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

        .rc-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Stats Row */
        .rc-stats-row-3d {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-top: 40px;
        }

        .rc-stat-box {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 18px;
          padding: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .rc-stat-box:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 16px 40px rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .rc-stat-box strong {
          display: block;
          font-size: 24px;
          font-weight: 900;
          color: #4f46e5;
          margin-bottom: 2px;
        }

        .rc-stat-box span {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
        }

        /* Tabs */
        .rc-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          background: #ffffff;
          padding: 8px;
          border-radius: 18px;
          border: 1.5px solid #cbd5e1;
          margin-bottom: 28px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
        }

        .rc-tab {
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
          flex: 1;
          text-align: center;
        }

        .rc-tab:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .rc-tab.active {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
        }

        /* Filter Chips */
        .rc-filter-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .rc-chip {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #475569;
          padding: 7px 16px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rc-chip:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .rc-chip.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }

        /* Cards Grid & 3D Effect */
        .rc-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .rc-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .rc-card-3d:hover {
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

        .rc-card-3d:hover .card-glow-bar,
        .rc-stat-box:hover .card-glow-bar {
          transform: scaleX(1);
        }

        /* Tables */
        .rc-table-wrap {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
        }

        .rc-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .rc-table th {
          background: #f8fafc;
          color: #4f46e5;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 11.5px;
          padding: 16px 20px;
          border-bottom: 1.5px solid #cbd5e1;
          letter-spacing: 0.5px;
        }

        .rc-table td {
          padding: 16px 20px;
          font-size: 13.5px;
          color: #334155;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }

        .rc-table tbody tr:hover {
          background: #f8fafc;
        }

        .rc-badge {
          background: #e0e7ff;
          color: #4338ca;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
        }

        .rc-table-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .rc-diff-easy { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .rc-diff-medium { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
        .rc-diff-hard { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        .rc-empty {
          text-align: center;
          padding: 60px;
          background: #ffffff;
          border-radius: 20px;
          border: 1.5px solid #cbd5e1;
          font-weight: 700;
          color: #64748b;
        }

        .cv-action-btn {
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13.5px;
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

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        @media (max-width: 768px) {
          .rc-card-grid {
            grid-template-columns: 1fr;
          }
          .rc-stats-row-3d {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ResourceCenter;