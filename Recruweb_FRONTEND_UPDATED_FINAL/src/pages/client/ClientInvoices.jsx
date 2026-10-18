import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const statusMeta = (status) => {
  switch (status) {
    case "paid":
      return {
        bg: "#ecfdf5",
        text: "#059669",
        border: "#a7f3d0",
      };
    case "overdue":
      return {
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
      };
    case "sent":
      return {
        bg: "#e0f2fe",
        text: "#0284c7",
        border: "#bae6fd",
      };
    case "cancelled":
      return {
        bg: "#f1f5f9",
        text: "#64748b",
        border: "#cbd5e1",
      };
    default:
      return {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fde68a",
      };
  }
};

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise = null;
const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
};

const payableStatuses = ["sent", "overdue", "partially_paid"];

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [payError, setPayError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const loadInvoices = () => {
    setLoading(true);
    api.clientPortal.getInvoices().then((res) => {
      if (res?.success) {
        setInvoices(res.data || []);
        setPayError("");
      } else {
        setPayError(res?.message || "Failed to fetch invoices.");
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadInvoices();
  }, []);


  const handleDownload = async (invoice) => {
    setPayError("");
    setDownloadingId(invoice.id);
    try {
      await api.clientPortal.downloadInvoice(invoice.id);
    } catch (err) {
      setPayError(err?.message || "Could not download the invoice PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePayNow = async (invoice) => {
    setPayError("");
    setPayingId(invoice.id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPayError(
          "Could not load the payment gateway. Check your internet connection and try again.",
        );
        setPayingId(null);
        return;
      }

      const orderRes = await api.clientPortal.createPaymentOrder(invoice.id);
      if (!orderRes?.success) {
        setPayError(
          orderRes?.message || "Could not start payment for this invoice.",
        );
        setPayingId(null);
        return;
      }

      const { keyId, orderId, amount, currency, name, prefill, invoiceNumber } =
        orderRes.data;

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name,
        description: `Invoice ${invoiceNumber}`,
        prefill,
        theme: { color: "#0284c7" },
        handler: async (response) => {
          try {
            const verifyRes = await api.clientPortal.verifyPayment(invoice.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes?.success) {
              loadInvoices();
            } else {
              setPayError(
                verifyRes?.message ||
                  "Payment was made but could not be verified. Contact support with your payment reference.",
              );
            }
          } catch {
            setPayError(
              "Payment was made but verification failed. Contact support with your payment reference.",
            );
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingId(null),
        },
      });

      rzp.on("payment.failed", (resp) => {
        setPayError(resp?.error?.description || "Payment failed.");
        setPayingId(null);
      });

      rzp.open();
    } catch (err) {
      setPayError(err?.message || "Could not start payment.");
      setPayingId(null);
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
          <span>✨ Recruweb Corporate Finance &amp; Invoicing Hub</span>
          <span>•</span>
          <span>🧾 Manage &amp; Track Corporate Invoices and Billing</span>
          <span>•</span>
          <span>⭐ Secure Online Razorpay Settlements &amp; PDF Downloads</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Corporate Invoices{" "}
            <span className="gradient-text">— Finance Hub</span>
          </h1>
          <p className="cand-subtitle">
            Manage and track invoices raised against your corporate account by our finance team.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {payError && (
        <div className="cand-msg-banner" style={{ marginBottom: "24px", position: 'relative', zIndex: 2, background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>
          ⚠️ {payError}
          <button
            style={{ background: 'none', border: 'none', color: '#991b1b', fontSize: '18px', cursor: 'pointer', float: 'right', fontWeight: '900' }}
            onClick={() => setPayError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* Glass Panel Content Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading invoices...
            </div>
          ) : !invoices.length ? (
            <div className="cand-empty-state">
              No invoices have been raised against your account yet.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Title / Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Issued Date</th>
                    <th>Due Date</th>
                    <th>Actions &amp; Download</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const meta = statusMeta(inv.status);
                    return (
                      <tr key={inv.id} className="table-row-hover">
                        <td>
                          <strong className="invoice-num-text">
                            {inv.invoiceNumber}
                          </strong>
                        </td>
                        <td style={{ color: "#334155", fontWeight: "700" }}>{inv.title || "—"}</td>
                        <td>
                          <span className="amount-text">
                            {inv.currency || "INR"}{" "}
                            {Number(inv.amount).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td>
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
                        </td>
                        <td className="date-text">{fmtDate(inv.issueDate)}</td>
                        <td className="date-text">{fmtDate(inv.dueDate)}</td>
                        <td>
                          <div className="inv-actions-cell">
                            <button
                              type="button"
                              className="btn-action-download"
                              disabled={downloadingId === inv.id}
                              onClick={() => handleDownload(inv)}
                              title="Download invoice PDF"
                            >
                              {downloadingId === inv.id
                                ? "⏳ Preparing PDF…"
                                : "📥 Download PDF"}
                            </button>

                            {payableStatuses.includes(inv.status) && (
                              <button
                                className="cv-action-btn primary glow-btn"
                                style={{ padding: "8px 16px", fontSize: "12.5px" }}
                                disabled={payingId === inv.id}
                                onClick={() => handlePayNow(inv)}
                              >
                                {payingId === inv.id
                                  ? "Processing…"
                                  : `💳 Pay Now ✨`}
                              </button>
                            )}
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
          margin-bottom: 24px;
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

        .invoice-num-text {
          color: #0284c7;
          font-weight: 900;
        }

        .amount-text {
          font-weight: 900;
          color: #059669;
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

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 600;
        }

        .btn-action-download {
          display: inline-block;
          background: #e0f2fe;
          border: 1.5px solid #bae6fd;
          color: #0284c7;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-action-download:hover {
          background: #bae6fd;
        }

        .inv-actions-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
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

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .sub-none {
          color: #64748b;
          font-size: 12.5px;
          font-weight: 600;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #0284c7;
          font-weight: 800;
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
      `}</style>
    </div>
  );
}