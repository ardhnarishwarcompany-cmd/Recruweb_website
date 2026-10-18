import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";

const STAFF_ROLES = [
  "superadmin",
  "admin",
  "recruiter",
  "hr",
  "hr_manager",
  "recruitment_manager",
  "finance_manager",
];

const dashboardPathForRole = (role) => {
  const r = role?.toLowerCase();
  if (STAFF_ROLES.includes(r)) return "/admin/dashboard";
  if (r === "candidate") return "/candidate/dashboard";
  if (r === "client") return "/client/dashboard";
  if (r === "hr_partner") return "/hr-partner/dashboard";
  return "/";
};

const Login = () => {
  const [loginRole, setLoginRole] = useState("candidate");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchParams] = useSearchParams();

  const cardRef = useRef(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, getDashboardPath } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const dashboardPath = getDashboardPath();
      navigate(dashboardPath);
    }
  }, [isAuthenticated, navigate, getDashboardPath]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: loginRole,
        }),
      });

      const body = await response.json();

      if (response.ok && body.success) {
        const user = body.data.user;
        const token = body.data.accessToken || body.data.token;
        const refreshToken = body.data.refreshToken;

        login(user, token, refreshToken);

        if (formData.rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        setSuccessMessage("Login successful! Redirecting...");

        setTimeout(() => {
          const redirectTo = searchParams.get("redirect");
          if (redirectTo) {
            navigate(redirectTo);
            return;
          }

          navigate(dashboardPathForRole(user.role));
        }, 1000);
      } else {
        setErrors({ submit: body.message || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-3d-wrapper">
      {/* Dynamic Ambient Background Blur */}
      <div className="bg-image-overlay"></div>
      <div className="ambient-sphere sphere-1"></div>
      <div className="ambient-sphere sphere-2"></div>
      <div className="ambient-sphere sphere-3"></div>

      <div className="login-3d-container">
        <div
          className="login-3d-card"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header & Logo */}
          <div className="card-brand">
            <img
              src="/images/logo.png"
              alt="Recruweb Logo"
              className="brand-logo-3d"
            />
          </div>

          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Login to your Recruweb portal</p>
          </div>

          {/* Portal Role Selector */}
          <div className="login-role-selector" aria-label="Choose portal">
            {[
              { key: "candidate", icon: "👤", title: "Candidate", sub: "Find jobs" },
              { key: "hr_partner", icon: "🤝", title: "HR", sub: "Source talent" },
              { key: "client", icon: "🏢", title: "Client", sub: "Hire talent" },
              { key: "admin", icon: "🛡️", title: "Admin", sub: "Manage" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={`login-role-btn ${loginRole === item.key ? "active" : ""}`}
                onClick={() => {
                  setLoginRole(item.key);
                  setErrors({});
                }}
              >
                <span className="login-role-icon">{item.icon}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.sub}</small>
                </span>
              </button>
            ))}
          </div>

          {/* Feedback Messages */}
          {successMessage && (
            <div className="alert-box success">
              <span>✅</span> {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="alert-box error">
              <span>❌</span> {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-3d-form">
            {/* Email Field */}
            <div className="input-group-3d">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "has-error" : ""}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="input-group-3d">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "has-error" : ""}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Link */}
            <div className="form-meta-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span className="custom-checkmark"></span>
                <span className="label-text">Remember me</span>
              </label>

              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-login-3d" disabled={loading}>
              {loading ? (
                <span className="btn-spinner-wrap">
                  <span className="spinner-dot"></span> Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="card-footer-3d">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="register-link">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-3d-wrapper {
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

        /* HD Overlay Background Image */
        .bg-image-overlay {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          opacity: 0.12;
          filter: blur(5px);
          z-index: 0;
        }

        /* Ambient Glowing 3D Orbs */
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

        .login-3d-container {
          position: relative;
          z-index: 2;
          padding: 20px;
          width: 100%;
          max-width: 420px; /* Medium compact size */
        }

        /* Glassmorphism 3D Card */
        .login-3d-card {
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

        .login-header {
          text-align: center;
          margin-bottom: 22px;
        }

        .login-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }

        .login-header p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 600;
        }

        /* Portal role selector */
        .login-role-selector {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          margin: 0 0 18px;
          padding: 5px;
          border-radius: 14px;
          background: rgba(11, 15, 25, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .login-role-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          padding: 8px 10px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .login-role-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
        }

        .login-role-btn.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(99,102,241,.35), rgba(168,85,247,.28));
          border-color: rgba(129,140,248,.6);
          box-shadow: 0 4px 14px rgba(99,102,241,.2);
        }

        .login-role-icon { font-size: 16px; flex: 0 0 auto; }
        .login-role-btn strong { display:block; font-size:12px; font-weight: 800; }
        .login-role-btn small { display:block; margin-top:1px; font-size:10px; color:#94a3b8; font-weight: 600; }
        .login-role-btn.active small { color:#c4b5fd; }

        /* Alerts */
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

        /* Inputs */
        .input-group-3d {
          margin-bottom: 16px;
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
          padding: 12px 40px 12px 42px;
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

        .eye-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .eye-toggle-btn:hover {
          opacity: 1;
        }

        .error-text {
          font-size: 11.5px;
          color: #f87171;
          margin-top: 4px;
          display: block;
          font-weight: 700;
        }

        /* Meta Options Row */
        .form-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          font-size: 12.5px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #94a3b8;
          font-weight: 600;
          user-select: none;
        }

        .checkbox-container input {
          display: none;
        }

        .custom-checkmark {
          width: 16px;
          height: 16px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          background: rgba(15, 23, 42, 0.5);
          position: relative;
          transition: all 0.2s;
        }

        .checkbox-container input:checked ~ .custom-checkmark {
          background: #6366f1;
          border-color: #6366f1;
        }

        .custom-checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 4px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-container input:checked ~ .custom-checkmark:after {
          display: block;
        }

        .forgot-link {
          color: #a855f7;
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #c084fc;
          text-decoration: underline;
        }

        /* 3D Button */
        .btn-login-3d {
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

        .btn-login-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(99, 102, 241, 0.5);
        }

        .btn-login-3d:disabled {
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

        /* Footer */
        .card-footer-3d {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: #94a3b8;
          font-weight: 600;
        }

        .register-link {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 800;
        }

        .register-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-3d-card {
            padding: 26px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;