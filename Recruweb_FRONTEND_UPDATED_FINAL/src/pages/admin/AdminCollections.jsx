import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmtMoney = (n) =>
  n === undefined || n === null
    ? "—"
    : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const Card = ({ label, value, color }) => (
  <div className="cand-stat-card-3d">
    <div className="card-bg-light-glow"></div>
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div className="stat-lbl">{label}</div>
      <div className="stat-val" style={{ color: color || "#0f172a" }}>
        {value}
      </div>
    </div>
    <div
      className="card-glow-bar"
      style={{ background: color || "#0284c7" }}
    ></div>
  </div>
);

export default function AdminCollections() {
  const [tab, setTab] = useState("collections"); // collections | payments
  const [collections, setCollections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    invoiceId: "",
    amount: "",
    mode: "bank_transfer",
    referenceNo: "",
    status: "received",
    paymentDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const [colRes, payRes] = await Promise.all([
      api.finance.getCollections(),
      api.payments.getAll(),
    ]);
    if (colRes?.success) setCollections(colRes.data);
    if (payRes?.success) setPayments(payRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await api.payments.create(form);
    if (res?.success) {
      setMessage(`Payment ${res.data.paymentNumber} recorded successfully.`);
      setForm({
        invoiceId: "",
        amount: "",
        mode: "bank_transfer",
        referenceNo: "",
        status: "received",
        paymentDate: "",
        notes: "",
      });
      setShowForm(false);
      load();
    } else {
      setMessage(res?.message || "Failed to record payment.");
    }
    setSaving(false);
  };

  const statusMeta = (status) => {
    switch (status) {
      case "received":
      case "paid":
        return {
          bg: "#ecfdf5",
          text: "#059669",
          border: "#a7f3d0",
          dot: "#059669",
        };
      case "pending":
        return {
          bg: "#fef3c7",
          text: "#d97706",
          border: "#fde68a",
          dot: "#d97706",
        };
      case "failed":
      case "refunded":
        return {
          bg: "#fef2f2",
          text: "#dc2626",
          border: "#fecaca",
          dot: "#dc2626",
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

  return (
    <div className="light-col-container">
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
      <div className="col-marquee-banner">
        <div className="col-marquee-track">
          <span>✨ Recruweb Enterprise Payments &amp; Collections</span>
          <span>•</span>
          <span>💳 Track Outstanding Balances, Receivables &amp; Historical Payment Logs</span>
          <span>•</span>
          <span>⭐ Real-time Receipts &amp; Financial Tracking</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Payments &amp; Collections{" "}
              <span className="gradient-text">— Financials</span>
            </h1>
            <p className="cand-subtitle">
              Track outstanding balances, receivables, and historical payment logs
            </p>
          </div>
          <button
            className="cv-action-btn primary glow-btn"
            onClick={() => setShowForm((s) => !s)}
          >
            <span>{showForm ? "Cancel Form" : "+ Record Payment ✨"}</span>
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
            <h3 className="form-heading" style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "18px" }}>✨ Record New Payment Receipt</h3>
            <form onSubmit={submit} className="col-form-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-grid-2">
                <div className="input-group-3d">
                  <label>Select Invoice (Outstanding) *</label>
                  <select
                    required
                    className="cand-input"
                    value={form.invoiceId}
                    onChange={(e) =>
                      setForm({ ...form, invoiceId: e.target.value })
                    }
                  >
                    <option value="">
                      — Choose Outstanding Invoice —
                    </option>
                    {collections.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.client?.name} — Balance Due:{" "}
                        {fmtMoney(inv.balanceDue)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Amount Received *</label>
                  <input
                    required
                    type="number"
                    className="cand-input"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <div className="input-group-3d">
                  <label>Payment Mode</label>
                  <select
                    className="cand-input"
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="input-group-3d">
                  <label>Reference No.</label>
                  <input
                    className="cand-input"
                    placeholder="UTR / Txn ID"
                    value={form.referenceNo}
                    onChange={(e) =>
                      setForm({ ...form, referenceNo: e.target.value })
                    }
                  />
                </div>
                <div className="input-group-3d">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    className="cand-input"
                    value={form.paymentDate}
                    onChange={(e) =>
                      setForm({ ...form, paymentDate: e.target.value })
                    }
                  />
                </div>
                <div className="input-group-3d">
                  <label>Status</label>
                  <select
                    className="cand-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="received">Received</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="cv-action-btn primary glow-btn"
                disabled={saving}
                style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
              >
                {saving ? "Recording Payment..." : "Record Payment ✨"}
              </button>
            </form>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="cand-tabs-bar" style={{ position: 'relative', zIndex: 2 }}>
        <button
          className={`cand-tab-btn${tab === "collections" ? " active" : ""}`}
          onClick={() => setTab("collections")}
        >
          Outstanding Collections ({collections.length})
        </button>
        <button
          className={`cand-tab-btn${tab === "payments" ? " active" : ""}`}
          onClick={() => setTab("payments")}
        >
          Payment History ({payments.length})
        </button>
      </div>

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading records...
            </div>
          ) : tab === "collections" ? (
            !collections.length ? (
              <div className="cand-empty-state">
                No outstanding balances — all invoices fully collected.
              </div>
            ) : (
              <div className="cand-table-wrap">
                <table className="cand-light-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Client Account</th>
                      <th>Total Amount</th>
                      <th>Paid Amount</th>
                      <th>Balance Due</th>
                      <th>Due Date</th>
                      <th>Overdue By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((inv) => (
                      <tr key={inv.id} className="table-row-hover">
                        <td>
                          <strong style={{ color: "#0f172a", fontWeight: "900" }}>{inv.invoiceNumber}</strong>
                        </td>
                        <td>
                          <span className="client-name-text" style={{ color: "#0f172a", fontWeight: "900" }}>
                            🏢 {inv.client?.name || "—"}
                          </span>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{fmtMoney(inv.totalAmount)}</td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{fmtMoney(inv.amountPaid)}</td>
                        <td>
                          <span style={{ color: "#dc2626", fontWeight: "900" }}>
                            {fmtMoney(inv.balanceDue)}
                          </span>
                        </td>
                        <td className="date-text">{fmtDate(inv.dueDate)}</td>
                        <td>
                          {inv.overdueDays > 0 ? (
                            <span className="overdue-tag">
                              {inv.overdueDays} days
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : !payments.length ? (
            <div className="cand-empty-state">No payments recorded yet.</div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Payment #</th>
                    <th>Invoice #</th>
                    <th>Client Account</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Reference No.</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const meta = statusMeta(p.status);
                    return (
                      <tr key={p.id} className="table-row-hover">
                        <td>
                          <strong style={{ color: "#0f172a", fontWeight: "900" }}>{p.paymentNumber}</strong>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{p.invoice?.invoiceNumber || "—"}</td>
                        <td>
                          <span className="client-name-text" style={{ color: "#0f172a", fontWeight: "900" }}>
                            🏢 {p.client?.name || "—"}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#059669", fontWeight: "900" }}>{fmtMoney(p.amount)}</strong>
                        </td>
                        <td>
                          <span className="mode-pill">{p.mode}</span>
                        </td>
                        <td className="date-text">{p.referenceNo || "—"}</td>
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
                              {p.status}
                            </span>
                          </div>
                        </td>
                        <td className="date-text">{fmtDate(p.paymentDate)}</td>
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
        .light-col-container {
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
        .col-marquee-banner {
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

        .col-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .col-marquee-track span {
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

        .cand-tabs-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          background: #ffffff;
          padding: 6px;
          border-radius: 18px;
          border: 1.5px solid #cbd5e1;
          margin-bottom: 24px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
        }

        .cand-tab-btn {
          padding: 9px 18px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 13.5px;
          font-weight: 800;
          border-radius: 12px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .cand-tab-btn.active {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
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

        .overdue-tag {
          background: #fef2f2;
          color: #dc2626;
          font-size: 11px;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: 10px;
          border: 1.5px solid #fecaca;
        }

        .mode-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
          text-transform: uppercase;
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
          padding: 4px 10px;
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