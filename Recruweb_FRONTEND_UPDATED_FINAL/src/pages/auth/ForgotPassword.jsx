import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../utils/api";

const ForgotPassword = () => {
  // Steps: "email" (Step 1 — enter email) or "sent" (Step 2 — check inbox)
  const [step, setStep] = useState("email");

  // Form States
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const cardRef = useRef(null);

  // 3D Tilt Interactive Mouse Motion
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
  };

  // Sends a real password-reset link to the user's email.
  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const body = await response.json();

      if (response.ok && body.success) {
        setStep("sent");
        setSuccessMessage(
          body.message ||
            "If an account exists for that email, a password reset link has been sent.",
        );
      } else {
        setError(body.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-3d-wrapper">
      <div className="bg-image-overlay"></div>
      <div className="ambient-sphere sphere-1"></div>
      <div className="ambient-sphere sphere-2"></div>
      <div className="ambient-sphere sphere-3"></div>

      <div className="forgot-3d-container">
        <div
          className="forgot-3d-card"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="card-brand">
            <img
              src="/images/logo.png"
              alt="Recruweb Logo"
              className="brand-logo-3d"
            />
          </div>

          <div className="forgot-header">
            <h2>{step === "email" ? "Forgot Password" : "Check Your Email"}</h2>
            <p>
              {step === "email"
                ? "Enter your registered email — we'll send you a link to reset your password"
                : "We've sent a password reset link to your email address"}
            </p>
          </div>

          {successMessage && (
            <div className="alert-box success">
              <span>✅</span> {successMessage}
            </div>
          )}

          {error && (
            <div className="alert-box error">
              <span>❌</span> {error}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendResetLink} className="forgot-3d-form">
              <div className="input-group-3d">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={error ? "has-error" : ""}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-forgot-3d"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-spinner-wrap">
                    <span className="spinner-dot"></span> Sending Link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="forgot-3d-form">
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Click the link in the email we sent to{" "}
                <strong style={{ color: "#fff" }}>{email}</strong> to set a new
                password. The link expires in 30 minutes.
              </p>
              <button
                type="button"
                className="btn-forgot-3d"
                onClick={() => {
                  setStep("email");
                  setSuccessMessage("");
                }}
                style={{ marginTop: "16px" }}
              >
                Use a Different Email
              </button>
            </div>
          )}

          <div className="card-footer-3d">
            <Link to="/login" className="back-link">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .forgot-3d-wrapper {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07090e;
          overflow: hidden;
          font-family: var(--font-body);
        }

        .bg-image-overlay {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          opacity: 0.12;
          filter: blur(5px);
          z-index: 0;
        }

        .ambient-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }

        .sphere-1 {
          width: 350px;
          height: 350px;
          top: -10%;
          left: 10%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%);
        }

        .sphere-2 {
          width: 380px;
          height: 380px;
          bottom: -10%;
          right: 10%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
        }

        .sphere-3 {
          width: 250px;
          height: 250px;
          top: 50%;
          left: 70%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%);
        }

        .forgot-3d-container {
          position: relative;
          z-index: 2;
          padding: 20px;
          width: 100%;
          max-width: 420px; /* Medium compact size */
        }

        .forgot-3d-card {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: transform 0.15s ease-out;
          transform-style: preserve-3d;
        }

        .card-brand {
          text-align: center;
          margin-bottom: 14px;
        }

        .brand-logo-3d {
          height: 40px;
          object-fit: contain;
          filter: drop-shadow(0 3px 10px rgba(255, 255, 255, 0.25));
        }

        .forgot-header {
          text-align: center;
          margin-bottom: 22px;
        }

        .forgot-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }

        .forgot-header p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 600;
          line-height: 1.5;
        }

        .alert-box {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 12.5px;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-box.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .alert-box.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .input-group-3d {
          margin-bottom: 18px;
        }

        .input-group-3d label {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 6px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          font-size: 14px;
          pointer-events: none;
          opacity: 0.7;
        }

        .input-wrapper input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: rgba(11, 15, 25, 0.75);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: all 0.25s ease;
        }

        .input-wrapper input:focus {
          border-color: #818cf8;
          background: rgba(11, 15, 25, 0.95);
          box-shadow: 0 0 12px rgba(129, 140, 248, 0.25);
        }

        .input-wrapper input.has-error {
          border-color: #f87171;
        }

        .btn-forgot-3d {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          border: none;
          border-radius: 12px;
          color: #ffffff;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
          transition: all 0.25s ease;
        }

        .btn-forgot-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(99, 102, 241, 0.5);
        }

        .btn-forgot-3d:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-spinner-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner-dot {
          width: 12px;
          height: 12px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .card-footer-3d {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
        }

        .back-link {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .forgot-3d-card {
            padding: 26px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;