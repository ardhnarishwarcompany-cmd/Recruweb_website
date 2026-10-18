import { Link } from "react-router-dom";
import ScrollIndicator from "../../components/ScrollIndicator";

const TermsAndConditions = () => {
  return (
    <div className="terms-page-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="tc-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="tc-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '70px 0 85px', display: 'flex', justifyContent: 'center' }}>
        <div className="terms-card-3d">
          <div className="card-bg-light-glow"></div>
          
          <div className="terms-header" style={{ position: 'relative', zIndex: 2 }}>
            <img
              src="/images/logo.png"
              alt="Recruweb Logo"
              className="terms-logo"
            />
            <h1>Terms &amp; Conditions and Privacy Policy</h1>
            <p>Last updated: August 2026</p>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By creating an account, registering as a candidate or client, or
                otherwise using the Recruweb website and services ("Services"), you
                agree to be bound by these Terms &amp; Conditions and our Privacy
                Policy. If you do not agree with any part of these terms, please do
                not use our Services.
              </p>
            </section>

            <section>
              <h2>2. Who Can Use Recruweb</h2>
              <p>
                Recruweb's Services are available to individuals seeking employment
                opportunities ("Candidates") and companies seeking to hire talent
                ("Clients"). You must provide accurate, current, and complete
                information when registering, and you are responsible for keeping
                your login credentials confidential.
              </p>
            </section>

            <section>
              <h2>3. Account Registration &amp; Security</h2>
              <p>
                You are responsible for all activity that occurs under your account.
                Passwords must be kept confidential and not shared with anyone. If
                you believe your account has been compromised, notify us
                immediately. Recruweb may suspend or terminate accounts that violate
                these terms.
              </p>
            </section>

            <section>
              <h2>4. Candidate Data &amp; Applications</h2>
              <p>
                Candidates who submit resumes, applications, or profile details
                authorize Recruweb to share relevant information with prospective
                employer Clients for the purpose of recruitment and hiring.
                Candidates may request removal of their data at any time by
                contacting our support team.
              </p>
            </section>

            <section>
              <h2>5. Client Obligations</h2>
              <p>
                Clients agree to use candidate information solely for legitimate
                hiring purposes, to comply with applicable employment and
                data-protection laws, and not to misuse, resell, or share candidate
                data with third parties without consent.
              </p>
            </section>

            <section>
              <h2>6. Privacy Policy — Information We Collect</h2>
              <p>
                We collect information you provide directly (name, email, phone
                number, resume, company details) as well as usage data (pages
                visited, actions taken) to operate and improve the Services. We do
                not sell personal information to third parties.
              </p>
            </section>

            <section>
              <h2>7. How We Use Your Information</h2>
              <p>
                Your information is used to: create and manage your account; match
                candidates with relevant job opportunities; enable communication
                between candidates and clients; send service-related emails (such as
                password reset and verification links); and improve platform
                security and performance.
              </p>
            </section>

            <section>
              <h2>8. Data Retention &amp; Security</h2>
              <p>
                We retain account and application data for as long as your account
                is active or as needed to provide the Services. Passwords are stored
                using industry-standard hashing and are never stored or transmitted
                in plain text. We take reasonable technical and organizational
                measures to protect your data against unauthorized access.
              </p>
            </section>

            <section>
              <h2>9. Cookies</h2>
              <p>
                Recruweb may use cookies and similar technologies to keep you logged
                in, remember your preferences, and understand how the Services are
                used.
              </p>
            </section>

            <section>
              <h2>10. HRMS, SaaS &amp; Commercial Services</h2>
              <p>
                Recruweb may provide HRMS, AI attendance, AI interview, employee
                verification, payroll support, compliance automation, workforce
                analytics and related SaaS services. Subscription, recruitment,
                token, replacement, agreement-duration and payment obligations are
                governed by the selected commercial plan or signed agreement.
                Applicable prices are subject to GST and statutory taxes.
              </p>
            </section>

            <section>
              <h2>11. AI Interviews &amp; Proctoring</h2>
              <p>
                AI interview scores and recommendations are advisory assessment
                outputs. Browser-based proctoring may record events such as
                fullscreen exit, tab switching, camera or microphone interruption,
                screen-sharing interruption and supported face-detection events.
                Authorized hiring reviewers make the final hiring decision.
              </p>
            </section>

            <section>
              <h2>12. Compliance &amp; Responsible Use</h2>
              <p>
                Users must use Recruweb for lawful recruitment, HR and workforce
                purposes, provide accurate information, respect confidentiality,
                follow applicable employment and data-protection requirements, and
                avoid misuse of candidate, employee, client or company information.
              </p>
            </section>

            <section>
              <h2>13. Payments, Replacement &amp; Agreement Terms</h2>
              <p>
                Applicable recruitment invoices, subscriptions, token amounts,
                replacement coverage and agreement periods follow the commercial
                plan selected by the client. Recruitment invoices are payable
                according to the published commercial terms and subscription
                invoices are generally payable in advance unless otherwise agreed.
              </p>
            </section>

            <section>
              <h2>14. Changes to These Terms</h2>
              <p>
                We may update these Terms &amp; Conditions and Privacy Policy from
                time to time. Continued use of the Services after changes are posted
                constitutes your acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2>15. Contact Us</h2>
              <p>
                If you have questions about these Terms &amp; Conditions or our
                Privacy Policy, please reach out via our{" "}
                <Link to="/contact" className="terms-link">
                  Contact page
                </Link>
                .
              </p>
            </section>
          </div>

          <div className="terms-footer" style={{ position: 'relative', zIndex: 2 }}>
            <Link to="/register" className="terms-back-link">
              ← Back to Registration
            </Link>
          </div>
          <div className="card-glow-bar"></div>
        </div>
      </div>

      <style>{`
        .terms-page-wrapper-light {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow-x: hidden;
        }

        .container {
          max-width: 1150px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Particles Background */
        .tc-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .tc-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatTcParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatTcParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .terms-card-3d {
          max-width: 820px;
          width: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border-radius: 24px;
          padding: 50px 44px;
          box-shadow: 0 10px 35px rgba(15, 23, 42, 0.04);
          border: 1.5px solid #cbd5e1;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .terms-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .terms-logo {
          height: 48px;
          margin-bottom: 16px;
          object-fit: contain;
        }

        .terms-header h1 {
          color: #0f172a;
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .terms-header p {
          color: #64748b;
          font-size: 13.5px;
          margin: 0;
          font-weight: 700;
        }

        .terms-card-3d section {
          margin-bottom: 28px;
        }

        .terms-card-3d h2 {
          color: #1e293b;
          font-size: 17px;
          font-weight: 800;
          margin: 0 0 10px;
        }

        .terms-card-3d p {
          font-size: 14.5px;
          line-height: 1.7;
          margin: 0;
          color: #475569;
          font-weight: 600;
        }

        .terms-link {
          color: #4f46e5;
          font-weight: 800;
          text-decoration: none;
        }

        .terms-link:hover {
          text-decoration: underline;
        }

        .terms-footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1.5px solid #e2e8f0;
        }

        .terms-back-link {
          color: #4f46e5;
          font-weight: 800;
          font-size: 14.5px;
          text-decoration: none;
        }

        .terms-back-link:hover {
          text-decoration: underline;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .terms-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        @media (max-width: 600px) {
          .terms-card-3d {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default TermsAndConditions;