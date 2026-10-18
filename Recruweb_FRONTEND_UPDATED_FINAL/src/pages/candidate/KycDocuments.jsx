import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const DOCUMENT_TYPES = [
  { value: "government_id", label: "Government ID" },
  { value: "pan_card", label: "PAN Card" },
  { value: "address_proof", label: "Address Proof" },
  { value: "educational_certificate", label: "Educational Certificate" },
  { value: "experience_letter", label: "Experience Letter" },
  { value: "offer_letter", label: "Offer Letter" },
  { value: "company_registration", label: "Company Registration" },
  { value: "other", label: "Other" },
];

const statusColor = { pending: "#d97706", approved: "#059669", rejected: "#dc2626" };

export default function KycDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0].value);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.kyc.getMine();
    if (res?.success) setDocs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }
    setUploading(true);
    setMessage("");
    const res = await api.kyc.uploadDocument(file, documentType);
    if (res?.success) {
      setMessage("Document uploaded — pending review.");
      setFile(null);
      await load();
    } else {
      setMessage(res?.message || "Upload failed.");
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    const res = await api.kyc.delete(id);
    if (res?.success) load();
  };

  return (
    <div className="light-kyc-container">
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
      <div className="kyc-marquee-banner">
        <div className="kyc-marquee-track">
          <span>✨ Secure KYC Document Verification Suite</span>
          <span>•</span>
          <span>📂 Upload Identity &amp; Educational Credentials</span>
          <span>•</span>
          <span>⭐ Real-time Verification Status &amp; Compliance Tracking</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            KYC <span className="gradient-text">Documents</span>
          </h1>
          <p className="cand-subtitle">
            Upload and manage your verification files securely. Our verification team reviews submissions promptly.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Upload Card */}
      <div className="cand-card-3d" style={{ marginBottom: "28px" }}>
        <div className="card-bg-light-glow"></div>
        <form onSubmit={handleUpload} style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label style={{ display: "block", fontWeight: "800", fontSize: "12.5px", color: "#334155", marginBottom: "6px" }}>Select Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="cand-input"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1.5, minWidth: "260px" }}>
              <label style={{ display: "block", fontWeight: "800", fontSize: "12.5px", color: "#334155", marginBottom: "6px" }}>Choose File (PDF, Images)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}
              />
            </div>

            <div style={{ alignSelf: "flex-end" }}>
              <button type="submit" disabled={uploading} className="cv-action-btn primary glow-btn" style={{ padding: '12px 24px' }}>
                {uploading ? "Uploading…" : "Upload Document ✨"}
              </button>
            </div>
          </div>

          {file && (
            <div className="selected-file-badge" style={{ marginTop: "14px" }}>
              ✅ Selected file: {file.name}
            </div>
          )}

          {message && <div className="cand-msg-banner" style={{ marginTop: "16px" }}>ℹ️ {message}</div>}
        </form>
        <div className="card-glow-bar"></div>
      </div>

      {/* Documents Table Card */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <h2 className="panel-heading" style={{ position: 'relative', zIndex: 2 }}>📂 My Uploaded Documents</h2>
        {loading ? (
          <div className="cand-loading-state" style={{ position: 'relative', zIndex: 2 }}>
            <span className="cand-loader"></span> Loading documents...
          </div>
        ) : !docs.length ? (
          <div className="cand-empty-state" style={{ position: 'relative', zIndex: 2 }}>No documents uploaded yet.</div>
        ) : (
          <div className="cand-table-wrap" style={{ position: 'relative', zIndex: 2 }}>
            <table className="cand-light-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Rejection Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="table-row-hover">
                    <td><strong>{DOCUMENT_TYPES.find((t) => t.value === d.documentType)?.label || d.documentType}</strong></td>
                    <td>
                      <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#4f46e5", fontWeight: "800", textDecoration: "underline" }}>
                        {d.fileName || "View Document"}
                      </a>
                    </td>
                    <td>
                      <span className="status-pill-badge" style={{ background: d.status === 'approved' ? '#ecfdf5' : d.status === 'rejected' ? '#fef2f2' : '#fef3c7', color: statusColor[d.status], borderColor: d.status === 'approved' ? '#a7f3d0' : d.status === 'rejected' ? '#fecaca' : '#fde68a' }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ color: "#64748b", fontWeight: "600" }}>{d.rejectionReason || "—"}</td>
                    <td>
                      {d.status === "pending" && (
                        <button onClick={() => handleDelete(d.id)} style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#ef4444", borderRadius: "10px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "800" }}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-kyc-container {
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
        .kyc-marquee-banner {
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

        .kyc-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .kyc-marquee-track span {
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

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .panel-heading {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 18px;
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

        .status-pill-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: capitalize;
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
          padding: 40px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}