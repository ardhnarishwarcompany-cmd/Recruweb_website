import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

const fmtBytes = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = Number(bytes);
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const statusBadgeClass = (status) =>
  status === "failed" ? "badge-pill-red" : "badge-pill-green";

const AdminBackup = () => {
  const [backups, setBackups] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyFile, setBusyFile] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [listRes, statusRes] = await Promise.all([
        api.backups.getAll(),
        api.backups.getStatus(),
      ]);
      if (listRes.success) setBackups(listRes.data);
      if (statusRes.success) setStatus(statusRes.data);
    } catch (err) {
      setError(err.message || "Failed to load backups");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await api.backups.create();
      if (!res.success) throw new Error(res.message);
      await load();
    } catch (err) {
      setError(err.message || "Backup failed");
    }
    setCreating(false);
  };

  const handleDownload = async (filename) => {
    setBusyFile(filename);
    try {
      await api.backups.download(filename);
    } catch (err) {
      setError(err.message || "Download failed");
    }
    setBusyFile(null);
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete backup "${filename}"? This cannot be undone.`))
      return;
    setBusyFile(filename);
    try {
      const res = await api.backups.delete(filename);
      if (!res.success) throw new Error(res.message);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
    setBusyFile(null);
  };

  const handleRestore = async (filename) => {
    if (
      !window.confirm(
        `Restore the database from "${filename}"?\n\nThis will OVERWRITE all current live data. This action cannot be undone.`,
      )
    )
      return;
    if (
      !window.confirm(
        "Are you absolutely sure? Type OK to confirm this is intentional.",
      )
    )
      return;

    setBusyFile(filename);
    try {
      const res = await api.backups.restore(filename);
      if (!res.success) throw new Error(res.message);
      alert("Database restored successfully.");
      await load();
    } catch (err) {
      setError(err.message || "Restore failed");
    }
    setBusyFile(null);
  };

  return (
    <div className="light-backup-container">
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
      <div className="backup-marquee-banner">
        <div className="backup-marquee-track">
          <span>✨ Recruweb Enterprise Database Backup System &amp; Security Hub</span>
          <span>•</span>
          <span>🛡️ On-Demand &amp; Scheduled MySQL Database Backups, Secure Restorations</span>
          <span>•</span>
          <span>⭐ Storage Metrics &amp; Archive Management</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Database Backup System{" "}
              <span className="gradient-text">— Security Hub</span>
            </h1>
            <p className="cand-subtitle">
              On-demand &amp; scheduled MySQL database backups, secure restorations, and storage metrics.
            </p>
          </div>
          <button
            className="cv-action-btn primary glow-btn"
            onClick={handleCreate}
            disabled={creating}
          >
            <span>
              {creating ? "Backing up Database..." : "🛡️ Create Backup Now ✨"}
            </span>
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {error && <div className="cand-msg-banner" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', marginBottom: "24px", position: 'relative', zIndex: 2 }}>⚠️ {error}</div>}

      {/* Status Stat Cards Grid */}
      {status && (
        <div className="client-stats-grid" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="stat-lbl">Total Backups</div>
            <div className="stat-val" style={{ color: "#0284c7" }}>{status.totalBackups}</div>
            <div
              className="card-glow-bar"
              style={{ background: "#0284c7" }}
            ></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="stat-lbl">Storage Used</div>
            <div className="stat-val" style={{ color: "#059669" }}>
              {fmtBytes(status.totalSizeBytes)}
            </div>
            <div
              className="card-glow-bar"
              style={{ background: "#059669" }}
            ></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="stat-lbl">Last Backup Time</div>
            <div
              className="stat-val"
              style={{ fontSize: "15px", color: "#9333ea", fontWeight: "900" }}
            >
              {fmt(status.lastBackupAt)}
            </div>
            <div
              className="card-glow-bar"
              style={{ background: "#9333ea" }}
            ></div>
          </div>
          <div className="cand-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <div className="stat-lbl">Automatic Schedule</div>
            <div
              className="stat-val"
              style={{
                fontSize: "15px",
                color: status.scheduleEnabled ? "#059669" : "#64748b",
                fontWeight: "900",
              }}
            >
              {status.scheduleEnabled
                ? `Enabled (${status.scheduleCron})`
                : "Disabled"}
            </div>
            <div
              className="card-glow-bar"
              style={{
                background: status.scheduleEnabled ? "#059669" : "#64748b",
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading backup archives...
            </div>
          ) : backups.length === 0 ? (
            <div className="cand-empty-state">
              No backups created yet. Click &quot;Create Backup Now&quot; to
              secure your database.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Archive Filename</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>File Size</th>
                    <th>Created Date</th>
                    <th>Triggered By</th>
                    <th>Actions &amp; Security</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((b) => (
                    <tr
                      key={b.filename + b.createdAt}
                      className="table-row-hover"
                    >
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>{b.filename}</strong>
                      </td>
                      <td>
                        <span className="type-pill">{b.type}</span>
                      </td>
                      <td>
                        <span
                          className={`audit-badge-pill ${statusBadgeClass(b.status)}`}
                          style={{
                            background: b.status === "failed" ? "#fef2f2" : "#ecfdf5",
                            color: b.status === "failed" ? "#dc2626" : "#059669",
                            borderColor: b.status === "failed" ? "#fecaca" : "#a7f3d0",
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{fmtBytes(b.sizeBytes)}</td>
                      <td className="date-text">{fmt(b.createdAt)}</td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{b.triggeredByName || "System (Scheduled)"}</td>
                      <td>
                        {b.status === "success" && (
                          <div className="action-row-flex" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              disabled={busyFile === b.filename}
                              onClick={() => handleDownload(b.filename)}
                            >
                              Download
                            </button>
                            <button
                              className="cv-action-btn primary"
                              style={{ background: "#d97706", padding: "6px 12px", fontSize: "12px" }}
                              disabled={busyFile === b.filename}
                              onClick={() => handleRestore(b.filename)}
                            >
                              Restore
                            </button>
                            <button
                              className="cv-action-btn"
                              style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                              disabled={busyFile === b.filename}
                              onClick={() => handleDelete(b.filename)}
                            >
                              Delete
                            </button>
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
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-backup-container {
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
        .backup-marquee-banner {
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

        .backup-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .backup-marquee-track span {
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

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .client-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .cand-stat-card-3d {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 20px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-stat-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .stat-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-val {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
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

        .type-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
          text-transform: uppercase;
        }

        .audit-badge-pill {
          font-size: 11.5px;
          font-weight: 900;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: capitalize;
        }

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
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

        .cand-msg-banner {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 800;
          border: 1.5px solid;
        }
      `}</style>
    </div>
  );
};

export default AdminBackup;