import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const fmtMoney = (n) =>
  n === undefined || n === null
    ? "—"
    : Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const emptyForm = {
  clientId: "",
  title: "",
  amount: "",
  currency: "INR",
  status: "sent",
  issueDate: "",
  dueDate: "",
  notes: "",
  gstRate: "18",
  placeOfSupply: "",
  tdsApplicable: false,
  tdsSection: "194C",
  tdsRate: "2",
};

const statusMeta = (status) => {
  switch (status) {
    case "paid":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
        dot: "#059669",
      };
    case "sent":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
        dot: "#0284c7",
      };
    case "partially_paid":
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
        dot: "#d97706",
      };
    case "overdue":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
        dot: "#dc2626",
      };
    case "cancelled":
      return {
        bg: "#f1f5f9",
        text: "#64748b",
        border: "#cbd5e1",
        dot: "#64748b",
      };
    default:
      return {
        bg: "#f1f5f9",
        text: "#64748b",
        border: "#cbd5e1",
        dot: "#64748b",
      };
  }
};

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    try {
      const [invRes, clientRes] = await Promise.all([
        api.crmInvoices.getAll(),
        api.crmClients.getAll(),
      ]);
      if (invRes?.success) setInvoices(invRes.data || []);
      if (clientRes?.success) setClients(clientRes.data || []);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setShowForm(true);
    setMessage("");
  };

  const openEdit = (inv) => {
    setEditingId(inv.id);
    setForm({
      clientId: inv.clientId || "",
      title: inv.title || "",
      amount: inv.amount || "",
      currency: inv.currency || "INR",
      status: inv.status || "sent",
      issueDate: inv.issueDate ? inv.issueDate.substring(0, 10) : "",
      dueDate: inv.dueDate ? inv.dueDate.substring(0, 10) : "",
      notes: inv.notes || "",
      gstRate: inv.gstRate ?? "18",
      placeOfSupply: inv.placeOfSupply || "",
      tdsApplicable: !!inv.tdsApplicable,
      tdsSection: inv.tdsSection || "194C",
      tdsRate: inv.tdsRate ?? "2",
    });
    setFile(null);
    setShowForm(true);
    setMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    let res;
    if (editingId) {
      res = await api.crmInvoices.update(editingId, form, file);
    } else {
      res = await api.crmInvoices.create(form, file);
    }

    if (res?.success) {
      setMessage(
        editingId
          ? "✅ Invoice updated successfully."
          : "🚀 Invoice auto-generated successfully.",
      );
      closeForm();
      load();
    } else {
      setMessage(res?.message || "❌ Failed to process invoice.");
    }
    setSaving(false);
  };


  const handleDownload = async (inv) => {
    setMessage("");
    setDownloadingId(inv.id);
    try {
      await api.crmInvoices.download(inv.id);
    } catch (err) {
      setMessage(`❌ ${err?.message || "Failed to download invoice PDF."}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    const res = await api.crmInvoices.delete(id);
    if (res?.success) {
      load();
    } else {
      alert("Failed to delete invoice.");
    }
  };

  return (
    <div className="light-inv-container">
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
      <div className="inv-marquee-banner">
        <div className="inv-marquee-track">
          <span>✨ Recruweb Enterprise Client Invoices &amp; Financials</span>
          <span>•</span>
          <span>📊 Finance Dashboard, Revenue Reports, Payments &amp; Collections</span>
          <span>•</span>
          <span>⭐ GST, TDS &amp; Automated Invoice Generation</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Client Invoices <span className="gradient-text">— Financials</span>
            </h1>
            <div className="inv-nav-links" style={{ display: "flex", gap: "16px", fontSize: "13px", marginTop: "6px" }}>
              <Link to="/admin/finance" className="nav-link-item">
                📊 Finance Dashboard &amp; Revenue Reports →
              </Link>
              <Link to="/admin/finance/collections" className="nav-link-item">
                💳 Payments &amp; Collections →
              </Link>
            </div>
          </div>
          <button
            className="cv-action-btn primary glow-btn"
            onClick={() => (showForm ? closeForm() : openCreate())}
          >
            <span>{showForm ? "✕ Close Form" : "+ Raise Invoice ✨"}</span>
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {message && <div className="cand-msg-banner" style={{ marginBottom: "24px", position: 'relative', zIndex: 2, background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>ℹ️ {message}</div>}

      {/* Glass Form Card */}
      {showForm && (
        <div className="cand-card-3d animate-modal" style={{ marginBottom: "28px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="form-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className="form-heading" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                {editingId
                  ? "✏️ Edit Client Invoice"
                  : "✨ Auto-Generate Client Invoice"}
              </h3>
              <button className="close-drawer-btn" onClick={closeForm}>
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="inv-form-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Select Client *</label>
                  <select
                    required
                    className="cand-input"
                    value={form.clientId}
                    onChange={(e) =>
                      setForm({ ...form, clientId: e.target.value })
                    }
                  >
                    <option value="">— Choose Client Account —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.clientCode || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Invoice Title *</label>
                  <input
                    required
                    className="cand-input"
                    placeholder="e.g. Placement Fee — March"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <div className="input-group-3d">
                  <label>Taxable Amount *</label>
                  <input
                    required
                    type="number"
                    className="cand-input"
                    placeholder="Before GST"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div className="input-group-3d">
                  <label>Status</label>
                  <select
                    className="cand-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    className="cand-input"
                    value={form.issueDate}
                    onChange={(e) =>
                      setForm({ ...form, issueDate: e.target.value })
                    }
                  />
                </div>
                <div className="input-group-3d">
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="cand-input"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* GST & TDS Section */}
              <div className="tax-config-box" style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "18px", borderRadius: "16px" }}>
                <h4 className="tax-box-title" style={{ fontSize: "14.5px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>
                  ⚙️ Tax Configuration (GST &amp; TDS)
                </h4>
                <div className="form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "center" }}>
                  <div className="input-group-3d">
                    <label>GST Rate (%)</label>
                    <input
                      type="number"
                      className="cand-input"
                      value={form.gstRate}
                      onChange={(e) =>
                        setForm({ ...form, gstRate: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group-3d">
                    <label>Place of Supply (State)</label>
                    <input
                      className="cand-input"
                      placeholder="e.g. Haryana"
                      value={form.placeOfSupply}
                      onChange={(e) =>
                        setForm({ ...form, placeOfSupply: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group-3d checkbox-align" style={{ display: "flex", alignItems: "flex-end", height: "100%" }}>
                    <label className="checkbox-label-row">
                      <input
                        type="checkbox"
                        checked={form.tdsApplicable}
                        onChange={(e) =>
                          setForm({ ...form, tdsApplicable: e.target.checked })
                        }
                      />
                      <span>TDS Applicable</span>
                    </label>
                  </div>
                </div>

                {form.tdsApplicable && (
                  <div className="form-grid-2" style={{ marginTop: "12px" }}>
                    <div className="input-group-3d">
                      <label>TDS Section</label>
                      <input
                        className="cand-input"
                        value={form.tdsSection}
                        onChange={(e) =>
                          setForm({ ...form, tdsSection: e.target.value })
                        }
                      />
                    </div>
                    <div className="input-group-3d">
                      <label>TDS Rate (%)</label>
                      <input
                        type="number"
                        className="cand-input"
                        value={form.tdsRate}
                        onChange={(e) =>
                          setForm({ ...form, tdsRate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Attractive File Input Picker */}
              <div className="input-group-3d">
                <label>Attach PDF Invoice (Optional)</label>
                <div className="ev-file-upload-wrapper" style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "14px", padding: "8px 12px" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/pdf"
                    className="ev-hidden-file-input"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <button
                    type="button"
                    className="cv-action-btn primary"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📂 {file ? "Change PDF" : "Choose PDF ✨"}
                  </button>
                  <span className="ev-file-name-display" style={{ fontSize: "13px", color: "#64748b", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file ? file.name : "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="form-action-btns" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="cv-action-btn secondary"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cv-action-btn primary glow-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving Invoice..."
                    : editingId
                      ? "Update Invoice ✨"
                      : "Auto-Generate Invoice ✨"}
                </button>
              </div>
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
              <span className="cand-loader"></span> Loading client invoices...
            </div>
          ) : !invoices.length ? (
            <div className="cand-empty-state">
              No invoices raised yet. Click &quot;Raise Invoice&quot; to begin.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client Account</th>
                    <th>Taxable Amt</th>
                    <th>GST</th>
                    <th>TDS</th>
                    <th>Total Amount</th>
                    <th>Paid</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                    <th>Issued Date</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const meta = statusMeta(inv.status);
                    const balanceNum = Number(inv.balanceDue);
                    return (
                      <tr key={inv.id} className="table-row-hover">
                        <td>
                          <strong style={{ color: "#0f172a", fontWeight: "900" }}>{inv.invoiceNumber}</strong>
                          {inv.title && (
                            <div className="sub-title-inv">{inv.title}</div>
                          )}
                        </td>
                        <td>
                          <span className="client-name-text">
                            🏢 {inv.client?.name || "—"}
                          </span>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>
                          {inv.currency || "INR"} {fmtMoney(inv.amount)}
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>
                          {fmtMoney(inv.gstAmount)}{" "}
                          <span className="sub-tax">({inv.gstRate}%)</span>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>
                          {inv.tdsApplicable
                            ? `${fmtMoney(inv.tdsAmount)} (${inv.tdsRate}%)`
                            : "—"}
                        </td>
                        <td>
                          <strong className="total-text" style={{ color: "#0f172a", fontWeight: "900" }}>
                            {fmtMoney(inv.totalAmount)}
                          </strong>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{fmtMoney(inv.amountPaid)}</td>
                        <td>
                          <span
                            style={{
                              color: balanceNum > 0 ? "#dc2626" : "#059669",
                              fontWeight: "900",
                            }}
                          >
                            {fmtMoney(inv.balanceDue)}
                          </span>
                        </td>
                        <td>
                          <div className="status-cell-wrap">
                            <span
                              className="status-dot"
                              style={{ background: meta.dot }}
                            ></span>
                            <span
                              className="status-pill-badge"
                              style={{
                                background: meta.bg,
                                color: meta.text,
                                borderColor: meta.border,
                              }}
                            >
                              {inv.status}
                            </span>
                          </div>
                        </td>
                        <td className="date-text">{fmtDate(inv.issueDate)}</td>
                        <td className="date-text">{fmtDate(inv.dueDate)}</td>
                        <td>
                          <div className="action-row-flex" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              onClick={() => handleDownload(inv)}
                              disabled={downloadingId === inv.id}
                              title="Download PDF"
                            >
                              {downloadingId === inv.id ? "Preparing…" : "PDF ↓"}
                            </button>
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              onClick={() => openEdit(inv)}
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              className="cv-action-btn"
                              style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => handleDelete(inv.id)}
                              title="Delete"
                            >
                              Delete
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

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-inv-container {
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
        .inv-marquee-banner {
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

        .inv-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .inv-marquee-track span {
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

        .nav-link-item {
          color: #0284c7;
          text-decoration: none;
          font-weight: 800;
        }
        .nav-link-item:hover {
          text-decoration: underline;
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

        .form-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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

        /* Attractive File Input Picker */
        .ev-file-upload-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          padding: 8px 12px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .ev-file-upload-wrapper:hover {
          border-color: #0284c7;
          box-shadow: 0 8px 25px rgba(2, 132, 199, 0.12);
          transform: translateY(-1px);
        }
        .ev-hidden-file-input { display: none; }
        .ev-file-trigger-btn {
          background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%);
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);
          transition: all 0.25s ease;
        }
        .ev-file-trigger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
          filter: brightness(1.05);
        }
        .ev-file-trigger-btn:active { transform: scale(0.97); }
        .ev-file-name-display {
          font-size: 13px;
          color: #475569;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .checkbox-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #334155;
          font-weight: 800;
          cursor: pointer;
          height: 100%;
        }

        .client-name-text {
          font-weight: 800;
          color: #0f172a;
        }

        .sub-title-inv {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 700;
          margin-top: 2px;
        }

        .sub-tax {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
        }

        .status-cell-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-pill-badge {
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

        @media (max-width: 1024px) {
          .form-grid-4 {
            grid-template-columns: 1fr 1fr;
          }
          .form-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .form-grid-2, .form-grid-4 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}