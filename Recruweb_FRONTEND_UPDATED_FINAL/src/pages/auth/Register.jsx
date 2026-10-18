import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";

const Register = () => {
  const [role, setRole] = useState("candidate"); // 'candidate' or 'client'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const cardRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (role === "client" && !formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms";
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

    if (role === "admin") {
      setErrors({
        submit:
          "Admin accounts cannot be self-registered. Ask an existing Admin/Super Admin to create your account.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role,
          companyName: role === "client" ? formData.companyName : undefined,
          phone: formData.phone,
        }),
      });

      const body = await response.json();

      if (response.ok && body.success) {
        const user = body.data.user;
        const token = body.data.accessToken || body.data.token;
        const refreshToken = body.data.refreshToken;

        login(user, token, refreshToken);

        setSuccessMessage("Registration successful! Redirecting...");

        setTimeout(() => {
          if (user.role === "client") {
            navigate("/client/dashboard");
          } else if (user.role === "hr_partner") {
            navigate("/hr-partner/dashboard");
          } else {
            navigate("/candidate/dashboard");
          }
        }, 1000);
      } else {
        setErrors({ submit: body.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-3d-wrapper">
      {/* Background HD Image Overlay & Ambient Orbs */}
      <div className="bg-image-overlay"></div>
      <div className="ambient-sphere sphere-1"></div>
      <div className="ambient-sphere sphere-2"></div>
      <div className="ambient-sphere sphere-3"></div>

      <div className="register-3d-container">
        <div
          className="register-3d-card"
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

          <div className="register-header">
            <h2>Create Your Account</h2>
            <p>Join Recruweb & start your hiring journey</p>
          </div>

          {/* Role Tabs */}
          <div className="role-selector-3d">
            <button
              type="button"
              className={`role-btn-3d ${role === "candidate" ? "active" : ""}`}
              onClick={() => {
                setRole("candidate");
                setErrors({});
              }}
            >
              <span className="role-icon">👤</span>
              <div className="role-text">
                <strong>Candidate</strong>
                <small>Find jobs</small>
              </div>
            </button>

            <button
              type="button"
              className={`role-btn-3d ${role === "client" ? "active" : ""}`}
              onClick={() => {
                setRole("client");
                setErrors({});
              }}
            >
              <span className="role-icon">🏢</span>
              <div className="role-text">
                <strong>Client</strong>
                <small>Hire talent</small>
              </div>
            </button>

            <button
              type="button"
              className={`role-btn-3d ${role === "hr_partner" ? "active" : ""}`}
              onClick={() => {
                setRole("hr_partner");
                setErrors({});
              }}
            >
              <span className="role-icon">🤝</span>
              <div className="role-text">
                <strong>HR Partner</strong>
                <small>Source</small>
              </div>
            </button>
          </div>

          {/* Alerts */}
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

          <form onSubmit={handleSubmit} className="register-3d-form">
            {/* Full Name */}
            <div className="input-group-3d">
              <label htmlFor="name">Full Name *</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "has-error" : ""}
                />
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Email Field */}
            <div className="input-group-3d">
              <label htmlFor="email">Email Address *</label>
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
                />
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Company Name (For Client Role Only) */}
            {role === "client" && (
              <div className="input-group-3d">
                <label htmlFor="companyName">Company Name *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🏢</span>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    placeholder="Recruweb Private Limited"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={errors.companyName ? "has-error" : ""}
                  />
                </div>
                {errors.companyName && (
                  <span className="error-text">{errors.companyName}</span>
                )}
              </div>
            )}

            {/* Phone Number */}
            <div className="input-group-3d">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon">📞</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group-3d">
              <label htmlFor="password">Password *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "has-error" : ""}
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

            {/* Confirm Password */}
            <div className="input-group-3d">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="input-wrapper">
                <span className="input-icon">🛡️</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? "has-error" : ""}
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? "👁️" : "🙈"}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="terms-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  required
                />
                <span className="custom-checkmark"></span>
                <span className="label-text">
                  I agree to the{" "}
                  <Link
                    to="/terms-and-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-link"
                  >
                    Terms &amp; Conditions and Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeTerms && (
                <span className="error-text block-err">
                  {errors.agreeTerms}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-register-3d"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner-wrap">
                  <span className="spinner-dot"></span> Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="card-footer-3d">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="login-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .register-3d-wrapper {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07090e;
          overflow: hidden;
          font-family: var(--font-body);
          padding: 40px 0;
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

        /* Ambient Glowing Orbs */
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

        .register-3d-container {
          position: relative;
          z-index: 2;
          padding: 20px;
          width: 100%;
          max-width: 440px; /* Medium compact size */
        }

        /* Glassmorphism Card */
        .register-3d-card {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 30px 26px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: transform 0.15s ease-out;
          transform-style: preserve-3d;
        }

        .card-brand {
          text-align: center;
          margin-bottom: 12px;
        }

        .brand-logo-3d {
          height: 40px;
          object-fit: contain;
          filter: drop-shadow(0 3px 10px rgba(255, 255, 255, 0.25));
        }

        .register-header {
          text-align: center;
          margin-bottom: 18px;
        }

        .register-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }

        .register-header p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 600;
        }

        /* Role Selector Tabs */
        .role-selector-3d {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          margin-bottom: 18px;
          background: rgba(11, 15, 25, 0.8);
          padding: 5px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .role-btn-3d {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 6px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 10px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
        }

        .role-btn-3d.active {
          background: linear-gradient(135deg, rgba(99,102,241,.35), rgba(168,85,247,.28));
          border-color: rgba(129,140,248,.6);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.2);
        }

        .role-icon {
          font-size: 16px;
          flex: 0 0 auto;
        }

        .role-text strong {
          display: block;
          font-size: 11px;
          font-weight: 800;
        }

        .role-text small {
          display: block;
          font-size: 9.5px;
          color: #94a3b8;
          font-weight: 600;
        }

        .role-btn-3d.active small {
          color: #c4b5fd;
        }

        /* Alert Boxes */
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
          margin-bottom: 14px;
        }

        .input-group-3d label {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 5px;
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
          padding: 11px 40px 11px 42px;
          background: rgba(11, 15, 25, 0.75);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          color: #ffffff;
          font-size: 13.5px;
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

        /* Terms Checkbox */
        .terms-row {
          margin-bottom: 18px;
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          color: #94a3b8;
          font-size: 12.5px;
          user-select: none;
        }

        .checkbox-container input {
          display: none;
        }

        .label-text {
          line-height: 1.4;
          padding-top: 1px;
          font-weight: 600;
        }

        .custom-checkmark {
          width: 16px;
          height: 16px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          background: rgba(15, 23, 42, 0.5);
          position: relative;
          flex-shrink: 0;
          margin-top: 1px;
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

        .inline-link {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 700;
        }

        .inline-link:hover {
          text-decoration: underline;
        }

        .block-err {
          margin-top: 4px;
        }

        /* Submit Button */
        .btn-register-3d {
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

        .btn-register-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(99, 102, 241, 0.5);
        }

        .btn-register-3d:disabled {
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
          margin-top: 16px;
          font-size: 12.5px;
          color: #94a3b8;
          font-weight: 600;
        }

        .login-link {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 800;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .register-3d-card {
            padding: 24px 18px;
          }
          .role-selector-3d {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;