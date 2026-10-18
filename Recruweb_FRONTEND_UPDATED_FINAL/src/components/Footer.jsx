import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

// ---- Social media links: yahin apne real profile URLs daalo ----
const SOCIAL_LINKS = [
  {
    key: "x",
    label: "X (Twitter)",
    url: "https://x.com/RecruwebLtd",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/recruweb/",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/share/16EtyDXnREi/",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.2-2.4-.2-2.5 0-4.1 1.5-4.1 4.2v2.7H7.5v3.3h2.9V22h3.1z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/recruweb_resources_/",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    url: "https://youtube.com/@recruweb",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
      </svg>
    ),
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) return;

    try {
      const response = await api.subscribers.subscribe(email);
      setMessage(response.success ? response.message : response.message);
      if (response.success) setEmail("");
    } catch (error) {
      setMessage("Failed to subscribe. Please try again.");
    }
  };

  return (
    <footer className="ultra-creative-footer">
      {/* Floating CTA Banner */}
      <div className="footer-cta-container"></div>

      <div className="footer-content-wrapper">
        <div className="footer-grid-container">
          {/* Brand Info Column */}
          <div className="footer-col brand-col">
            <Link to="/" className="brand-logo-badge">
              <img
                src="/images/RW_LOGO_Black_page-0001-removebg-preview.png"
                alt="Recruweb Logo"
                className="footer-logo-img"
              />
            </Link>
            <p className="brand-tagline">
              Transforming businesses through innovative HR solutions, talent
              acquisition, and workforce management across India.
            </p>

            {/* Quick Contact Links */}
            <div className="contact-info-list">
              <a className="contact-info-item" href="tel:+919336532636" aria-label="Call Recruweb">
                <span className="contact-icon-badge">📞</span>
                <span className="contact-text"><small>Call us</small>+91 9336532636</span>
              </a>
              <a className="contact-info-item" href="mailto:info@recruweb.com" aria-label="Email Recruweb">
                <span className="contact-icon-badge">✉</span>
                <span className="contact-text"><small>Email us</small>info@recruweb.com</span>
              </a>
              <a className="contact-info-item" href="https://www.google.com/maps/search/?api=1&query=H-112%2C+Sector+63%2C+Noida%2C+Uttar+Pradesh" target="_blank" rel="noreferrer" aria-label="Open Recruweb address in maps">
                <span className="contact-icon-badge">📍</span>
                <span className="contact-text"><small>Visit us</small>H-112, Sector 63, Noida</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="social-icons-wrapper">
              {SOCIAL_LINKS.map(({ key, label, url, icon }) => (
                <a
                  key={key}
                  href={url || "#"}
                  target={url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="social-icon-btn"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Services */}
          <div className="footer-col">
            <h4 className="footer-heading">Our Services</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/services">Talent Acquisition</Link>
              </li>
              <li>
                <Link to="/services">Payroll Management</Link>
              </li>
              <li>
                <Link to="/services">HRMS Solutions</Link>
              </li>
              <li>
                <Link to="/services">Training & Dev</Link>
              </li>
              <li>
                <Link to="/services">HR Outsourcing</Link>
              </li>
              <li>
                <Link to="/industry">Industry Manpower</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-col">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/companies">Our Clients</Link>
              </li>
              <li>
                <Link to="/how-it-works">How It Works</Link>
              </li>
              <li>
                <Link to="/contact">Contact Support</Link>
              </li>
              <li>
                <Link to="/testimonials">Testimonials</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Useful Tools */}
          <div className="footer-col">
            <h4 className="footer-heading">AI Tools</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/jd-maker">JD Maker</Link>
              </li>
              <li>
                <Link to="/cv-maker">CV Maker</Link>
              </li>
              <li>
                <Link to="/cv-screen">AI CV Screening</Link>
              </li>
              <li>
                <Link to="/schedule-interview">Schedule Interview</Link>
              </li>
              <li>
                <Link to="/resource-center">Resource Center</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">Newsletter</h4>
            <p className="newsletter-desc">
              Subscribe for the latest hiring trends and HR insights.
            </p>

            <form
              className="creative-subscribe-form"
              onSubmit={handleSubscribe}
            >
              <div className="subscribe-input-box">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Join</button>
              </div>
            </form>
            {message && (
              <p
                className={`subscription-msg ${message.includes("Failed") ? "error" : "success"}`}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-line">
          <p>
            © {new Date().getFullYear()} Recruweb Resources Pvt. Ltd. All rights
            reserved.
          </p>
          <div className="legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="dot">•</span>
            <Link to="/terms">Terms of Service</Link>
            <span className="dot">•</span>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>

      <style>{`
        /* Rich Deep Gradient Background Matching Header Palette */
        .ultra-creative-footer {
          background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          border-top: 1px solid rgba(139, 92, 246, 0.2);
          color: #f1f5f9;
          position: relative;
          padding-top: 80px;
          margin-top: 90px;
        }

        /* Floating CTA Banner with Soft Violet Glow */
        .footer-cta-container {
          max-width: 1200px;
          margin: 0 auto;
          position: absolute;
          top: -55px;
          left: 20px;
          right: 20px;
          z-index: 10;
        }

        .cta-glass-card {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
          border-radius: 20px;
          padding: 28px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.35);
          gap: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cta-content h3 {
          margin: 0 0 4px 0;
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.3px;
        }

        .cta-content p {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.95);
        }

        .cta-buttons {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .cta-btn-glow {
          background: #ffffff;
          color: #4f46e5;
          padding: 11px 22px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 13.5px;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }

        .cta-btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        .cta-btn-outline {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 11px 22px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 13.5px;
          text-decoration: none;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: background 0.2s;
        }

        .cta-btn-outline:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Footer Main Layout */
        .footer-content-wrapper {
          max-width: 1320px;
          margin: 0 auto;
          padding: 40px 24px 24px;
        }

        .footer-grid-container {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr 1fr 1.8fr;
          gap: 32px;
          padding-bottom: 36px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brand-logo-badge {
          display: inline-block;
          background: #ffffff;
          padding: 6px 14px;
          border-radius: 12px;
          margin-bottom: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .footer-logo-img {
          height: 38px;
          width: auto;
          display: block;
        }

        .brand-tagline {
          font-size: 13.5px;
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 18px;
        }

        .contact-info-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 18px;
        }

        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #e2e8f0;
          font-weight: 500;
        }

        .contact-icon-badge {
          font-size: 14px;
        }

        .social-icons-wrapper {
          display: flex;
          gap: 10px;
        }

        .social-icon-btn {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .social-icon-btn:hover {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #ffffff;
          border-color: transparent;
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        }

        /* Headings & Links */
        .footer-heading {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 16px 0;
          position: relative;
        }

        .footer-heading::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -5px;
          width: 22px;
          height: 2px;
          background: #a855f7;
          border-radius: 2px;
        }

        .footer-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-link-list a {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .footer-link-list a:hover {
          color: #c084fc;
          padding-left: 4px;
        }

        /* Newsletter Section */
        .newsletter-desc {
          font-size: 13px;
          color: #cbd5e1;
          line-height: 1.5;
          margin-bottom: 14px;
        }

        .creative-subscribe-form .subscribe-input-box {
          display: flex;
          background: rgba(255, 255, 255, 0.08);
          padding: 4px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
        }

        .creative-subscribe-form input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 14px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
        }

        .creative-subscribe-form input::placeholder {
          color: #94a3b8;
        }

        .creative-subscribe-form button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 24px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }

        .creative-subscribe-form button:hover {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          transform: scale(1.03);
        }

        .subscription-msg {
          font-size: 12px;
          margin-top: 8px;
        }
        .subscription-msg.error { color: #f87171; }
        .subscription-msg.success { color: #34d399; }

        /* Bottom Footer Bar */
        .footer-bottom-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
          font-size: 12.5px;
          color: #94a3b8;
          font-weight: 500;
        }

        .legal-links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .legal-links a {
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.2s;
        }

        .legal-links a:hover {
          color: #ffffff;
        }

        .dot {
          color: #475569;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .footer-grid-container {
            grid-template-columns: 1fr 1fr 1fr;
          }
          .brand-col {
            grid-column: span 3;
          }
          .newsletter-col {
            grid-column: span 3;
          }
        }

        @media (max-width: 768px) {
          .cta-glass-card {
            flex-direction: column;
            text-align: center;
          }
          .footer-grid-container {
            grid-template-columns: 1fr;
          }
          .brand-col, .newsletter-col {
            grid-column: span 1;
          }
          .footer-bottom-line {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }


        /* ===== PREMIUM FOOTER UPGRADE ===== */
        .ultra-creative-footer {
          isolation: isolate;
          background:
            radial-gradient(circle at 8% 10%, rgba(14, 165, 233, .16), transparent 30%),
            radial-gradient(circle at 88% 12%, rgba(139, 92, 246, .18), transparent 32%),
            linear-gradient(135deg, #0a1220 0%, #111827 48%, #211b45 100%);
          padding-top: 70px;
          margin-top: 70px;
          border-top: 1px solid rgba(125, 211, 252, .18);
        }
        .ultra-creative-footer::before {
          content:""; position:absolute; inset:0; z-index:-1; opacity:.35; pointer-events:none;
          background-image: linear-gradient(rgba(148,163,184,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.07) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }
        .footer-content-wrapper { max-width: 1380px; padding: 48px 32px 24px; }
        .footer-grid-container { gap: 26px; padding: 34px; border: 1px solid rgba(255,255,255,.09); border-radius: 28px; background: linear-gradient(135deg, rgba(255,255,255,.055), rgba(255,255,255,.018)); box-shadow: 0 24px 70px rgba(0,0,0,.24); backdrop-filter: blur(16px); }
        .brand-logo-badge { padding: 10px 20px; border-radius: 16px; box-shadow: 0 12px 30px rgba(56,189,248,.14), inset 0 1px 0 rgba(255,255,255,.7); transition: .35s ease; }
        .brand-logo-badge:hover { transform: translateY(-4px) rotate(-1deg); box-shadow: 0 18px 38px rgba(99,102,241,.28); }
        .brand-tagline { max-width: 310px; font-size: 14px; color: #b8c4d6; }
        .contact-info-list { gap: 9px; }
        .contact-info-item { text-decoration:none; color:#dbeafe; padding: 9px 10px; margin-left:-10px; border-radius: 14px; transition: all .25s ease; }
        .contact-info-item:hover { background: linear-gradient(90deg, rgba(56,189,248,.12), rgba(139,92,246,.10)); transform: translateX(4px); }
        .contact-icon-badge { width: 34px; height:34px; display:grid; place-items:center; border-radius: 11px; background: linear-gradient(135deg, rgba(56,189,248,.18), rgba(139,92,246,.2)); border:1px solid rgba(125,211,252,.18); box-shadow: inset 0 1px 0 rgba(255,255,255,.1); }
        .contact-text { display:flex; flex-direction:column; gap:2px; font-size:13px; }
        .contact-text small { color:#8190a7; font-size:10px; letter-spacing:.04em; }
        .social-icons-wrapper { margin-top: 22px; gap: 11px; }
        .social-icon-btn { width:42px; height:42px; border-radius:14px; background:rgba(255,255,255,.055); }
        .social-icon-btn:hover { transform: translateY(-5px) scale(1.05); }
        .footer-heading { font-size: 15px; letter-spacing:.01em; margin-bottom:22px; }
        .footer-heading::after { width:34px; height:3px; background:linear-gradient(90deg,#38bdf8,#8b5cf6); box-shadow:0 0 14px rgba(56,189,248,.45); }
        .footer-link-list { gap: 12px; }
        .footer-link-list a { position:relative; color:#b9c5d7; }
        .footer-link-list a::before { content:'›'; color:#7dd3fc; opacity:0; margin-right:0; transition:.2s; }
        .footer-link-list a:hover { color:#fff; padding-left:6px; }
        .footer-link-list a:hover::before { opacity:1; margin-right:6px; }
        .newsletter-col { padding: 20px; margin: -8px 0; border-radius:20px; background:linear-gradient(135deg, rgba(99,102,241,.11), rgba(56,189,248,.06)); border:1px solid rgba(255,255,255,.09); }
        .newsletter-desc { color:#b8c4d6; }
        .creative-subscribe-form .subscribe-input-box { padding:5px; border-color:rgba(125,211,252,.24); box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.12); }
        .creative-subscribe-form button { padding:10px 22px; box-shadow:0 8px 20px rgba(99,102,241,.35); }
        .footer-bottom-line { margin-top: 20px; padding: 24px 10px 0; }
        .legal-links a:hover { color:#7dd3fc; }
        @media (max-width: 1024px) { .footer-grid-container{padding:26px; gap:26px;} }
        @media (max-width: 768px) { .footer-content-wrapper{padding:36px 16px 20px;} .footer-grid-container{padding:24px 20px; border-radius:22px;} .newsletter-col{margin:0;} }
      `}</style>
    </footer>
  );
};

export default Footer;