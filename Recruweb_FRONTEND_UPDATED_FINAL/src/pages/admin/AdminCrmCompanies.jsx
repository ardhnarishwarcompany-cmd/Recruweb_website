import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const emptyForm = {
  name: "",
  industry: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  size: "",
  gstNumber: "",
  notes: "",
};

const AdminCrmCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.crmCompanies.getAll(params);
      if (res?.success) setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleExportCSV = () => {
    if (!companies.length) return;
    const headers = ["Name,Industry,Website,Email,Phone,City,Size,GST Number"];
    const rows = companies.map((c) =>
      [
        `"${c.name || ""}"`,
        `"${c.industry || ""}"`,
        c.website || "",
        c.email || "",
        c.phone || "",
        `"${c.city || ""}"`,
        c.size || "",
        c.gstNumber || "",
      ].join(","),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "crm_companies.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (company) => {
    setEditingId(company.id);
    setForm({ ...emptyForm, ...company });
    setError("");
    setShowForm(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = editingId
        ? await api.crmCompanies.update(editingId, form)
        : await api.crmCompanies.create(form);
      if (res?.success) {
        setShowForm(false);
        load();
      } else {
        setError(res?.message || "Failed to save company");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company? This cannot be undone.")) return;
    const res = await api.crmCompanies.delete(id);
    if (res?.success) load();
  };

  return (
    <div className="light-companies-container">
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
      <div className="comp-marquee-banner">
        <div className="comp-marquee-track">
          <span>✨ Recruweb Enterprise CRM Companies &amp; Organizations</span>
          <span>•</span>
          <span>🏢 Organizations Linked to CRM Clients &amp; Contacts</span>
          <span>•</span>
          <span>⭐ Organization Profiles, Industry Mapping &amp; CSV Exports</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Companies CRM <span className="gradient-text">— Organizations</span>
            </h1>
            <p className="cand-subtitle">
              Organizations linked to your CRM clients &amp; contacts ({companies.length} Total Registered)
            </p>
          </div>
          <div className="header-actions">
            <button
              className="cv-action-btn secondary"
              onClick={load}
              title="Refresh Data"
            >
              🔄 Refresh
            </button>
            <button
              className="cv-action-btn secondary"
              onClick={handleExportCSV}
              title="Export CSV"
            >
              📥 Export CSV
            </button>
            <button className="cv-action-btn primary glow-btn" onClick={openCreate}>
              <span>+ New Company ✨</span>
            </button>
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Toolbar Search Bar */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", maxWidth: "400px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="comp-search-input"
            placeholder="Search by company name, email, or website..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Fetching CRM companies...
            </div>
          ) : companies.length === 0 ? (
            <div className="cand-empty-state">
              <div className="empty-icon">🏢</div>
              <h3>No companies found</h3>
              <p>
                Click &quot;New Company&quot; to add your first organization or
                adjust your search.
              </p>
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>City / Location</th>
                    <th>Contact Information</th>
                    <th>Company Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="table-row-hover">
                      <td>
                        <div className="company-name-cell">
                          <strong>{c.name}</strong>
                          {c.website && (
                            <span className="company-web-text">
                              🌐 {c.website}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{c.industry || "—"}</td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{c.city || "—"}</td>
                      <td className="contact-cell">
                        {c.email && <div>✉️ {c.email}</div>}
                        {c.phone && <div>📞 {c.phone}</div>}
                        {!c.email && !c.phone && "—"}
                      </td>
                      <td>
                        {c.size ? (
                          <span className="size-badge-pill">{c.size}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <div className="action-btns-group">
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => openEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>
                        </div>
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

      {/* ---- Create / Edit Company Modal ---- */}
      {showForm && (
        <div className="modal-overlay-light" onClick={() => setShowForm(false)}>
          <div
            className="modal-card-light"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "650px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>
                  {editingId
                    ? "✏️ Edit Company Profile"
                    : "✨ New Company Organization"}
                </h2>
                <p className="drawer-subtext">Fill in the organization details below</p>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="drawer-scroll-body">
              {error && <div className="cand-msg-banner" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>❌ {error}</div>}

              <div className="input-group-3d">
                <label>Company Name *</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Acme Technologies Pvt Ltd"
                  className="cand-input"
                />
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Industry</label>
                  <input
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="Information Technology"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Website URL</label>
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="info@company.com"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="input-group-3d">
                <label>Street Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Tech Park, Sector V"
                  className="cand-input"
                />
              </div>

              <div className="form-grid-3">
                <div className="input-group-3d">
                  <label>City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Gurugram"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>State</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Haryana"
                    className="cand-input"
                  />
                </div>
                <div className="input-group-3d">
                  <label>Country</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="India"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Company Size</label>
                  <select
                    name="size"
                    className="cand-input"
                    value={form.size}
                    onChange={handleChange}
                  >
                    <option value="">Select Size...</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>GST Number</label>
                  <input
                    name="gstNumber"
                    value={form.gstNumber}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="cand-input"
                  />
                </div>
              </div>

              <div className="input-group-3d">
                <label>Internal Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="cand-input"
                  style={{ resize: "vertical" }}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Key corporate accounts, notes..."
                />
              </div>

              <button
                type="submit"
                className="cv-action-btn primary glow-btn"
                disabled={saving}
                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Company Profile ✨"
                    : "Create Company Profile ✨"}
              </button>
            </form>
          </div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-companies-container {
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
        .comp-marquee-banner {
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

        .comp-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .comp-marquee-track span {
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

        .comp-search-input {
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

        .company-name-cell strong {
          color: #0f172a;
          font-size: 14.5px;
          font-weight: 900;
        }

        .company-web-text {
          font-size: 11.5px;
          color: #0284c7;
          font-weight: 700;
        }

        .contact-cell {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
          line-height: 1.5;
        }

        .size-badge-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
          display: inline-block;
        }

        .action-btns-group {
          display: flex;
          gap: 8px;
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
          margin: 0;
          font-weight: 600;
        }

        /* Modal / Form Styling */
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
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
          width: 100%;
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
          gap: 14px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
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

        .cand-msg-banner {
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          color: #0369a1;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default AdminCrmCompanies;