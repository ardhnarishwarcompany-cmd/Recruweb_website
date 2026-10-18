import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

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

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ClientHrmsPlans() {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const [plansRes, subsRes] = await Promise.all([
      api.hrms.getPlans(),
      api.clientPortal.getHrmsSubscriptions(),
    ]);
    if (plansRes?.success) setPlans(plansRes.data || []);
    if (subsRes?.success) setSubscriptions(subsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const standalone = plans.find((p) => p.id === "hrms-standalone");
  const monthlyPreview = useMemo(
    () => Number(standalone?.price || 299) * Math.max(1, Number(employeeCount || 1)),
    [standalone, employeeCount],
  );

  const startPayment = async (plan) => {
    setError("");
    setPaying(plan.id);

    try {
      if (plan.id === "hrms-standalone" && (!Number.isInteger(Number(employeeCount)) || Number(employeeCount) < 1)) {
        throw new Error("Enter a valid employee count.");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay Checkout. Please check your internet connection.");
      }

      const orderRes = await api.clientPortal.createHrmsPurchaseOrder({
        planId: plan.id,
        employeeCount: plan.id === "hrms-standalone" ? Number(employeeCount) : undefined,
      });

      if (!orderRes?.success) {
        throw new Error(orderRes?.message || "Could not start HRMS payment.");
      }

      const { keyId, orderId, amount, currency, prefill, invoice, subscription } = orderRes.data;

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: "Recruweb Resources Pvt. Ltd.",
        description: `HRMS — ${plan.name}`,
        prefill,
        theme: { color: "#0284c7" },
        handler: async (response) => {
          try {
            const verify = await api.clientPortal.verifyHrmsPayment({
              invoiceId: invoice.id,
              subscriptionId: subscription.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verify?.success) {
              throw new Error(verify?.message || "Payment verification failed.");
            }

            await load();
          } catch (err) {
            setError(err?.message || "Payment was made but verification failed. Contact support with the payment reference.");
          } finally {
            setPaying("");
          }
        },
        modal: { ondismiss: () => setPaying("") },
      });

      rzp.on("payment.failed", (resp) => {
        setError(resp?.error?.description || "Payment failed.");
        setPaying("");
      });

      rzp.open();
    } catch (err) {
      setError(err?.message || "Could not start HRMS payment.");
      setPaying("");
    }
  };

  return (
    <div className="light-hrms-container">
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
      <div className="hrms-marquee-banner">
        <div className="hrms-marquee-track">
          <span>✨ Recruweb Corporate HRMS &amp; Technology Plans Suite</span>
          <span>•</span>
          <span>💳 11-Month Enterprise Contracts &amp; Signup Tokens</span>
          <span>•</span>
          <span>⭐ Standalone &amp; Comprehensive Hiring Support Packages</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="cand-header-3d" style={{ marginBottom: "28px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            HRMS &amp; HR Technology <span className="gradient-text">Plans</span>
          </h1>
          <p className="cand-subtitle" style={{ lineHeight: "1.6" }}>
            Select your 11-month HR technology plan. Applicable plans require a ₹5,000 signup token, adjustable against the final invoice. Standalone HRMS is priced at ₹299 per employee/month. Prices are subject to GST.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {error && (
        <div className="cand-msg-banner" style={{ marginBottom: "24px", position: 'relative', zIndex: 2, background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading HRMS plans…
        </div>
      ) : (
        <div className="hrms-grid" style={{ position: 'relative', zIndex: 2 }}>
          {plans.filter((p) => p.id !== "hrms-standalone").map((plan) => (
            <div className="cand-card-3d" key={plan.id} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div className="card-bg-light-glow"></div>
              <div style={{ position: 'relative', zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>{plan.name}</h2>
                <div style={{ textDecoration: "line-through", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>MRP {money(plan.mrp)}/month</div>
                <div style={{ fontSize: "32px", fontWeight: "900", color: "#0284c7", margin: "8px 0 16px" }}>
                  {money(plan.price)}<span style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>/month</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #e2e8f0", padding: "10px 0", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>
                  <span>Contract</span>
                  <strong style={{ color: "#0f172a" }}>11 Months</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #e2e8f0", padding: "10px 0", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>
                  <span>Signup Token</span>
                  <strong style={{ color: "#059669" }}>{money(plan.token)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #e2e8f0", padding: "10px 0 16px", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>
                  <span>Hiring Support</span>
                  <strong style={{ color: "#0f172a" }}>{plan.hiringSupport}</strong>
                </div>
                <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                  <button className="cv-action-btn primary glow-btn" style={{ width: "100%", justifyContent: "center" }} disabled={!!paying} onClick={() => startPayment(plan)}>
                    {paying === plan.id ? "Opening secure payment…" : `Pay ${money(plan.token)} Token ✨`}
                  </button>
                </div>
              </div>
              <div className="card-glow-bar"></div>
            </div>
          ))}

          {standalone && (
            <div className="cand-card-3d" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div className="card-bg-light-glow"></div>
              <div style={{ position: 'relative', zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>Standalone HRMS Subscription</h2>
                <div style={{ textDecoration: "line-through", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>MRP {money(standalone.mrp)}/employee/month</div>
                <div style={{ fontSize: "32px", fontWeight: "900", color: "#0284c7", margin: "8px 0 16px" }}>
                  {money(standalone.price)}<span style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>/employee/month</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #e2e8f0", padding: "10px 0 12px", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>
                  <span>Contract</span>
                  <strong style={{ color: "#0f172a" }}>11 Months</strong>
                </div>
                <div style={{ marginTop: "12px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: "800", color: "#334155", display: "block", marginBottom: "6px" }}>Number of employees</label>
                  <input
                    className="cand-input"
                    type="number"
                    min="1"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #e2e8f0", padding: "12px 0 16px", color: "#64748b", fontSize: "13px", fontWeight: "700", marginTop: "12px" }}>
                  <span>Monthly base</span>
                  <strong style={{ color: "#059669" }}>{money(monthlyPreview)}</strong>
                </div>
                <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                  <button className="cv-action-btn primary glow-btn" style={{ width: "100%", justifyContent: "center" }} disabled={!!paying} onClick={() => startPayment(standalone)}>
                    {paying === standalone.id ? "Opening secure payment…" : `Pay ${money(monthlyPreview)} + GST ✨`}
                  </button>
                </div>
              </div>
              <div className="card-glow-bar"></div>
            </div>
          )}
        </div>
      )}

      {/* My Subscriptions Section */}
      <div className="cand-card-3d" style={{ marginTop: "32px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="panel-heading">My HRMS Subscriptions</h2>
          {!subscriptions.length ? (
            <div className="cand-empty-state">No HRMS subscription purchases yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {subscriptions.map((s) => (
                <div key={s.id} style={{ padding: "16px 20px", border: "1.5px solid #cbd5e1", borderRadius: "16px", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                  <div>
                    <strong style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>{s.planName}</strong>
                    <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>
                      {s.employeeCount ? `${s.employeeCount} employees · ` : ""}
                      {s.contractMonths} month contract
                    </div>
                  </div>
                  <span className="status-pill-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-hrms-container {
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
        .hrms-marquee-banner {
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

        .hrms-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .hrms-marquee-track span {
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

        .hrms-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
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
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
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
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
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

        .panel-heading {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 18px;
        }

        .status-pill-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1.5px solid;
          text-transform: uppercase;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 50vh;
          color: #0284c7;
          font-weight: 800;
        }

        .cand-loader {
          width: 24px;
          height: 24px;
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
          padding: 40px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        @media(max-width: 1000px) {
          .hrms-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width: 700px) {
          .hrms-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}