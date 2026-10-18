import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const STATUSES = ["new", "contacted", "in-progress", "completed", "cancelled"];

const statusMeta = (status) => {
  switch (status) {
    case "completed":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
        label: "Completed",
      };
    case "in-progress":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
        label: "In Progress",
      };
    case "contacted":
      return {
        bg: "#f3e8ff",
        text: "#9333ea",
        border: "#e9d5ff",
        label: "Contacted",
      };
    case "cancelled":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
        label: "Cancelled",
      };
    default:
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
        label: "New",
      };
  }
};

const AdminInquiries = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchInquiries = () => {
    setLoading(true);
    api.getStarted.getAll().then((res) => {
      if (res?.success) setRecords(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, status) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await api.getStarted.updateStatus(id, status);
  };

  const handleExportCSV = () => {
    if (!records.length) return;
    const headers = [
      "Company Name,Contact Person,Email,Phone,Employees,Services,Status,Date",
    ];
    const rows = records.map((r) =>
      [
        `"${r.companyName || ""}"`,
        `"${r.contactPerson || ""}"`,
        r.email || "",
        r.phone || "",
        r.employees || "",
        `"${Array.isArray(r.services) ? r.services.join(", ") : r.services || ""}"`,
        r.status || "",
        r.createdAt || "",
      ].join(","),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "client_inquiries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      (r.companyName && r.companyName.toLowerCase().includes(searchLower)) ||
      (r.contactPerson &&
        r.contactPerson.toLowerCase().includes(searchLower)) ||
      (r.email && r.email.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="light-inquiries-container">
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
      <div className="inquiry-marquee-banner">
        <div className="inquiry-marquee-track">
          <span>✨ Recruweb Enterprise Client Inquiries &amp; Get Started Leads</span>
          <span>•</span>
          <span>🏢 Companies Requesting Staffing &amp; HR Services</span>
          <span>•</span>
          <span>⭐ Real-time Lead Status Tracking &amp; CSV Exports</span>
        </div>
      </div>

      {/* Header Bar with Action Buttons */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Client Inquiries{" "}
              <span className="gradient-text">— Get Started Leads</span>
            </h1>
            <p className="cand-subtitle">
              Companies requesting staffing &amp; HR services via the Get Started form ({records.length} Total Submissions)
            </p>
          </div>
          <div className="header-actions">
            <button
              className="cv-action-btn secondary"
              onClick={fetchInquiries}
              title="Refresh Inquiries"
            >
              🔄 Refresh
            </button>
            <button
              className="cv-action-btn primary glow-btn"
              onClick={handleExportCSV}
              title="Export CSV"
            >
              📥 Export CSV ✨
            </button>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="inquiry-search-input"
            placeholder="Search by company name, contact person, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-select-wrap" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "0 16px", borderRadius: "12px" }}>
          <span className="filter-icon">📌</span>
          <select
            className="inquiry-select-dark"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </option>
            ))}
          </select>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Fetching client inquiries...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="cand-empty-state">
              <div className="empty-icon">🏢</div>
              <h3>No client inquiries found</h3>
              <p>Try adjusting your search criteria or status filter.</p>
              {(search || statusFilter !== "all") && (
                <button
                  className="cv-action-btn secondary"
                  style={{ marginTop: "12px" }}
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Contact Info</th>
                    <th>Employees</th>
                    <th>Services Needed</th>
                    <th>Received Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => {
                    const meta = statusMeta(r.status);
                    return (
                      <tr key={r.id} className="table-row-hover">
                        <td>
                          <div className="company-name-text">
                            🏢 {r.companyName}
                          </div>
                        </td>
                        <td>
                          <div className="contact-person-text">
                            {r.contactPerson}
                          </div>
                        </td>
                        <td className="contact-cell">
                          <div>✉️ {r.email}</div>
                          <div>📞 {r.phone}</div>
                        </td>
                        <td>
                          <span className="employee-pill">
                            {r.employees || "—"}
                          </span>
                        </td>
                        <td>
                          <div className="services-list">
                            {Array.isArray(r.services)
                              ? r.services.join(", ")
                              : r.services || "—"}
                          </div>
                        </td>
                        <td className="date-text">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <select
                            className="inquiry-table-select"
                            style={{
                              background: meta.bg,
                              color: meta.text,
                              borderColor: meta.border,
                            }}
                            value={r.status}
                            onChange={(e) =>
                              handleStatusChange(r.id, e.target.value)
                            }
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s
                                  .split("-")
                                  .map(
                                    (w) => w.charAt(0).toUpperCase() + w.slice(1),
                                  )
                                  .join(" ")}
                              </option>
                            ))}
                          </select>
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

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-inquiries-container {
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
        .inquiry-marquee-banner {
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

        .inquiry-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .inquiry-marquee-track span {
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

        .inquiry-search-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
        }

        .clear-search-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 14px;
          font-weight: 900;
        }

        .clear-search-btn:hover {
          color: #0f172a;
        }

        .inquiry-select-dark {
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          padding: 10px 0;
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

        .company-name-text {
          font-weight: 900;
          color: #0f172a;
        }

        .contact-person-text {
          font-weight: 800;
          color: #334155;
        }

        .contact-cell {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
          line-height: 1.5;
        }

        .employee-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 12px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
          display: inline-block;
        }

        .services-list {
          font-size: 13px;
          color: #334155;
          font-weight: 700;
          max-width: 250px;
        }

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
        }

        .inquiry-table-select {
          border: 1.5px solid;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 800;
          outline: none;
          cursor: pointer;
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
          padding: 50px 20px;
          color: #64748b;
          font-weight: 700;
        }

        .empty-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }

        .cand-empty-state h3 {
          font-size: 16px;
          color: #0f172a;
          margin: 0 0 6px;
          font-weight: 900;
        }

        .cand-empty-state p {
          font-size: 13px;
          margin: 0 0 16px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AdminInquiries;