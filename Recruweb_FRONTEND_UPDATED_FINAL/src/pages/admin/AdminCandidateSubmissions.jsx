import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const STATUS_OPTIONS = [
  "pending-admin-approval",
  "admin-approved",
  "admin-rejected",
  "submitted",
  "client-approved",
  "client-rejected",
  "interview-scheduled",
  "interview-completed",
  "offer-extended",
  "offer-approved",
  "offer-rejected",
  "withdrawn",
];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const statusMeta = (status) => {
  switch (status) {
    case "admin-approved":
    case "client-approved":
    case "offer-approved":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
        dot: "#059669",
      };
    case "offer-extended":
    case "interview-scheduled":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
        dot: "#0284c7",
      };
    case "interview-completed":
      return {
        bg: "#f3e8ff",
        text: "#9333ea",
        border: "#e9d5ff",
        dot: "#9333ea",
      };
    case "client-rejected":
    case "offer-rejected":
    case "withdrawn":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
        dot: "#dc2626",
      };
    default:
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
        dot: "#d97706",
      };
  }
};

export default function AdminCandidateSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Form & Edit States
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    candidateId: "",
    requirementId: "",
    submissionNotes: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [offerDraft, setOfferDraft] = useState({});
  const [message, setMessage] = useState("");

  // Modal View State
  const [viewingSub, setViewingSub] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const subRes = await api.crmSubmissions?.getAll().catch(() => null);
      const candRes = await api.candidates
        ?.getAll({ limit: 500 })
        .catch(() => null);

      let reqRes = null;
      if (api.crmRequirements?.getAll) {
        reqRes = await api.crmRequirements.getAll().catch(() => null);
      } else if (api.requirements?.getAll) {
        reqRes = await api.requirements.getAll().catch(() => null);
      }

      if (subRes?.success) setSubmissions(subRes.data || []);

      if (candRes?.success) {
        setCandidates(candRes.data || candRes.candidates || []);
      }

      if (reqRes) {
        const reqData =
          reqRes.data ||
          reqRes.requirements ||
          (Array.isArray(reqRes) ? reqRes : []);
        setRequirements(reqData);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setMessage("Error loading data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ candidateId: "", requirementId: "", submissionNotes: "" });
    setShowForm(true);
    setMessage("");
  };

  const openEdit = (sub) => {
    setEditingId(sub.id);
    setForm({
      candidateId: sub.candidateId || "",
      requirementId: sub.requirementId || "",
      submissionNotes: sub.submissionNotes || "",
    });
    setShowForm(true);
    setMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ candidateId: "", requirementId: "", submissionNotes: "" });
  };

  const handleSubmitSubmission = async (e) => {
    e.preventDefault();

    if (!form.candidateId || !form.requirementId) {
      setMessage("❌ Please select both a candidate and a requirement.");
      return;
    }

    setMessage("");
    let res;
    if (editingId) {
      res = await api.crmSubmissions.update(editingId, form);
    } else {
      res = await api.crmSubmissions.create(form);
    }

    if (res?.success) {
      setMessage(
        editingId
          ? "✅ Submission updated successfully."
          : "🚀 Candidate auto-submitted successfully.",
      );
      closeForm();
      load();
    } else {
      setMessage(res?.message || "❌ Failed to process submission.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?"))
      return;
    const res = await api.crmSubmissions.delete(id);
    if (res?.success) {
      load();
    } else {
      alert("Failed to delete submission.");
    }
  };

  const setStatus = async (id, status) => {
    const res = await api.crmSubmissions.update(id, { status });
    if (res?.success) load();
  };

  const reviewSubmission = async (id, action) => {
    const note = window.prompt(
      action === "approve"
        ? "Optional approval note:"
        : "Reason for rejecting this submission:",
      "",
    );
    if (action === "reject" && note === null) return;
    const res = await api.crmSubmissions.review(id, action, note || "");
    if (res?.success) {
      setMessage(res.message || "Submission review saved.");
      load();
    } else {
      setMessage(res?.message || "Failed to review submission.");
    }
  };

  const extendOffer = async (id) => {
    const draft = offerDraft[id] || {};
    if (!draft.offerAmount) {
      alert("Please enter an offer amount.");
      return;
    }
    const res = await api.crmSubmissions.update(id, {
      status: "offer-extended",
      offerAmount: draft.offerAmount,
      offerCurrency: draft.offerCurrency || "INR",
      offerJoiningDate: draft.offerJoiningDate || null,
      offerNotes: draft.offerNotes || "",
    });
    if (res?.success) load();
  };

  const exportToCSV = () => {
    if (!submissions.length) return alert("No submissions to export!");
    const headers = ["Candidate", "Requirement", "Client", "Status", "Date"];
    const rows = submissions.map((s) => [
      `"${s.candidate?.firstName || ""} ${s.candidate?.lastName || ""}"`,
      `"${s.requirement?.title || ""}"`,
      `"${s.client?.name || ""}"`,
      `"${s.status}"`,
      `"${fmtDate(s.updatedAt)}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "candidate_submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubmissions = submissions.filter((s) => {
    const candName =
      `${s.candidate?.firstName || ""} ${s.candidate?.lastName || ""}`.toLowerCase();
    const reqTitle = (s.requirement?.title || "").toLowerCase();
    const clientName = (s.client?.name || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      candName.includes(query) ||
      reqTitle.includes(query) ||
      clientName.includes(query);

    const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="light-sub-container">
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
      <div className="sub-marquee-banner">
        <div className="sub-marquee-track">
          <span>✨ Recruweb Enterprise Candidate Submissions &amp; Client Portal</span>
          <span>•</span>
          <span>🚀 Manage Auto-generated Submissions Against Client Requirements</span>
          <span>•</span>
          <span>⭐ Offer Extensions, Status Updates &amp; CSV Exports</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Candidate Submissions{" "}
              <span className="gradient-text">— Client Portal</span>
            </h1>
            <p className="cand-subtitle">
              Manage auto-generated submissions against client requirements ({filteredSubmissions.length} of {submissions.length} Active)
            </p>
          </div>

          <div className="header-actions">
            <button className="cv-action-btn secondary" title="Refresh Data" onClick={load}>
              🔄 Refresh
            </button>
            <button
              className="cv-action-btn secondary"
              title="Export CSV"
              onClick={exportToCSV}
            >
              📥 Export CSV
            </button>
            <button
              className="cv-action-btn primary glow-btn"
              onClick={() => (showForm ? closeForm() : openCreate())}
            >
              <span>{showForm ? "✕ Close Form" : "+ Submit Candidate ✨"}</span>
            </button>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {message && <div className="cand-msg-banner" style={{ marginBottom: "24px", position: 'relative', zIndex: 2 }}>ℹ️ {message}</div>}

      {showForm && (
        <div className="cand-card-3d" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="form-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className="form-heading" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                {editingId
                  ? "✏️ Edit Candidate Submission"
                  : "✨ Auto-Generate Submission to Client"}
              </h3>
              <button className="close-drawer-btn" onClick={closeForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSubmission} className="sub-form-body">
              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Select Candidate *</label>
                  <select
                    required
                    className="cand-input"
                    value={form.candidateId}
                    onChange={(e) =>
                      setForm({ ...form, candidateId: e.target.value })
                    }
                  >
                    <option value="">— Choose Candidate —</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.candidateCode || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group-3d">
                  <label>Select Requirement *</label>
                  <select
                    required
                    className="cand-input"
                    value={form.requirementId}
                    onChange={(e) =>
                      setForm({ ...form, requirementId: e.target.value })
                    }
                  >
                    <option value="">
                      {requirements.length === 0
                        ? "— No Requirements Found —"
                        : "— Choose Requirement —"}
                    </option>
                    {requirements.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}{" "}
                        {r.client?.name
                          ? `— ${r.client.name}`
                          : r.clientId
                            ? `(Client #${r.clientId})`
                            : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group-3d" style={{ marginTop: "14px" }}>
                <label>Notes for the Client (Optional)</label>
                <textarea
                  rows={3}
                  className="cand-input"
                  style={{ resize: "vertical" }}
                  placeholder="Candidate strengths, experience highlights, notice period..."
                  value={form.submissionNotes}
                  onChange={(e) =>
                    setForm({ ...form, submissionNotes: e.target.value })
                  }
                />
              </div>

              <div className="form-action-btns" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  className="cv-action-btn secondary"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="cv-action-btn primary glow-btn">
                  {editingId
                    ? "Update Submission ✨"
                    : "Submit & Generate Automatically ✨"}
                </button>
              </div>
            </form>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Toolbar */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-box" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", minWidth: "260px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by candidate, title, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-box" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "0 16px", borderRadius: "12px" }}>
          <label className="filter-label" style={{ fontSize: "12.5px", fontWeight: "800", color: "#334155" }}>Filter Status:</label>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses ({submissions.length})</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st.replace("-", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Panel Table */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading candidate submissions...
            </div>
          ) : !filteredSubmissions.length ? (
            <div className="cand-empty-state">
              {searchTerm || filterStatus !== "ALL"
                ? "No candidate submissions match your filters."
                : "No candidate submissions recorded yet."}
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Requirement</th>
                    <th>Client Account</th>
                    <th>Submission Status</th>
                    <th>Client Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((s) => {
                    const meta = statusMeta(s.status);
                    return (
                      <tr key={s.id} className="table-row-hover">
                        <td>
                          <div className="candidate-info-cell">
                            <div className="avatar-circle">
                              {(s.candidate?.firstName?.[0] || "C").toUpperCase()}
                            </div>
                            <div>
                              <strong className="cand-name" style={{ color: "#0f172a", fontWeight: "900" }}>
                                {s.candidate?.firstName} {s.candidate?.lastName}
                              </strong>
                              <span className="cand-code">
                                {s.candidate?.candidateCode
                                  ? `#${s.candidate.candidateCode}`
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="req-title-text" style={{ color: "#0f172a", fontWeight: "900" }}>
                            {s.requirement?.title || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="client-badge" style={{ background: "#f1f5f9", border: "1.5px solid #cbd5e1", color: "#334155", fontWeight: "700" }}>
                            🏢 {s.client?.name || "—"}
                          </span>
                        </td>
                        <td>
                          <div className="status-select-wrap">
                            <span
                              className="status-dot"
                              style={{ background: meta.dot }}
                            ></span>
                            <select
                              className="sub-table-select"
                              style={{
                                background: meta.bg,
                                color: meta.text,
                                borderColor: meta.border,
                              }}
                              value={s.status}
                              onChange={(e) => setStatus(s.id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <option
                                  key={st}
                                  value={st}
                                >
                                  {st
                                    .split("-")
                                    .map(
                                      (w) =>
                                        w.charAt(0).toUpperCase() + w.slice(1),
                                    )
                                    .join(" ")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td>
                          <span className="remarks-text" style={{ color: "#64748b", fontWeight: "600" }}>
                            {s.clientRemarks || "—"}
                          </span>
                        </td>
                        <td>
                          <div className="action-row-flex" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            {s.status === "pending-admin-approval" && (
                              <>
                                <button
                                  className="btn-approve"
                                  title="Approve and forward to client"
                                  onClick={() => reviewSubmission(s.id, "approve")}
                                >
                                  ✓ Approve &amp; Send
                                </button>
                                <button
                                  className="btn-reject"
                                  title="Reject before client review"
                                  onClick={() => reviewSubmission(s.id, "reject")}
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}
                            {s.status === "client-approved" ||
                            s.status === "interview-completed" ? (
                              <div className="offer-draft-row" style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <input
                                  type="number"
                                  placeholder="Amt (₹)"
                                  className="sub-input-sm"
                                  onChange={(e) =>
                                    setOfferDraft({
                                      ...offerDraft,
                                      [s.id]: {
                                        ...offerDraft[s.id],
                                        offerAmount: e.target.value,
                                      },
                                    })
                                  }
                                />
                                <input
                                  type="date"
                                  className="sub-input-sm"
                                  onChange={(e) =>
                                    setOfferDraft({
                                      ...offerDraft,
                                      [s.id]: {
                                        ...offerDraft[s.id],
                                        offerJoiningDate: e.target.value,
                                      },
                                    })
                                  }
                                />
                                <button
                                  className="btn-extend-offer"
                                  title="Send Offer Letter"
                                  onClick={() => extendOffer(s.id)}
                                >
                                  Offer
                                </button>
                              </div>
                            ) : (
                              <span className="updated-text">
                                {fmtDate(s.updatedAt)}
                              </span>
                            )}

                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 10px", fontSize: "12px" }}
                              title="View Details"
                              onClick={() => setViewingSub(s)}
                            >
                              👁️
                            </button>
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 10px", fontSize: "12px" }}
                              title="Edit Submission"
                              onClick={() => openEdit(s)}
                            >
                              ✏️
                            </button>
                            <button
                              className="cv-action-btn"
                              style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 10px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                              title="Delete Submission"
                              onClick={() => handleDelete(s.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {viewingSub && (
        <div className="modal-overlay-light" onClick={() => setViewingSub(null)}>
          <div
            className="modal-card-light animate-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "520px", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>📄 Submission Details</h2>
                <p className="drawer-subtext">Detailed review of client submission</p>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setViewingSub(null)}
              >
                ×
              </button>
            </div>
            <div className="drawer-scroll-body" style={{ color: "#334155", fontWeight: "700" }}>
              <p>
                <strong style={{ color: "#0f172a" }}>Candidate:</strong> {viewingSub.candidate?.firstName}{" "}
                {viewingSub.candidate?.lastName}
              </p>
              <p>
                <strong style={{ color: "#0f172a" }}>Requirement:</strong>{" "}
                {viewingSub.requirement?.title || "N/A"}
              </p>
              <p>
                <strong style={{ color: "#0f172a" }}>Client:</strong> {viewingSub.client?.name || "N/A"}
              </p>
              <p>
                <strong style={{ color: "#0f172a" }}>Status:</strong>{" "}
                <span className="status-highlight">{viewingSub.status}</span>
              </p>
              <p>
                <strong style={{ color: "#0f172a" }}>Submission Notes:</strong>
              </p>
              <div className="notes-box" style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", color: "#334155", padding: "12px", borderRadius: "12px" }}>
                {viewingSub.submissionNotes || "No extra notes provided."}
              </div>
              <p>
                <strong style={{ color: "#0f172a" }}>Client Remarks:</strong>
              </p>
              <div className="notes-box" style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", color: "#334155", padding: "12px", borderRadius: "12px" }}>
                {viewingSub.clientRemarks || "No remarks from client."}
              </div>
            </div>
            <div className="drawer-header-3d" style={{ background: "#f8fafc", justifyContent: "flex-end" }}>
              <button
                className="cv-action-btn secondary"
                onClick={() => setViewingSub(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-sub-container {
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
        .sub-marquee-banner {
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

        .sub-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .sub-marquee-track span {
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

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
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

        .avatar-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 12px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .cand-code {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
        }

        .sub-table-select {
          border: 1.5px solid;
          padding: 5px 10px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          outline: none;
          cursor: pointer;
        }

        .sub-input-sm {
          width: 80px;
          padding: 6px 8px;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          color: #0f172a;
          font-size: 11.5px;
          font-weight: 700;
        }

        .btn-extend-offer {
          background: #059669;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 11.5px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }

        .updated-text {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 700;
          margin-right: 4px;
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

        /* Modal styling */
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
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
          width: 100%;
        }

        .animate-modal {
          animation: modalAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
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
          gap: 16px;
          background: #ffffff;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
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
        }

        .cand-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
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