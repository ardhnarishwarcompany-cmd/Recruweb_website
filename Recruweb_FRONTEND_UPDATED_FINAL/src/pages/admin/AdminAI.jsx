import { useEffect, useState } from "react";
import { api } from "../../utils/api";

export default function AdminAI() {
  const [tab, setTab] = useState("jd"); // jd | match | rank | email | resume
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    api.jobs
      .getAll({ limit: 200 })
      .then((r) => r?.success && setJobs(r.data || r.jobs || []));
    api.candidates
      .getAll({ limit: 500 })
      .then((r) => r?.success && setCandidates(r.data || []));
  }, []);

  return (
    <div className="dark-ai-container">
      {/* Background Glowing Orbs */}
      <div className="ai-orb orb-1"></div>
      <div className="ai-orb orb-2"></div>

      {/* Header Bar */}
      <div className="ai-header-3d">
        <div>
          <h1 className="ai-title">
            AI Tools <span className="gradient-glow">— Automation Suite</span>
          </h1>
          <p className="ai-subtitle">
            Resume Parser with File Upload &amp; AI Editing Feedback, JD Parser,
            AI Job Matching, Ranking, &amp; Email Writer.
          </p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="ai-tabs-bar">
        {[
          ["jd", "JD Parser"],
          ["match", "AI Job Matching"],
          ["rank", "AI Candidate Ranking"],
          ["email", "AI Email Writer"],
          ["resume", "Resume Parser & AI Editor"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`ai-tab-btn${tab === key ? " active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="ai-tab-content-area">
        {tab === "jd" && <JdParserTab jobs={jobs} />}
        {tab === "match" && <MatchTab jobs={jobs} />}
        {tab === "rank" && <RankTab jobs={jobs} />}
        {tab === "email" && (
          <EmailWriterTab candidates={candidates} jobs={jobs} />
        )}
        {tab === "resume" && <ResumeReparseTab candidates={candidates} />}
      </div>

      {/* Embedded Full Dark Theme CSS */}
      <style>{`
        .dark-ai-container {
          position: relative;
          background: #0b0f19;
          min-height: 100vh;
          padding: 24px;
          color: #f8fafc;
          font-family: inherit;
          overflow-x: hidden;
        }

        .ai-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          top: -10%;
          right: -5%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%);
        }

        .orb-2 {
          width: 450px;
          height: 450px;
          bottom: 10%;
          left: -5%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, transparent 70%);
        }

        .ai-header-3d {
          position: relative;
          z-index: 2;
          margin-bottom: 24px;
        }

        .ai-title {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .gradient-glow {
          background: linear-gradient(135deg, #a855f7 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ai-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .ai-tabs-bar {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          padding: 6px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
        }

        .ai-tab-btn {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 13.5px;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .ai-tab-btn.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.25));
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.4);
        }

        .ai-glass-panel {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .ai-glass-panel h3 {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 16px;
        }

        .ai-select-dark, .ai-input, .textarea-dark, .file-input-dark {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          color: #ffffff;
          font-size: 13.5px;
          outline: none;
          margin-bottom: 14px;
        }

        .dark-option {
          background-color: #0f172a !important;
          color: #ffffff !important;
        }

        .btn-ai-action {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-ai-action:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(99, 102, 241, 0.5);
        }

        .btn-ai-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ai-table-wrap {
          overflow-x: auto;
          margin-top: 16px;
        }

        .ai-dark-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .ai-dark-table th {
          padding: 14px 16px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          letter-spacing: 0.5px;
        }

        .ai-dark-table td {
          padding: 16px;
          font-size: 13.5px;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          vertical-align: middle;
        }

        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .ai-result-box {
          margin-top: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 20px;
          border-radius: 16px;
        }

        .ai-result-box p {
          margin: 0 0 10px;
          color: #cbd5e1;
          font-size: 13.5px;
        }

        .ai-empty-state {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

function JdParserTab({ jobs }) {
  const [jobId, setJobId] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const payload = jobId ? { jobId } : { text };
    const res = await api.ai.parseJD(payload);
    if (res?.success) setResult(res.data);
    setLoading(false);
  };

  return (
    <div className="ai-glass-panel">
      <h3>Job Description Parser</h3>
      <select
        value={jobId}
        onChange={(e) => {
          setJobId(e.target.value);
          setText("");
        }}
        className="ai-select-dark"
      >
        <option value="" className="dark-option">
          — Paste text below instead —
        </option>
        {jobs.map((j) => (
          <option key={j.id} value={j.id} className="dark-option">
            {j.title} @ {j.company}
          </option>
        ))}
      </select>
      {!jobId && (
        <textarea
          rows={6}
          placeholder="Paste a job description here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="textarea-dark"
        />
      )}
      <button
        className="btn-ai-action"
        onClick={run}
        disabled={loading || (!jobId && !text)}
      >
        {loading ? "Parsing..." : "Parse Job Description"}
      </button>

      {result && (
        <div className="ai-result-box">
          <p>
            <strong>Skills detected:</strong>{" "}
            {result.skills?.join(", ") || "None"}
          </p>
          <p>
            <strong>Education:</strong>{" "}
            {result.education?.join(", ") || "Not specified"}
          </p>
          <p>
            <strong>Experience required:</strong> {result.minExperience}
            {result.maxExperience ? ` – ${result.maxExperience}` : "+"} years
          </p>
          {result.mustHaves?.length > 0 && (
            <>
              <p>
                <strong>Must-have requirements:</strong>
              </p>
              <ul style={{ paddingLeft: "20px", color: "#cbd5e1" }}>
                {result.mustHaves.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MatchTab({ jobs }) {
  const [jobId, setJobId] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!jobId) return;
    setLoading(true);
    const res = await api.ai.matchCandidates(jobId);
    if (res?.success) setResults(res);
    setLoading(false);
  };

  return (
    <div className="ai-glass-panel">
      <h3>AI Job Matching — Best-Fit Candidates</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="ai-select-dark"
          style={{ flex: 1, minWidth: "250px" }}
        >
          <option value="" className="dark-option">
            Select a job posting
          </option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id} className="dark-option">
              {j.title} @ {j.company}
            </option>
          ))}
        </select>
        <button
          className="btn-ai-action"
          onClick={run}
          disabled={loading || !jobId}
        >
          {loading ? "Matching..." : "Find Best Matches"}
        </button>
      </div>

      {results && (
        <div className="ai-table-wrap">
          {!results.data.length ? (
            <div className="ai-empty-state">
              No active candidates in the database yet.
            </div>
          ) : (
            <table className="ai-dark-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Overall Score</th>
                  <th>Skill Match</th>
                  <th>Experience Fit</th>
                  <th>Resume Quality</th>
                </tr>
              </thead>
              <tbody>
                {results.data.slice(0, 50).map((r) => (
                  <tr key={r.candidateId} className="table-row-hover">
                    <td>
                      <strong>{r.candidateName}</strong>
                    </td>
                    <td>
                      <span style={{ color: "#38bdf8", fontWeight: "800" }}>
                        {r.score}/100
                      </span>
                    </td>
                    <td>{r.breakdown.skillOverlapPct}%</td>
                    <td>{r.breakdown.experienceFitPct}%</td>
                    <td>{r.breakdown.resumeQualityPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function RankTab({ jobs }) {
  const [jobId, setJobId] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!jobId) return;
    setLoading(true);
    const res = await api.ai.rankCandidates(jobId);
    if (res?.success) setResults(res);
    setLoading(false);
  };

  return (
    <div className="ai-glass-panel">
      <h3>AI Candidate Ranking — Pipeline Applicant Sorting</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="ai-select-dark"
          style={{ flex: 1, minWidth: "250px" }}
        >
          <option value="" className="dark-option">
            Select a job posting
          </option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id} className="dark-option">
              {j.title} @ {j.company}
            </option>
          ))}
        </select>
        <button
          className="btn-ai-action"
          onClick={run}
          disabled={loading || !jobId}
        >
          {loading ? "Ranking..." : "Rank Pipeline"}
        </button>
      </div>

      {results && (
        <div className="ai-table-wrap">
          {!results.data.length ? (
            <div className="ai-empty-state">
              No candidates linked to this job yet.
            </div>
          ) : (
            <table className="ai-dark-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate Name</th>
                  <th>Pipeline Stage</th>
                  <th>AI Score</th>
                </tr>
              </thead>
              <tbody>
                {results.data.map((r) => (
                  <tr key={r.candidateId} className="table-row-hover">
                    <td>
                      <span style={{ fontWeight: "800", color: "#a855f7" }}>
                        #{r.rank}
                      </span>
                    </td>
                    <td>
                      <strong>{r.candidateName}</strong>
                    </td>
                    <td>{r.pipelineStage}</td>
                    <td>
                      <span style={{ color: "#34d399", fontWeight: "800" }}>
                        {r.score}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function EmailWriterTab({ candidates, jobs }) {
  const [type, setType] = useState("interview_invite");
  const [candidateId, setCandidateId] = useState("");
  const [jobId, setJobId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const res = await api.ai.generateEmail({
      type,
      candidateId: candidateId || undefined,
      jobId: jobId || undefined,
      extra: type === "custom" ? { prompt } : {},
    });
    if (res?.success) setResult(res.data);
    setLoading(false);
  };

  return (
    <div className="ai-glass-panel">
      <h3>AI Email Writer</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="ai-select-dark"
        >
          <option value="interview_invite" className="dark-option">
            Interview Invite
          </option>
          <option value="offer" className="dark-option">
            Offer Letter Email
          </option>
          <option value="rejection" className="dark-option">
            Rejection Notice
          </option>
          <option value="follow_up" className="dark-option">
            Recruiter Follow-up
          </option>
          <option value="custom" className="dark-option">
            Custom Prompt
          </option>
        </select>
        <select
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
          className="ai-select-dark"
        >
          <option value="" className="dark-option">
            No candidate (generic)
          </option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id} className="dark-option">
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="ai-select-dark"
        >
          <option value="" className="dark-option">
            No job (generic)
          </option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id} className="dark-option">
              {j.title} @ {j.company}
            </option>
          ))}
        </select>
      </div>

      {type === "custom" && (
        <textarea
          rows={4}
          placeholder="What should this custom email say?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="textarea-dark"
        />
      )}

      <button className="btn-ai-action" onClick={run} disabled={loading}>
        {loading ? "Writing Email..." : "Generate Email Draft"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "16px",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            padding: "18px",
            borderRadius: "16px",
          }}
        >
          <div
            style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}
          >
            Source:{" "}
            {result.source === "ai"
              ? "🤖 AI-generated (OpenAI)"
              : "📋 Template Draft"}
          </div>
          <p style={{ margin: "0 0 8px", color: "#ffffff" }}>
            <strong>Subject:</strong> {result.subject}
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              color: "#cbd5e1",
              margin: 0,
              fontSize: "13.5px",
            }}
          >
            {result.body}
          </pre>
        </div>
      )}
    </div>
  );
}

function ResumeReparseTab({ candidates }) {
  const [candidateId, setCandidateId] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!candidateId && !resumeFile) {
      setError("Please select a candidate or upload a resume file.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (!candidateId) {
        // The backend's re-parse endpoint (/api/ai/re-parse-resume/:candidateId)
        // only re-parses a resume already stored against an existing ATS
        // candidate — there is no endpoint that accepts a brand-new,
        // unattached file upload. Rather than fabricate a result, tell the
        // admin what the real backend actually supports.
        setError(
          "Direct file analysis isn't supported yet — please select an existing ATS candidate above (their uploaded resume will be re-parsed by the live AI backend).",
        );
        setLoading(false);
        return;
      }

      const res = await api.ai.reparseResume(candidateId);

      if (res?.success && res.data) {
        setResult(res.data);
      } else {
        setError(res?.message || "Failed to analyze resume.");
      }
    } catch (err) {
      setError(
        err?.message ||
          "Could not reach the AI server. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-glass-panel">
      <h3>Resume Parser &amp; AI Editing Assistant</h3>
      <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
        Upload a resume PDF/DOCX or select an existing candidate to get instant
        AI scoring, skill extraction, and professional editing recommendations.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div className="input-group-3d">
          <label
            style={{
              fontSize: "12.5px",
              fontWeight: "700",
              color: "#cbd5e1",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Select Existing Candidate
          </label>
          <select
            value={candidateId}
            onChange={(e) => {
              setCandidateId(e.target.value);
              if (e.target.value) setResumeFile(null);
            }}
            className="ai-select-dark"
          >
            <option value="" className="dark-option">
              — Choose from ATS Candidates —
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id} className="dark-option">
                {c.firstName} {c.lastName}{" "}
                {c.resume ? "" : "(no resume uploaded)"}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group-3d">
          <label
            style={{
              fontSize: "12.5px",
              fontWeight: "700",
              color: "#cbd5e1",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Or Upload Resume File (PDF / DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="file-input-dark"
            onChange={(e) => {
              if (e.target.files[0]) {
                setResumeFile(e.target.files[0]);
                setCandidateId("");
              }
            }}
          />
        </div>
      </div>

      <button
        className="btn-ai-action"
        onClick={run}
        disabled={loading || (!candidateId && !resumeFile)}
      >
        {loading
          ? "Analyzing Resume with AI..."
          : "⚡ Run AI Resume Audit & Editing"}
      </button>

      {error && <p style={{ color: "#f87171", marginTop: "12px" }}>{error}</p>}

      {result && (
        <div className="ai-result-box" style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "16px", color: "#ffffff" }}>
              📊 AI Resume Evaluation Report
            </h4>
            <span
              style={{
                background: "rgba(56, 189, 248, 0.2)",
                color: "#38bdf8",
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: "800",
                fontSize: "13px",
                border: "1px solid rgba(56, 189, 248, 0.4)",
              }}
            >
              Score: {result.aiScore}/100
            </span>
          </div>

          <p>
            <strong>Detected Skills:</strong>{" "}
            {result.skills?.join(", ") || "None detected"}
          </p>
          <p>
            <strong>Total Experience:</strong> {result.experience} Years
          </p>
          <p>
            <strong>Education:</strong>{" "}
            {result.education?.join(", ") || "Not detected"}
          </p>
          <p>
            <strong>Professional Summary:</strong> {result.aiSummary}
          </p>

          {result.feedback && (
            <div
              style={{
                marginTop: "16px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                padding: "16px",
                borderRadius: "14px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#a5b4fc",
                  marginBottom: "8px",
                }}
              >
                💡 AI Editing Suggestions &amp; Recommendations:
              </strong>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "#cbd5e1",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {result.feedback.map((tip, idx) => (
                  <li key={idx} style={{ fontSize: "13.5px" }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}