import { useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { API_URL } from "../../utils/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const cardRef = useRef(null);

  // 3D Tilt Interactive Mouse Motion Effect
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!token) {
      setIsError(true);
      setMessage(
        "This reset link is missing or invalid. Please request a new one.",
      );
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const body = await response.json();

      if (response.ok && body.success) {
        setDone(true);
        setMessage(
          body.message ||
            "Password reset successfully. Redirecting to login...",
        );
        setTimeout(() => navigate("/login"), 1800);
      } else {
        setIsError(true);
        setMessage(
          body.message || "Failed to reset password. Please try again.",
        );
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setIsError(true);
      setMessage("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-3d-wrapper">
      {/* Background HD Image Overlay & Ambient Orbs */}
      <div className="bg-image-overlay"></div>
      <div className="ambient-sphere sphere-1"></div>
      <div className="ambient-sphere sphere-2"></div>
      <div className="ambient-sphere sphere-3"></div>

      <div className="reset-3d-container">
        <div
          className="reset-3d-card"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Logo & Header */}
          <div className="card-brand">
            <img
              src="/images/logo.png"
              alt="Recruweb Logo"
              className="brand-logo-3d"
            />
          </div>

          <div className="reset-header">
            <h2>Reset Password</h2>
            <p>Please enter your new secure password below.</p>
          </div>

          {!token && (
            <div className="alert-box error">
              <span>❌</span> This reset link is invalid or incomplete. Please request a new
              one from the{" "}
              <Link to="/forgot-password" style={{ color: "#fca5a5", fontWeight: "800" }}>
                forgot password
              </Link>{" "}
              page.
            </div>
          )}

          <form onSubmit={handleSubmit} className="reset-3d-form">
            <div className="input-group-3d">
              <label>New Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={done || !token}
                />
              </div>
            </div>

            <div className="input-group-3d">
              <label>Confirm New Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🛡️</span>
                <input
                  type="password"
                  className="auth-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={done || !token}
                />
              </div>
            </div>

            <button
              className="btn-reset-3d"
              disabled={loading || done || !token}
            >
              {loading ? (
                <span className="btn-spinner-wrap">
                  <span className="spinner-dot"></span> Updating Password...
                </span>
              ) : done ? (
                "✅ Password Updated"
              ) : (
                "🔒 Update Password"
              )}
            </button>

            {message && (
              <div className={`alert-box ${isError ? "error" : "success"}`}>
                <span>{isError ? "❌" : "✅"}</span> {message}
              </div>
            )}
          </form>

          <div className="card-footer-3d">
            <Link to="/login" className="back-link">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .reset-3d-wrapper {
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

        .reset-3d-container {
          position: relative;
          z-index: 2;
          padding: 20px;
          width: 100%;
          max-width: 420px; /* Medium compact size */
        }

        .reset-3d-card {
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

        .reset-header {
          text-align: center;
          margin-bottom: 22px;
        }

        .reset-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }

        .reset-header p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 600;
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

        .auth-input {
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
          box-sizing: border-box;
        }

        .auth-input:focus {
          border-color: #818cf8;
          background: rgba(11, 15, 25, 0.95);
          box-shadow: 0 0 12px rgba(129, 140, 248, 0.25);
        }

        .btn-reset-3d {
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
          margin-top: 6px;
        }

        .btn-reset-3d:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(99, 102, 241, 0.5);
        }

        .btn-reset-3d:disabled {
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
          .reset-3d-card {
            padding: 26px 20px;
          }
        }
      `}</style>
    </div>
  );
}