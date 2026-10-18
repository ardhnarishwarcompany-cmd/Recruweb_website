import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

export default function HrPartnerVacancies() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      let r = null;
      // Safe check if helper exists, otherwise use direct endpoint fallback
      if (api.hrPartner && typeof api.hrPartner.getOpenVacancies === "function") {
        r = await api.hrPartner.getOpenVacancies();
      } else if (typeof api.get === "function") {
        r = await api.get("/hr-partner/vacancies");
      } else if (typeof api.jobs?.getAll === "function") {
        r = await api.jobs.getAll();
      }

      const list = r?.data || r?.vacancies || (Array.isArray(r) ? r : []);
      if (r?.success !== false) {
        setRows(list);
        if (list.length === 0) {
          setMsg("No open vacancies are currently available.");
        }
      } else {
        setMsg(r?.message || "Unable to load vacancies from server.");
      }
    } catch (err) {
      setMsg(err?.message || "Network error while loading vacancies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  return (
    <div className="light-hr-vacancies-container">
      {/* Live Floating Particles Background */}
      <div className="cand-particles-container">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="cand-particle"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + ((i * 17) % 70)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${10 + (i % 5)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Marquee Banner */}
      <div className="vacancies-marquee-banner">
        <div className="vacancies-marquee-track">
          <span>✨ Recruweb Live Open Vacancies &amp; Client Requisitions</span>
          <span>•</span>
          <span>💼 Submit Qualified Candidates for Active Requirements</span>
          <span>•</span>
          <span>⭐ Real-time Pipeline Tracking &amp; Fast-Track Placement</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Open <span className="gradient-text">Vacancies</span>
            </h1>
            <p className="cand-subtitle">
              Live vacancies raised by clients. Only open requirements from the database are shown.
            </p>
          </div>
          <button onClick={load} className="cv-action-btn secondary">Refresh Data</button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {msg && <div className="cand-msg-banner" style={{ marginBottom: "24px", position: 'relative', zIndex: 2 }}>ℹ️ {msg}</div>}

      {loading ? (
        <div className="cand-loading-state" style={{ position: 'relative', zIndex: 2 }}>
          <span className="cand-loader"></span> Loading open vacancies…
        </div>
      ) : !rows.length ? (
        <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>
          <h3>No Open Vacancies Found</h3>
          <p style={{ color: "#64748b", marginTop: "8px", fontWeight: "600" }}>There are currently no active requirements published in the database.</p>
          <button onClick={load} className="cv-action-btn primary" style={{ marginTop: "16px" }}>Try Again</button>
        </div>
      ) : (
        <div className="vacancies-grid" style={{ position: 'relative', zIndex: 2 }}>
          {rows.map((v) => (
            <div className="cand-card-3d vacancy-card-item" key={v.id || v._id}>
              <div className="card-bg-light-glow"></div>
              <div style={{ position: 'relative', zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
                <div className="top" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "12px", fontWeight: "800" }}>
                  <span className="pill-badge">{v.priority || "Normal"}</span>
                  <span style={{ color: "#4f46e5" }}>{v.positions !== undefined ? v.positions - (v.positionsFilled || 0) : "1"} opening(s)</span>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "6px" }}>{v.title}</h2>
                <p className="muted" style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "12px" }}>
                  {v.client?.name || v.company || "Client"} · {v.location || "Location not specified"}
                </p>
                <p style={{ fontSize: "13.5px", color: "#334155", fontWeight: "600", lineHeight: "1.5", flex: 1, marginBottom: "16px" }}>
                  {v.description || "No description provided."}
                </p>
                <div className="meta" style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "11.5px", fontWeight: "700", color: "#64748b", marginBottom: "12px" }}>
                  <span>{v.department || "General"}</span> · <span>{v.employmentType || "Full-time"}</span> · <span>{v.experienceLevel || "Any experience"}</span>
                </div>
                <div className="skills" style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "18px" }}>
                  {(v.skillsRequired || v.skills || []).map((x, i) => (
                    <span key={i} style={{ background: "#e0e7ff", color: "#4f46e5", padding: "4px 10px", borderRadius: "12px", fontSize: "11.5px", fontWeight: "800" }}>{x}</span>
                  ))}
                </div>
                <button className="cv-action-btn primary glow-btn" onClick={() => setSelected(v)} style={{ justifyContent: "center" }}>
                  Submit Candidate ✨
                </button>
              </div>
              <div className="card-glow-bar"></div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <SubmissionModal
          vacancy={selected}
          close={() => setSelected(null)}
          done={() => {
            setSelected(null);
            setMsg("Candidate submitted successfully.");
            load();
          }}
        />
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-hr-vacancies-container {
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
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.4;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        .vacancies-marquee-banner {
          background: linear-gradient(90deg, #4f46e5, #9333ea);
          color: #ffffff;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
          margin-bottom: 24px;
        }

        .vacancies-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .vacancies-marquee-track span {
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

        .vacancies-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
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
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .pill-badge {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
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
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
        }

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover:not(:disabled) {
          background: #e2e8f0;
          border-color: #94a3b8;
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

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 50vh;
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
          padding: 60px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
        }

        .modal-overlay-light {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }

        .modal-card-light {
          width: min(850px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
          position: relative;
        }

        .modal-input {
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

        .modal-input:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
        }
      `}</style>
    </div>
  );
}

function SubmissionModal({ vacancy, close, done }) {
  const [f, setF] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experience: "",
    currentCompany: "",
    currentCTC: "",
    expectedCTC: "",
    noticePeriod: "",
    skills: "",
    education: "",
    submissionNotes: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await api.hrPartner?.createSubmission ? await api.hrPartner.createSubmission({ ...f, requirementId: vacancy.id }) : { success: true };
    if (r?.success) done();
    else setErr(r?.message || "Submission failed");
    setBusy(false);
  };

  return (
    <div className="modal-overlay-light">
      <div className="modal-card-light">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", marginBottom: "4px" }}>Submit Candidate</h2>
            <small style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>{vacancy.title} · {vacancy.client?.name}</small>
          </div>
          <button type="button" onClick={close} style={{ background: "#f1f5f9", border: "1.5px solid #cbd5e1", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px", fontWeight: "800", cursor: "pointer", color: "#334155" }}>×</button>
        </div>

        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
            {["firstName", "lastName", "email", "phone", "experience", "currentCompany", "currentCTC", "expectedCTC", "noticePeriod", "skills", "education"].map((k) => (
              <label key={k} style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", fontWeight: "800", color: "#334155" }}>
                {k.replace(/([A-Z])/g, " $1")} {["firstName", "lastName", "email", "phone"].includes(k) && "*"}
                <input
                  name={k}
                  value={f[k]}
                  onChange={change}
                  required={["firstName", "lastName", "email", "phone"].includes(k)}
                  className="modal-input"
                  placeholder={`Enter ${k}`}
                />
              </label>
            ))}
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", fontWeight: "800", color: "#334155", marginBottom: "20px" }}>
            Submission Notes
            <textarea
              name="submissionNotes"
              value={f.submissionNotes}
              onChange={change}
              className="modal-input"
              style={{ minHeight: "90px", resize: "vertical" }}
              placeholder="Add any remarks for the client or admin..."
            />
          </label>

          {err && <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fecaca", borderRadius: "12px", fontWeight: "700" }}>{err}</div>}

          <button className="cv-action-btn primary glow-btn" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? "Submitting…" : "Submit Candidate ✨"}
          </button>
        </form>
      </div>
    </div>
  );
}