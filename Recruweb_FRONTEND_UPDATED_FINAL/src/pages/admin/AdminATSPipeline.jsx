import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import JoiningTrackerStepper from "../../components/JoiningTrackerStepper";
import ScrollIndicator from "../../components/ScrollIndicator";

const PIPELINE_STAGES = [
  "New Lead",
  "CV Received",
  "AI Screened",
  "Recruiter Reviewed",
  "Submitted To Client",
  "Interview Scheduled",
  "Interview Cleared",
  "Offer Released",
  "Joined",
  "Retained 90 Days",
];

const SOURCES = [
  "LinkedIn",
  "Naukri",
  "Indeed",
  "Referral",
  "Website",
  "Walk-In",
  "Other",
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  source: "Other",
  jobId: "",
  experience: "",
};

const Stars = ({ value = 0, onChange }) => (
  <div className="star-rating-row">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className={`ats-star-btn${n <= value ? " filled" : ""}`}
        onClick={() => onChange && onChange(n)}
        title={`${n} star${n > 1 ? "s" : ""}`}
      >
        ★
      </button>
    ))}
  </div>
);

const AdminATSPipeline = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);

  const [selected, setSelected] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [docLabel, setDocLabel] = useState("");
  const [offerFile, setOfferFile] = useState(null);
  const [offerForm, setOfferForm] = useState({ position: "", joiningDate: "" });
  const [busyAction, setBusyAction] = useState("");
  const [verifyingIndex, setVerifyingIndex] = useState(null);
  const [tracker, setTracker] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const loadCandidates = async () => {
    setLoading(true);
    setError("");
    const res = await api.candidates.getAll({ limit: 200, search });
    if (res && res.success) {
      setCandidates(res.data);
    } else {
      setError(res?.message || "Failed to load candidates from the server.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCandidates();
    api.jobs.getAll({ limit: 100 }).then((res) => {
      if (res?.success) setJobs(res.data?.jobs || res.data || []);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(loadCandidates, 400);
    return () => clearTimeout(t);
  }, [search]);

  const columns = useMemo(() => {
    const grouped = {};
    PIPELINE_STAGES.forEach((s) => (grouped[s] = []));
    candidates.forEach((c) => {
      if (!grouped[c.pipelineStage]) grouped[c.pipelineStage] = [];
      grouped[c.pipelineStage].push(c);
    });
    return grouped;
  }, [candidates]);

  const refreshSelected = async (id) => {
    const res = await api.candidates.getById(id);
    if (res?.success) setSelected(res.data);
    const trackerRes = await api.candidates.getTracker(id);
    if (trackerRes?.success) setTracker(trackerRes.data);
  };

  const closeDrawer = () => {
    setSelected(null);
    setTracker(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      jobId: form.jobId || null,
      experience: form.experience ? Number(form.experience) : 0,
    };
    const res = await api.candidates.create(payload);
    setSaving(false);
    if (res?.success) {
      setShowAddForm(false);
      setForm(emptyForm);
      loadCandidates();
      showToast("Candidate lead added successfully!", "success");
    } else {
      showToast(res?.message || "Failed to create candidate", "error");
    }
  };

  const handleStageChange = async (candidate, stage) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id ? { ...c, pipelineStage: stage } : c,
      ),
    );
    const res = await api.candidates.updateStage(candidate.id, stage);
    if (!res?.success) {
      loadCandidates();
      showToast(res?.message || "Failed to move candidate stage", "error");
    } else {
      showToast(`Candidate moved to ${stage}`, "success");
      if (selected?.id === candidate.id) {
        refreshSelected(candidate.id);
      }
    }
  };

  const handleRating = async (rating) => {
    if (!selected) return;
    const res = await api.candidates.updateRating(selected.id, rating);
    if (res?.success) {
      setSelected((s) => ({ ...s, rating }));
      setCandidates((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, rating } : c)),
      );
      showToast("Candidate rating updated!", "success");
    } else {
      showToast("Failed to update rating", "error");
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selected) return;
    setBusyAction("note");
    const res = await api.candidates.addNote(selected.id, noteText.trim());
    setBusyAction("");
    if (res?.success) {
      setNoteText("");
      refreshSelected(selected.id);
      showToast("Recruiter note added successfully!", "success");
    } else {
      showToast(res?.message || "Failed to add note", "error");
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile || !selected) return;
    setBusyAction("resume");
    const res = await api.candidates.uploadResume(selected.id, resumeFile);
    setBusyAction("");
    if (res?.success) {
      setResumeFile(null);
      refreshSelected(selected.id);
      loadCandidates();
      showToast("Resume uploaded & parsed successfully via AI!", "success");
    } else {
      showToast(res?.message || "Resume upload failed", "error");
    }
  };

  const handleDocUpload = async () => {
    if (!docFile || !selected) return;
    setBusyAction("document");
    const res = await api.candidates.uploadDocument(
      selected.id,
      docFile,
      docLabel,
    );
    setBusyAction("");
    if (res?.success) {
      setDocFile(null);
      setDocLabel("");
      refreshSelected(selected.id);
      showToast("Document uploaded successfully!", "success");
    } else {
      showToast(res?.message || "Document upload failed", "error");
    }
  };

  const handleVerifyDoc = async (index, status) => {
    if (!selected) return;
    let remarks = "";
    if (status === "rejected") {
      remarks = window.prompt("Reason for rejecting this document?") || "";
    }
    setVerifyingIndex(index);
    const res = await api.candidates.verifyDocument(
      selected.id,
      index,
      status,
      remarks,
    );
    setVerifyingIndex(null);
    if (res?.success) {
      refreshSelected(selected.id);
      showToast(`Document status updated to ${status}`, "success");
    } else {
      showToast(res?.message || "Failed to update document status", "error");
    }
  };

  const handleOfferUpload = async () => {
    if (!offerFile || !selected) return;
    setBusyAction("offer");
    const res = await api.candidates.uploadOfferLetter(selected.id, offerFile);
    setBusyAction("");
    if (res?.success) {
      setOfferFile(null);
      refreshSelected(selected.id);
      loadCandidates();
      showToast("Offer letter uploaded successfully!", "success");
    } else {
      showToast(res?.message || "Offer letter upload failed", "error");
    }
  };

  const handleGenerateOfferLetter = async () => {
    if (!selected) return;
    if (!offerForm.position || !offerForm.joiningDate) {
      showToast("Please fill Position and Joining Date first", "error");
      return;
    }
    setBusyAction("offer-generate");
    const res = await api.candidates.generateOfferLetter(
      selected.id,
      offerForm,
    );
    setBusyAction("");
    if (res?.success) {
      showToast(res.message || "Offer letter generated & emailed!", "success");
      refreshSelected(selected.id);
      loadCandidates();
    } else {
      showToast(
        res?.message || "Failed to generate/send offer letter",
        "error",
      );
    }
  };

  const handleReject = async (candidate) => {
    const reason = window.prompt(
      `Reason for rejecting ${candidate.firstName}? (visible only to staff)`,
    );
    if (reason === null) return;
    setBusyAction("reject");
    const res = await api.candidates.reject(candidate.id, reason);
    setBusyAction("");
    if (res?.success) {
      refreshSelected(candidate.id);
      loadCandidates();
      showToast("Candidate marked as rejected.", "success");
    } else {
      showToast(res?.message || "Failed to reject candidate", "error");
    }
  };

  const handleUnreject = async (candidate) => {
    setBusyAction("unreject");
    const res = await api.candidates.unreject(candidate.id);
    setBusyAction("");
    if (res?.success) {
      refreshSelected(candidate.id);
      loadCandidates();
      showToast("Candidate restored to pipeline successfully!", "success");
    } else {
      showToast(res?.message || "Failed to restore candidate", "error");
    }
  };

  const handleDelete = async (candidate) => {
    if (!window.confirm(`Remove ${candidate.firstName} from the pipeline?`))
      return;
    const res = await api.candidates.delete(candidate.id);
    if (res?.success) {
      setSelected(null);
      loadCandidates();
      showToast("Candidate removed from system.", "success");
    } else {
      showToast(res?.message || "Failed to delete candidate", "error");
    }
  };

  return (
    <div className="light-ats-container">
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
      <div className="ats-marquee-banner">
        <div className="ats-marquee-track">
          <span>✨ Recruweb Enterprise Candidate Pipeline &amp; ATS Hub</span>
          <span>•</span>
          <span>🎯 Dynamic Recruitment Stages &amp; Automated AI Screenings</span>
          <span>•</span>
          <span>⭐ Joining Trackers, Document Verification &amp; Offer Letters</span>
        </div>
      </div>

      {toast.show && (
        <div className={`glass-toast-alert ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" ? "✨" : "⚠️"}
          </span>
          <span className="toast-msg">{toast.message}</span>
        </div>
      )}

      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Candidate Pipeline <span className="gradient-text">(ATS)</span>
            </h1>
            <p className="cand-subtitle">
              Track, screen &amp; transition candidates dynamically across 10 structured recruitment stages.
            </p>
          </div>
          <button
            className="cv-action-btn primary glow-btn"
            onClick={() => setShowAddForm(true)}
          >
            <span>✨ Add New Lead</span>
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-box-3d" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="ats-search-input"
            placeholder="Search by candidate name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ats-count-badge" style={{ position: 'relative', zIndex: 2 }}>
          <span className="badge-dot"></span>
          <span>
            {candidates.length} Candidate{candidates.length === 1 ? "" : "s"}{" "}
            Tracked
          </span>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {error && <div className="cand-msg-banner" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca', marginBottom: "24px", position: 'relative', zIndex: 2 }}>❌ {error}</div>}

      {loading ? (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Fetching pipeline board from database...
        </div>
      ) : (
        <div className="ats-kanban-board-3d" style={{ position: 'relative', zIndex: 2 }}>
          {PIPELINE_STAGES.map((stage) => (
            <div className="ats-kanban-col" key={stage}>
              <div className="col-header-glass">
                <span className="col-title">{stage}</span>
                <span className="col-count-pill">
                  {columns[stage]?.length || 0}
                </span>
              </div>

              <div className="col-cards-scroll">
                {(columns[stage] || []).length === 0 && (
                  <div className="ats-empty-col">No Candidates</div>
                )}
                {(columns[stage] || []).map((c) => (
                  <div
                    className="ats-candidate-card-3d"
                    key={c.id}
                    onClick={() => {
                      setSelected(c);
                      refreshSelected(c.id);
                    }}
                  >
                    <div className="card-person-name">
                      {c.firstName} {c.lastName || ""}
                    </div>

                    <div className="card-job-info">
                      💼 {c.job?.title || "No Job Linked"}
                      {c.branch ? ` • ${c.branch.name}` : ""}
                    </div>

                    <div className="card-badge-row">
                      <span className="rating-stars">
                        {"★".repeat(c.rating || 0) || "☆☆☆☆☆"}
                      </span>
                      {c.aiScore > 0 && (
                        <span className="ai-score-pill">
                          AI {Math.round(c.aiScore)}
                        </span>
                      )}
                    </div>

                    <div className="stage-move-box">
                      <select
                        className="ats-stage-dropdown"
                        value={c.pipelineStage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStageChange(c, e.target.value)}
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="ats-select-option"
                          >
                            Move to: {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div
          className="modal-overlay-light"
          onClick={() => setShowAddForm(false)}
        >
          <div className="modal-card-light" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-3d" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>✨ Add New Candidate Lead</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowAddForm(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#64748b", fontWeight: "900" }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>First Name *</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    placeholder="John"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    placeholder="Doe"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Phone *</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+91 XXXXX XXXXX"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Source</label>
                  <select
                    className="cand-input"
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value })
                    }
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Link to Job</label>
                  <select
                    className="cand-input"
                    value={form.jobId}
                    onChange={(e) =>
                      setForm({ ...form, jobId: e.target.value })
                    }
                  >
                    <option value="">— Not Linked —</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group-3d" style={{ marginBottom: "20px" }}>
                <label>Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                  placeholder="e.g. 3.5"
                  className="cand-input"
                />
              </div>

              <button
                className="cv-action-btn primary glow-btn"
                disabled={saving}
                type="submit"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {saving ? "Creating..." : "Add to Pipeline ✨"}
              </button>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="ats-drawer-overlay" onClick={closeDrawer}>
          <div
            className="ats-glass-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>
                  {selected.firstName} {selected.lastName || ""}
                </h2>
                <p className="drawer-subtext">
                  📞 {selected.phone}{" "}
                  {selected.email ? `• ✉️ ${selected.email}` : ""}
                </p>
              </div>
              <button className="close-drawer-btn" onClick={closeDrawer}>
                ×
              </button>
            </div>

            <div className="drawer-scroll-body">
              {tracker && (
                <div className="drawer-card-section glass-highlight-card">
                  <h4>📍 Joining Tracker Progress</h4>
                  <div className="drawer-stepper-high-contrast">
                    <JoiningTrackerStepper tracker={tracker} />
                  </div>
                </div>
              )}

              <div className="drawer-card-section">
                <h4>📌 Pipeline Stage</h4>
                <select
                  className="ats-stage-dropdown drawer-select"
                  value={selected.pipelineStage}
                  onChange={(e) => handleStageChange(selected, e.target.value)}
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s} className="ats-select-option">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="drawer-card-section">
                <h4>⭐ Candidate Rating</h4>
                <Stars value={selected.rating || 0} onChange={handleRating} />
              </div>

              <div className="drawer-card-section">
                <h4>📄 Resume &amp; AI Analysis</h4>
                {selected.resume ? (
                  <button
                    type="button"
                    className="btn-preview-link"
                    onClick={async () => {
                      try {
                        await api.candidates.previewResume(selected.id);
                      } catch (e) {
                        showToast(e?.message || "Unable to preview resume", "error");
                      }
                    }}
                  >
                    Preview Current Resume ↗
                  </button>
                ) : (
                  <p className="no-item-text">No resume uploaded yet.</p>
                )}

                <div className="upload-input-row">
                  <label className="glass-file-upload-btn">
                    <span>
                      📁 {resumeFile ? resumeFile.name : "Choose File..."}
                    </span>
                    <input
                      type="file"
                      className="hidden-file-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                  </label>
                  <button
                    className="btn-drawer-upload"
                    disabled={!resumeFile || busyAction === "resume"}
                    onClick={handleResumeUpload}
                  >
                    {busyAction === "resume"
                      ? "Uploading..."
                      : "Upload & Parse"}
                  </button>
                </div>

                {selected.aiSummary && (
                  <div className="ai-summary-box">
                    <strong>
                      AI Overview (Score: {Math.round(selected.aiScore || 0)})
                    </strong>
                    <p>{selected.aiSummary}</p>
                  </div>
                )}
                {selected.skills?.length > 0 && (
                  <div className="skills-chip-row">
                    {selected.skills.map((sk, idx) => (
                      <span key={idx} className="skill-badge">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="drawer-card-section">
                <h4>📁 Documents Collection</h4>
                {(selected.documents || []).length === 0 && (
                  <p className="no-item-text">No documents submitted.</p>
                )}
                {(selected.documents || []).map((d, i) => {
                  const docStatus = d.status || "pending";
                  const badge =
                    docStatus === "verified"
                      ? { bg: "#059669", label: "Verified" }
                      : docStatus === "rejected"
                        ? { bg: "#dc2626", label: "Rejected" }
                        : { bg: "#d97706", label: "Pending Review" };
                  return (
                    <div className="doc-item-row" key={i}>
                      <button
                        type="button"
                        className="doc-name-link"
                        onClick={async () => {
                          try {
                            await api.candidates.previewDocument(selected.id, i);
                          } catch (e) {
                            showToast(e?.message || "Unable to open document", "error");
                          }
                        }}
                      >
                        📄 {d.name} ↗
                      </button>
                      <div className="doc-action-group">
                        <span
                          className="doc-status-badge"
                          style={{ background: badge.bg }}
                          title={d.remarks || ""}
                        >
                          {badge.label}
                        </span>
                        {docStatus !== "verified" && (
                          <button
                            className="btn-doc-verify"
                            disabled={verifyingIndex === i}
                            onClick={() => handleVerifyDoc(i, "verified")}
                          >
                            Verify
                          </button>
                        )}
                        {docStatus !== "rejected" && (
                          <button
                            className="btn-doc-reject"
                            disabled={verifyingIndex === i}
                            onClick={() => handleVerifyDoc(i, "rejected")}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="upload-input-row vertical">
                  <input
                    type="text"
                    placeholder="Document Label (e.g. Offer)"
                    value={docLabel}
                    onChange={(e) => setDocLabel(e.target.value)}
                    className="doc-label-input"
                  />
                  <div className="file-btn-flex">
                    <label className="glass-file-upload-btn flex-1">
                      <span>
                        📁 {docFile ? docFile.name : "Choose File..."}
                      </span>
                      <input
                        type="file"
                        className="hidden-file-input"
                        onChange={(e) => setDocFile(e.target.files[0])}
                      />
                    </label>
                    <button
                      className="btn-drawer-upload"
                      disabled={!docFile || busyAction === "document"}
                      onClick={handleDocUpload}
                    >
                      {busyAction === "document"
                        ? "Uploading..."
                        : "Upload Doc"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="drawer-card-section">
                <h4>📜 Offer Letter</h4>
                {selected.offerLetterUrl ? (
                  <button
                    type="button"
                    className="btn-preview-link"
                    onClick={async () => {
                      try {
                        await api.candidates.previewOfferLetter(selected.id);
                      } catch (e) {
                        showToast(e?.message || "Unable to open offer letter", "error");
                      }
                    }}
                  >
                    View Current Offer Letter ↗
                  </button>
                ) : (
                  <p className="no-item-text">No offer letter uploaded.</p>
                )}
                <div className="upload-input-row">
                  <label className="glass-file-upload-btn flex-1">
                    <span>
                      📁 {offerFile ? offerFile.name : "Choose File..."}
                    </span>
                    <input
                      type="file"
                      className="hidden-file-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setOfferFile(e.target.files[0])}
                    />
                  </label>
                  <button
                    className="btn-drawer-upload"
                    disabled={!offerFile || busyAction === "offer"}
                    onClick={handleOfferUpload}
                  >
                    {busyAction === "offer" ? "Uploading..." : "Upload Offer"}
                  </button>
                </div>

                <hr
                  style={{
                    margin: "16px 0",
                    border: "none",
                    borderTop: "1.5px solid #cbd5e1",
                  }}
                />
                <h4>🤖 Auto-Generate &amp; Email Offer Letter</h4>
                <p className="no-item-text" style={{ marginBottom: 10 }}>
                  Generates the branded platform PDF and emails it to the candidate automatically.
                </p>
                <div
                  className="upload-input-row"
                  style={{ flexDirection: "column", gap: 10 }}
                >
                  <input
                    type="text"
                    className="doc-label-input"
                    placeholder="Position (e.g. MERN Stack Developer)"
                    value={offerForm.position}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, position: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    className="doc-label-input"
                    value={offerForm.joiningDate}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        joiningDate: e.target.value,
                      })
                    }
                  />
                  <button
                    className="btn-drawer-upload"
                    disabled={busyAction === "offer-generate"}
                    onClick={handleGenerateOfferLetter}
                  >
                    {busyAction === "offer-generate"
                      ? "Generating & Sending..."
                      : "Generate + Send Offer Email"}
                  </button>
                </div>
              </div>

              <div className="drawer-card-section">
                <h4>🚫 Rejection Status</h4>
                {selected.isRejected ? (
                  <>
                    <p
                      className="no-item-text"
                      style={{ color: "#dc2626", marginBottom: 12, fontWeight: "800" }}
                    >
                      Rejected
                      {selected.rejectionReason
                        ? `: ${selected.rejectionReason}`
                        : ""}
                    </p>
                    <button
                      className="cv-action-btn primary glow-btn"
                      disabled={busyAction === "unreject"}
                      onClick={() => handleUnreject(selected)}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      {busyAction === "unreject"
                        ? "Restoring..."
                        : "Restore to Pipeline ✨"}
                    </button>
                  </>
                ) : (
                  <button
                    className="cv-action-btn"
                    style={{ background: "#dc2626", color: "#fff", width: "100%", justifyContent: "center", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "800", cursor: "pointer" }}
                    disabled={busyAction === "reject"}
                    onClick={() => handleReject(selected)}
                  >
                    {busyAction === "reject"
                      ? "Rejecting..."
                      : "Reject Candidate (Performance)"}
                  </button>
                )}
              </div>

              <div className="drawer-card-section">
                <h4>💬 Recruiter Notes</h4>
                <div className="notes-list-box">
                  {(selected.notes || []).length === 0 && (
                    <p className="no-item-text">No recruiter notes yet.</p>
                  )}
                  {(selected.notes || [])
                    .slice()
                    .reverse()
                    .map((n, i) => (
                      <div className="note-bubble" key={i}>
                        <p>{n.text}</p>
                        <span className="note-time">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="add-note-row">
                  <input
                    type="text"
                    placeholder="Type note about candidate..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="doc-label-input"
                  />
                  <button
                    className="btn-drawer-upload"
                    disabled={!noteText.trim() || busyAction === "note"}
                    onClick={handleAddNote}
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                className="btn-delete-candidate"
                onClick={() => handleDelete(selected)}
              >
                🗑️ Remove Candidate From System
              </button>
            </div>
          </div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & High Contrast Drawer CSS */}
      <style>{`
        .light-ats-container {
          position: relative;
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 3vw 80px;
          color: #0f172a;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

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

        .ats-marquee-banner {
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

        .ats-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .ats-marquee-track span {
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

        .glass-toast-alert {
          position: fixed;
          bottom: 28px;
          right: 28px;
          top: auto;
          left: auto;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 22px;
          border-radius: 16px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
          color: #0f172a;
          font-weight: 800;
          font-size: 14px;
          max-width: min(420px, calc(100vw - 56px));
          animation: toastSlideIn 0.28s ease;
        }

        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glass-toast-alert.success {
          border-color: #a7f3d0;
          background: #ecfdf5;
          color: #059669;
        }

        .glass-toast-alert.error {
          border-color: #fecaca;
          background: #fef2f2;
          color: #dc2626;
        }

        .ats-search-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14.5px;
          font-weight: 600;
        }

        .ats-count-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 800;
          color: #0284c7;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          box-shadow: 0 0 10px #059669;
        }

        .ats-kanban-board-3d {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding-bottom: 20px;
        }

        .ats-kanban-board-3d::-webkit-scrollbar {
          height: 8px;
        }
        .ats-kanban-board-3d::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .ats-kanban-col {
          min-width: 285px;
          width: 285px;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          flex-shrink: 0;
        }

        .col-header-glass {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1.5px solid #e2e8f0;
        }

        .col-title {
          font-size: 13.5px;
          font-weight: 900;
          color: #0f172a;
        }

        .col-count-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-weight: 900;
          font-size: 11.5px;
          padding: 2px 10px;
          border-radius: 20px;
          border: 1.5px solid #bae6fd;
        }

        .col-cards-scroll {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 68vh;
          overflow-y: auto;
          padding-right: 4px;
        }

        .ats-empty-col {
          text-align: center;
          padding: 30px 10px;
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
          background: #f8fafc;
          border-radius: 14px;
          border: 1.5px dashed #cbd5e1;
        }

        .ats-candidate-card-3d {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 18px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.02);
        }

        .ats-candidate-card-3d:hover {
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 10px 25px rgba(2, 132, 199, 0.12);
          transform: translateY(-2px);
        }

        .card-person-name {
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .card-job-info {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 10px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .rating-stars {
          color: #d97706;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .ai-score-pill {
          background: #f3e8ff;
          color: #9333ea;
          font-size: 11px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1.5px solid #e9d5ff;
        }

        .ats-stage-dropdown {
          width: 100%;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          outline: none;
          cursor: pointer;
        }

        .ats-stage-dropdown option, .ats-select-option {
          background-color: #ffffff !important;
          color: #0f172a !important;
          padding: 10px;
          font-weight: 700;
        }

        .modal-overlay-light {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-card-light {
          width: min(540px, 100%);
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .input-group-3d {
          margin-bottom: 16px;
        }

        .input-group-3d label {
          display: block;
          font-size: 12.5px;
          font-weight: 800;
          color: #334155;
          margin-bottom: 6px;
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

        .ats-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }

        .ats-glass-drawer {
          width: 100%;
          max-width: 520px;
          height: 100vh;
          background: #ffffff;
          border-left: 1.5px solid #cbd5e1;
          display: flex;
          flex-direction: column;
          box-shadow: -20px 0 60px rgba(15, 23, 42, 0.2);
          animation: slideInDrawer 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header-3d {
          padding: 24px;
          border-bottom: 1.5px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #f8fafc;
        }

        .drawer-header-3d h2 {
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .drawer-subtext {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          font-weight: 700;
        }

        .close-drawer-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 28px;
          cursor: pointer;
          font-weight: 900;
        }
        .close-drawer-btn:hover {
          color: #0f172a;
        }

        .drawer-scroll-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #ffffff;
        }

        .drawer-card-section {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          padding: 18px;
          border-radius: 18px;
        }

        .glass-highlight-card {
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 8px 25px rgba(2, 132, 199, 0.08);
        }

        /* High contrast styling for Joining Tracker Stepper inside drawer */
        .drawer-stepper-high-contrast,
        .drawer-stepper-high-contrast *,
        .drawer-stepper-high-contrast span,
        .drawer-stepper-high-contrast p,
        .drawer-stepper-high-contrast small {
          color: #0f172a !important;
          font-weight: 800 !important;
        }

        .drawer-card-section h4 {
          font-size: 14.5px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 14px;
        }

        .star-rating-row {
          display: flex;
          gap: 6px;
        }

        .ats-star-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #cbd5e1;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .ats-star-btn:hover {
          transform: scale(1.15);
        }

        .ats-star-btn.filled {
          color: #d97706;
        }

        .btn-preview-link {
          display: inline-block;
          color: #0284c7;
          font-weight: 800;
          font-size: 13px;
          text-decoration: none;
          margin-bottom: 12px;
        }
        .btn-preview-link:hover {
          text-decoration: underline;
        }

        .upload-input-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 10px;
        }

        .upload-input-row.vertical {
          flex-direction: column;
          align-items: stretch;
        }

        .file-btn-flex {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .glass-file-upload-btn {
          flex: 1;
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 9px 14px;
          border-radius: 12px;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hidden-file-input {
          display: none;
        }

        .doc-label-input {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 12px;
          color: #0f172a;
          font-size: 13px;
          font-weight: 600;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }

        .btn-drawer-upload {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
        }
        .btn-drawer-upload:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ai-summary-box {
          background: #f3e8ff;
          border: 1.5px solid #e9d5ff;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          color: #334155;
          font-weight: 600;
          margin-top: 12px;
        }

        .ai-summary-box strong {
          color: #9333ea;
          font-weight: 900;
          display: block;
          margin-bottom: 4px;
        }

        .skills-chip-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .skill-badge {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 8px;
          border: 1.5px solid #bae6fd;
        }

        .doc-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1.5px solid #e2e8f0;
        }

        .doc-name-link {
          color: #0f172a;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }
        .doc-name-link:hover {
          text-decoration: underline;
        }

        .doc-action-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .doc-status-badge {
          font-size: 11px;
          font-weight: 900;
          color: white;
          padding: 3px 8px;
          border-radius: 10px;
        }

        .btn-doc-verify, .btn-doc-reject {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-doc-verify:hover { background: #d1fae5; border-color: #a7f3d0; color: #059669; }
        .btn-doc-reject:hover { background: #fee2e2; border-color: #fecaca; color: #dc2626; }

        .notes-list-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 180px;
          overflow-y: auto;
          margin-bottom: 12px;
          padding-right: 4px;
        }

        .note-bubble {
          background: #ffffff;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
          border: 1.5px solid #cbd5e1;
        }

        .note-bubble p {
          margin: 0 0 4px;
          color: #0f172a;
          font-weight: 700;
        }

        .note-time {
          font-size: 10.5px;
          color: #64748b;
          font-weight: 700;
        }

        .add-note-row {
          display: flex;
          gap: 8px;
        }

        .btn-delete-candidate {
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          color: #dc2626;
          padding: 14px;
          border-radius: 14px;
          font-weight: 900;
          font-size: 14px;
          cursor: pointer;
          width: 100%;
        }
        .btn-delete-candidate:hover {
          background: #fee2e2;
        }

        .no-item-text {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          font-weight: 700;
        }

        .ats-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #0284c7;
          font-weight: 900;
        }

        .ats-loader {
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
      `}</style>
    </div>
  );
};

export default AdminATSPipeline;