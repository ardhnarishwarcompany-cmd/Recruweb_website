import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const emptyForm = {
  name: "",
  code: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  phone: "",
  email: "",
  isHeadOffice: false,
};

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.branches.getAll().then((res) => {
      if (res.success) setBranches(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const startEdit = (branch) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name || "",
      code: branch.code || "",
      address: branch.address || "",
      city: branch.city || "",
      state: branch.state || "",
      country: branch.country || "India",
      pincode: branch.pincode || "",
      phone: branch.phone || "",
      email: branch.email || "",
      isHeadOffice: !!branch.isHeadOffice,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = editingId
      ? await api.branches.update(editingId, form)
      : await api.branches.create(form);
    if (res.success) {
      load();
      resetForm();
    } else {
      setError(res.message || "Failed to save branch");
    }
  };

  const toggleActive = async (branch) => {
    const res = await api.branches.update(branch.id, {
      isActive: !branch.isActive,
    });
    if (res.success)
      setBranches((prev) =>
        prev.map((b) => (b.id === branch.id ? res.data : b)),
      );
  };

  const handleDelete = async (branch) => {
    if (
      !window.confirm(
        `Delete branch "${branch.name}"? Staff assigned to it will become unassigned.`,
      )
    )
      return;
    const res = await api.branches.delete(branch.id);
    if (res.success)
      setBranches((prev) => prev.filter((b) => b.id !== branch.id));
    else alert(res.message || "Failed to delete branch");
  };

  return (
    <div className="light-branch-container">
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
      <div className="branch-marquee-banner">
        <div className="branch-marquee-track">
          <span>✨ Recruweb Enterprise Branch Management &amp; Administration</span>
          <span>•</span>
          <span>🏢 Manage Office Locations and Regional Branches Staff Can Be Assigned To</span>
          <span>•</span>
          <span>⭐ Real-time Head Office &amp; Branch Tracking</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Branch Management{" "}
              <span className="gradient-text">— Administration</span>
            </h1>
            <p className="cand-subtitle">
              Manage office locations and regional branches staff can be assigned to ({branches.length} Total)
            </p>
          </div>
          <button
            className="cv-action-btn primary glow-btn"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            <span>{showForm ? "Cancel Form" : "+ Add Branch ✨"}</span>
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Form Card */}
      {showForm && (
        <div className="cand-card-3d animate-modal" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 className="form-heading" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "18px" }}>
              {editingId
                ? "✏️ Edit Branch Location"
                : "✨ Register New Branch Office"}
            </h3>
            <form onSubmit={handleSubmit} className="branch-form-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Branch Name *</label>
                  <input
                    name="name"
                    className="cand-input"
                    placeholder="e.g. Noida Sector 62 Office"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group-3d">
                  <label>Branch Code</label>
                  <input
                    name="code"
                    className="cand-input"
                    placeholder="e.g. DEL-01"
                    value={form.code}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group-3d">
                <label>Street Address</label>
                <input
                  name="address"
                  className="cand-input"
                  placeholder="e.g. Plot No. 42, Institutional Area"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="input-group-3d">
                  <label>City</label>
                  <input
                    name="city"
                    className="cand-input"
                    placeholder="Noida"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group-3d">
                  <label>State</label>
                  <input
                    name="state"
                    className="cand-input"
                    placeholder="Uttar Pradesh"
                    value={form.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group-3d">
                  <label>Pincode</label>
                  <input
                    name="pincode"
                    className="cand-input"
                    placeholder="201301"
                    value={form.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    className="cand-input"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group-3d">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="cand-input"
                    placeholder="noida@recruweb.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="checkbox-align-row" style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
                <label className="checkbox-label-row" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", fontWeight: "800", color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="isHeadOffice"
                    checked={form.isHeadOffice}
                    onChange={handleChange}
                    style={{ accentColor: "#0284c7", width: "16px", height: "16px" }}
                  />
                  <span>Designate as Head Office</span>
                </label>
              </div>

              {error && <div className="cand-msg-banner" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>⚠️ {error}</div>}

              <button type="submit" className="cv-action-btn primary glow-btn" style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}>
                {editingId ? "Update Branch ✨" : "Create Branch Office ✨"}
              </button>
            </form>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading branches directory...
            </div>
          ) : branches.length === 0 ? (
            <div className="cand-empty-state">
              No branches registered yet. Click &quot;Add Branch&quot; to begin.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Branch Name</th>
                    <th>Code</th>
                    <th>City Location</th>
                    <th>Assigned Staff</th>
                    <th>Head Office</th>
                    <th>Status</th>
                    <th>Actions &amp; Management</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => (
                    <tr key={b.id} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>{b.name}</strong>
                      </td>
                      <td>
                        <span className="code-pill">{b.code || "—"}</span>
                      </td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{b.city || "—"}</td>
                      <td>
                        <span className="staff-count-pill">
                          {b.staffCount ?? 0} staff
                        </span>
                      </td>
                      <td>
                        {b.isHeadOffice ? (
                          <span className="hq-tag">⭐ Head Office</span>
                        ) : (
                          <span className="sub-none">—</span>
                        )}
                      </td>
                      <td>
                        <label className="admin-toggle">
                          <input
                            type="checkbox"
                            checked={b.isActive}
                            onChange={() => toggleActive(b)}
                          />
                          <span className="admin-toggle-slider" />
                        </label>
                      </td>
                      <td>
                        <div className="action-row-flex" style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => startEdit(b)}
                          >
                            Edit
                          </button>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                            onClick={() => handleDelete(b)}
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

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-branch-container {
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
        .branch-marquee-banner {
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

        .branch-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .branch-marquee-track span {
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

        .animate-modal {
          animation: modalAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
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

        .code-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
        }

        .staff-count-pill {
          background: #f3e8ff;
          color: #9333ea;
          font-size: 11.5px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1.5px solid #e9d5ff;
        }

        .hq-tag {
          font-size: 12px;
          color: #059669;
          font-weight: 900;
        }

        .sub-none {
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

        @media (max-width: 1024px) {
          .form-grid-3 {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .form-grid-2, .form-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBranches;