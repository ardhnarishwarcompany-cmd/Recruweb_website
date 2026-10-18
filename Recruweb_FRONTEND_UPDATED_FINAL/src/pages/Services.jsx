import ScrollIndicator from "../components/ScrollIndicator";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      icon: (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M2 20h20" />
          <path d="M5 20v-8l7-6 7 6v8" />
          <path d="M9 20v-4h6v4" />
        </svg>
      ),
      title: "1. Industry Manpower",
      description:
        "Skilled and unskilled workforce for manufacturing, construction, and industrial sectors across India.",
      features: [
        "Factory Workers",
        "Machine Operators",
        "Technicians",
        "Supervisors",
        "Industrial Staff",
      ],
    },
    {
      icon: (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
      title: "2. Facility Management",
      description:
        "Complete facility management services with HRMS - all requirements met within a week.",
      features: [
        "Housekeeping Staff",
        "Security Personnel",
        "Maintenance Team",
        "Pantry & Admin Staff",
        "Support Services",
      ],
    },
    {
      icon: (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "3. HR Outsourcing",
      description:
        "Full HR outsourcing solution with HRMS - all manpower, payroll & management within a week.",
      features: [
        "Payroll Management",
        "Compliance Handling",
        "Employee Management",
        "Statutory Compliance",
        "HR Administration",
      ],
    },
    {
      icon: (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      title: "4. Only Recruitment",
      description:
        "Dedicated recruitment services with HRMS support - workforce requirements within a week.",
      features: [
        "Job Analysis",
        "Candidate Sourcing",
        "Screening & Interviews",
        "Final Selection",
        "Joining Support",
      ],
    },
    {
      icon: (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
      title: "5. Hospitality Staffing",
      description:
        "Specialized hospitality workforce with HRMS - all management needs within a week.",
      features: [
        "Hotel Staff",
        "Restaurant Crew",
        "Event Support",
        "Guest Services",
        "Catering Staff",
      ],
    },
    {
      icon: (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      title: "6. Contractual Hiring",
      description:
        "Temporary and contractual employees for project-based requirements across India.",
      features: [
        "Project-Based Staff",
        "Seasonal Workers",
        "Temporary Assignments",
        "Flexible Duration",
        "Renewable Contracts",
      ],
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" />
        </svg>
      ),
      title: "7. Remote Workforce Service",
      description:
        "Flexible remote staffing for Indian and global talent, aligned to role, location, availability and approved client budget.",
      features: [
        "Remote Hiring & Staffing",
        "Indian & Global Talent",
        "Budget-Led Sourcing",
        "Remote Onboarding",
        "Workforce Coordination",
      ],
    },
    {
      icon: (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      ),
      title: "8. Post a Job",
      description:
        "Quick and easy job posting platform to connect with thousands of qualified candidates.",
      features: [
        "Easy Job Creation",
        "Wide Candidate Reach",
        "Application Tracking",
        "Resume Screening",
        "Direct Candidate Contact",
      ],
    },
  ];

  const whyChooseUs = [
    {
      icon: "🎯",
      title: "Pan India Coverage",
      desc: "Manpower supply to all companies across India",
    },
    {
      icon: "⚡",
      title: "Within 1 Week",
      desc: "All requirements fulfilled within a week",
    },
    {
      icon: "💰",
      title: "Complete HRMS",
      desc: "All-in-one solution for all management needs",
    },
    {
      icon: "🏭",
      title: "Industry Expertise",
      desc: "Deep knowledge across multiple sectors",
    },
    {
      icon: "📊",
      title: "Payroll Management",
      desc: "Complete payroll processing included",
    },
    {
      icon: "✅",
      title: "100% Compliance",
      desc: "Full statutory compliance guaranteed",
    },
  ];

  const quickActions = [
    { title: "JD Maker", desc: "Create job descriptions", icon: "📝", path: "/jd-maker" },
    { title: "CV Maker", desc: "Create professional resumes", icon: "📄", path: "/cv-maker" },
    { title: "CV Screening", desc: "AI-powered resume screening", icon: "🤖", path: "/cv-screen" },
    { title: "AI Interview Scheduler", desc: "Smart interview booking", icon: "📅", path: "/schedule-interview" },
    { title: "Find Jobs", desc: "Search and apply for jobs", icon: "🔍", path: "/jobs" },
    { title: "Companies", desc: "Explore hiring companies", icon: "🏢", path: "/companies" },
    { title: "Proposal Studio", desc: "Generate client-ready proposals + PDF", icon: "📑", path: "/proposal" },
    { title: "Request Quote", desc: "Get custom pricing", icon: "💬", path: "/contact?service=industry" },
    { title: "Employee Joining", desc: "Complete joining formalities", icon: "📋", path: "/joining-form" },
  ];

  return (
    <div className="services-page-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="services-particles-container">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="services-particle"
            style={{
              left: `${(i * 5.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 6}s`,
              animationDuration: `${10 + (i % 8)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hero Section with Light Theme */}
      <section className="services-hero-section-light">
        <div className="container">
          <div className="services-hero-header">
            <div className="services-badge">
              <span className="services-badge-dot"></span>
              <span>Our HR Offerings</span>
            </div>
            <h1 className="services-hero-title">
              All-in-One HR &{" "}
              <span className="gradient-text">Manpower Solutions</span>
            </h1>
            <p className="services-hero-subtitle">
              We provide manpower to companies all over India. Our comprehensive
              HRMS solution ensures all types of manpower, payroll, and
              management requirements are met within a week.
            </p>
            <div className="hero-action-buttons">
              <Link to="/contact" className="btn-hero-primary">
                Get Started Now
              </Link>
              <Link to="/post-job" className="btn-hero-secondary">
                Post a Job
              </Link>
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Services Grid Section with 3D Effects */}
      <section className="services-main-section">
        <div className="services-bg-glow"></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="services-header-text">
            <div className="services-badge-light">
              <span className="services-badge-dot"></span>
              <span>Complete Coverage</span>
            </div>
            <h2>Complete HR & Manpower Solutions</h2>
            <p>
              All requirements fulfilled within a week with our integrated HRMS
              platform
            </p>
          </div>

          <div className="services-cards-grid-3d">
            {services.map((service, index) => (
              <div key={index} className="modern-service-card-3d">
                <div className="card-bg-glow"></div>
                <div className="card-top-icon">
                  <div className="icon-box-glow">{service.icon}</div>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>

                <div className="features-divider"></div>

                <ul className="service-features-list">
                  {service.features.map((feature, i) => (
                    <li key={i}>
                      <span className="check-mark">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="card-hover-link-3d"
                >
                  <span>Inquire Now</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <div className="card-glow-bar"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Remote Staffing — client budget aware */}
      <section id="remote-workforce" className="remote-staffing-pro-section">
        <div className="remote-staffing-grid-bg"></div>
        <div className="container remote-staffing-pro-inner">
          <div className="remote-staffing-copy">
            <div className="services-badge-light"><span className="services-badge-dot"></span><span>Global Workforce</span></div>
            <h2>Remote staffing, <span className="gradient-text">within your budget.</span></h2>
            <p>Recruweb helps companies build flexible remote teams with Indian and international talent. We align sourcing to the role, skills, location, availability and the client/company budget.</p>
            <div className="remote-staffing-points">
              <div><span>01</span><b>Indian talent</b><small>Cost-effective remote hiring across technology, operations, sales and support.</small></div>
              <div><span>02</span><b>Global talent</b><small>Out-of-India sourcing for specialized or location-specific requirements.</small></div>
              <div><span>03</span><b>Budget-led sourcing</b><small>Shortlists are shaped around the approved compensation and engagement budget.</small></div>
            </div>
            <div className="remote-staffing-actions"><Link to="/proposal" className="btn-hero-primary">Build Staffing Proposal →</Link><Link to="/contact?service=Remote%20Staffing" className="btn-hero-secondary">Discuss Requirement</Link></div>
          </div>
          <div className="remote-staffing-visual">
            <div className="remote-globe"><div className="globe-ring ring-a"></div><div className="globe-ring ring-b"></div><div className="globe-core">🌐</div><span className="node node-1">IN</span><span className="node node-2">UK</span><span className="node node-3">US</span><span className="node node-4">EU</span></div>
            <div className="budget-float"><span>CLIENT BUDGET</span><strong>Flexible</strong><small>Role + location aligned</small></div>
            <div className="talent-float"><span className="live-dot"></span> GLOBAL TALENT MATCHING <b>24/7</b></div>
          </div>
        </div>
      </section>

      {/* Upgraded 3D Interactive "Why Choose Recruweb?" Section */}
      <section className="why-us-section-pro">
        <div className="why-bg-glow"></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="services-header-text">
            <div className="services-badge-light">
              <span className="services-badge-dot"></span>
              <span>Our Strength</span>
            </div>
            <h2>Why Choose Recruweb?</h2>
            <p>
              We are committed to delivering excellence in every aspect of HR
              services
            </p>
          </div>

          <div className="why-us-grid-3d">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="why-3d-card">
                <div className="why-card-glow"></div>
                <div className="why-card-icon-box">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
                <div className="card-glow-bar"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgraded 3D Interactive "AI Tools & Quick Actions" Section */}
      <section className="quick-actions-section-pro">
        <div className="quick-bg-glow"></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="services-header-text">
            <div className="services-badge-light">
              <span className="services-badge-dot"></span>
              <span>Smart Suite</span>
            </div>
            <h2>AI Tools & Quick Actions</h2>
            <p>
              Leverage advanced tools and instant workflows for your daily HR tasks
            </p>
          </div>

          <div className="quick-actions-grid-3d">
            {quickActions.map((action, index) => (
              <Link to={action.path} key={index} className="quick-3d-pill-card">
                <div className="quick-card-glow"></div>
                <span className="action-icon-box">{action.icon}</span>
                <div className="action-info">
                  <h4>{action.title}</h4>
                  <p>{action.desc}</p>
                </div>
                <div className="card-glow-bar"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upgraded 3D Pro CTA Section with Live Particles */}
      <section className="about-cta-section-pro">
        <div className="about-cta-bg-pro">
          <div className="about-cta-gradient-pro"></div>
          <div className="about-cta-particles-container">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="about-cta-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${8 + Math.random() * 6}s`,
                }}
              ></div>
            ))}
          </div>
          <div className="about-cta-shapes-pro">
            <div className="about-cta-shape-pro shape-1-pro"></div>
            <div className="about-cta-shape-pro shape-2-pro"></div>
          </div>
        </div>

        <div className="container">
          <div className="about-cta-wrapper-pro">
            <div className="about-cta-inner-card">
              <span className="about-cta-badge-pill">🚀 Ready For Growth</span>
              <h2>Need Manpower Across India?</h2>
              <p>
                Contact us today and get all your workforce requirements fulfilled within a week!
              </p>
              <div className="about-cta-buttons-pro">
                <Link to="/contact" className="btn-about-cta-primary">
                  <span>Contact Us</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/post-job" className="btn-about-cta-secondary">
                  <span>Post a Job</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .services-page-wrapper-light {
          background: #f8fafc;
          color: #0f172a;
          font-family: var(--font-body);
          overflow-x: hidden;
          position: relative;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Live Particles Background */
        .services-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .services-particle {
          position: absolute;
          width: 7px;
          height: 7px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatServicesParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatServicesParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Hero Styling (Light Theme) */
        .services-hero-section-light {
          position: relative;
          padding: 110px 0 70px;
          background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                      #f8fafc;
          color: #0f172a;
          text-align: center;
          overflow: hidden;
          z-index: 1;
        }

        .services-hero-header {
          max-width: 750px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .services-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(99, 102, 241, 0.1);
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          padding: 7px 18px;
          border-radius: 50px;
          font-size: 12.5px;
          font-weight: 800;
          color: #4f46e5;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
        }

        .services-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .services-badge-light {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08));
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          padding: 7px 18px;
          border-radius: 30px;
          font-size: 12.5px;
          font-weight: 800;
          color: #4f46e5;
          margin-bottom: 14px;
        }

        .services-hero-title {
          font-size: 46px;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 18px;
          letter-spacing: -1px;
          color: #0f172a;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .services-hero-subtitle {
          font-size: 17px;
          color: #64748b;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .hero-action-buttons {
          display: flex;
          justify-content: center;
          gap: 14px;
        }

        .btn-hero-primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          padding: 12px 28px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
          transition: transform 0.2s ease;
        }

        .btn-hero-primary:hover {
          transform: translateY(-2px);
        }

        .btn-hero-secondary {
          background: #ffffff;
          color: #334155;
          border: 1.5px solid #cbd5e1;
          padding: 12px 28px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        .btn-hero-secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        /* Services Grid Section with 3D Effects */
        .services-main-section {
          padding: 90px 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #f8faff 0%, #ffffff 100%);
          z-index: 1;
        }

        .services-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .services-header-text {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 45px;
        }

        .services-header-text h2 {
          font-size: 36px;
          font-weight: 800;
          color: #0f172a;
          margin: 10px 0;
          letter-spacing: -0.5px;
        }

        .services-header-text p {
          font-size: 15.5px;
          color: #64748b;
        }

        .services-cards-grid-3d {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .modern-service-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border-radius: 24px;
          padding: 36px 28px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 10px 35px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(2deg);
        }

        .modern-service-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-10px);
          box-shadow: 0 25px 60px rgba(99, 102, 241, 0.18);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-bg-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-top-icon {
          margin-bottom: 18px;
        }

        .icon-box-glow {
          width: 62px;
          height: 62px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08));
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          color: #4f46e5;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.1);
          transition: transform 0.3s ease;
        }

        .modern-service-card-3d:hover .icon-box-glow {
          transform: scale(1.1) rotate(6deg);
        }

        .modern-service-card-3d h3 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .modern-service-card-3d p {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 18px;
        }

        .features-divider {
          height: 1px;
          background: #f1f5f9;
          margin-bottom: 18px;
        }

        .service-features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .service-features-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
        }

        .check-mark {
          width: 20px;
          height: 20px;
          background: #ecfdf5;
          color: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        .card-hover-link-3d {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          padding: 12px 20px;
          border-radius: 14px;
          color: #4f46e5;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .modern-service-card-3d:hover .card-hover-link-3d {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
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

        .modern-service-card-3d:hover .card-glow-bar,
        .why-3d-card:hover .card-glow-bar,
        .quick-3d-pill-card:hover .card-glow-bar {
          transform: scaleX(1);
        }

        /* Why Us Section Pro */
        .why-us-section-pro {
          position: relative;
          padding: 90px 0;
          overflow: hidden;
          background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
          z-index: 1;
        }

        .why-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .why-us-grid-3d {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 26px;
          position: relative;
          z-index: 2;
        }

        .why-3d-card {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px 26px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
          overflow: hidden;
          transform: perspective(1000px) rotateX(2deg);
        }

        .why-3d-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-8px);
          box-shadow: 0 25px 55px rgba(99, 102, 241, 0.16);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .why-card-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .why-card-icon-box {
          font-size: 32px;
          width: 58px;
          height: 58px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08));
          border: 1.5px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.08);
          transition: transform 0.3s ease;
        }

        .why-3d-card:hover .why-card-icon-box {
          transform: scale(1.1) rotate(5deg);
        }

        .why-3d-card h4 {
          font-size: 19px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .why-3d-card p {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* --- Upgraded 3D Interactive "AI Tools & Quick Actions" Section --- */
        .quick-actions-section-pro {
          position: relative;
          padding: 90px 0;
          overflow: hidden;
          background: #ffffff;
          z-index: 1;
        }

        .quick-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .quick-actions-grid-3d {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          position: relative;
          z-index: 2;
        }

        .quick-3d-pill-card {
          background: linear-gradient(135deg, #ffffff 0%, #fcf8ff 100%);
          border: 1.5px solid #e2e8f0;
          padding: 20px 18px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1deg);
        }

        .quick-3d-pill-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          background: #ffffff;
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 18px 45px rgba(99, 102, 241, 0.15);
        }

        .quick-card-glow {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 70px;
          height: 70px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .action-icon-box {
          font-size: 24px;
          width: 46px;
          height: 46px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
          border: 1.5px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .quick-3d-pill-card:hover .action-icon-box {
          transform: scale(1.1) rotate(6deg);
        }

        .action-info h4 {
          font-size: 14.5px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px;
        }

        .action-info p {
          font-size: 11.5px;
          color: #64748b;
          margin: 0;
        }

        /* --- Upgraded 3D Pro CTA Section with Live Particles --- */
        .about-cta-section-pro {
          position: relative;
          padding: 90px 0;
          overflow: hidden;
          z-index: 1;
        }

        .about-cta-bg-pro {
          position: absolute;
          inset: 0;
        }

        .about-cta-gradient-pro {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #311042 100%);
        }

        .about-cta-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .about-cta-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #c084fc;
          border-radius: 50%;
          opacity: 0.6;
          animation: floatCtaParticle linear infinite;
          box-shadow: 0 0 12px #c084fc;
        }

        @keyframes floatCtaParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-120px) scale(1.2); opacity: 0; }
        }

        .about-cta-shapes-pro {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .about-cta-shape-pro {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.35;
        }

        .shape-1-pro {
          width: 350px;
          height: 350px;
          background: #a855f7;
          top: -100px;
          right: -50px;
        }

        .shape-2-pro {
          width: 300px;
          height: 300px;
          background: #6366f1;
          bottom: -100px;
          left: 50px;
        }

        .about-cta-wrapper-pro {
          position: relative;
          z-index: 2;
        }

        .about-cta-inner-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 50px 36px;
          text-align: center;
          color: white;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
          max-width: 850px;
          margin: 0 auto;
          transform: perspective(1000px) rotateX(2deg);
          transition: transform 0.4s ease;
        }

        .about-cta-inner-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          border-color: rgba(192, 132, 252, 0.4);
        }

        .about-cta-badge-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 16px;
          background: rgba(192, 132, 252, 0.15);
          border: 1px solid rgba(192, 132, 252, 0.3);
          border-radius: 30px;
          font-weight: 700;
          font-size: 13px;
          color: #d8b4fe;
          margin-bottom: 18px;
        }

        .about-cta-inner-card h2 {
          font-size: 38px;
          font-weight: 800;
          margin-bottom: 14px;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .about-cta-inner-card p {
          font-size: 15.5px;
          color: #cbd5e1;
          line-height: 1.7;
          margin-bottom: 28px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .about-cta-buttons-pro {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .btn-about-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: #ffffff;
          color: #4f46e5;
          border-radius: 35px;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .btn-about-cta-primary:hover {
          transform: translateY(-3px);
          background: #f8fafc;
          box-shadow: 0 15px 35px rgba(255, 255, 255, 0.2);
        }

        .btn-about-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border-radius: 35px;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-about-cta-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #ffffff;
          transform: translateY(-3px);
        }

        /* Global Remote Staffing */
        .remote-staffing-pro-section{position:relative;overflow:hidden;padding:110px 0;background:linear-gradient(135deg,#071426,#101c3b 55%,#20164b);color:#fff}
        .remote-staffing-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(148,163,184,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.06) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,transparent,black 20%,black 80%,transparent)}
        .remote-staffing-pro-inner{position:relative;z-index:2;display:grid;grid-template-columns:1.1fr .9fr;gap:70px;align-items:center}
        .remote-staffing-copy h2{font-size:clamp(40px,5vw,66px);line-height:1.02;letter-spacing:-1.8px;margin:18px 0}.remote-staffing-copy p{color:#cbd5e1;line-height:1.8;font-size:16px;max-width:700px}
        .remote-staffing-points{display:grid;gap:10px;margin:28px 0}.remote-staffing-points>div{display:grid;grid-template-columns:42px 160px 1fr;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1)}.remote-staffing-points span{color:#7dd3fc;font-weight:900;font-size:12px}.remote-staffing-points b{font-size:14px}.remote-staffing-points small{color:#94a3b8;line-height:1.45}.remote-staffing-actions{display:flex;gap:12px;flex-wrap:wrap}.remote-staffing-visual{min-height:460px;position:relative;display:grid;place-items:center}.remote-globe{width:310px;height:310px;border-radius:50%;position:relative;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,rgba(125,211,252,.35),rgba(99,102,241,.16) 42%,rgba(15,23,42,.12) 68%);box-shadow:0 0 100px rgba(56,189,248,.17),inset 0 0 55px rgba(129,140,248,.18);animation:remoteGlobeFloat 7s ease-in-out infinite}.globe-core{font-size:78px;filter:drop-shadow(0 0 25px rgba(56,189,248,.4))}.globe-ring{position:absolute;border:1px solid rgba(125,211,252,.35);border-radius:50%;inset:-30px;transform:rotate(25deg) skewX(-8deg)}.ring-b{inset:18px;transform:rotate(-35deg) skewY(-8deg);border-color:rgba(167,139,250,.38)}.node{position:absolute;padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(10px);font-size:11px;font-weight:900}.node-1{left:-5px;top:80px}.node-2{right:15px;top:40px}.node-3{right:-15px;bottom:90px}.node-4{left:15px;bottom:35px}.budget-float,.talent-float{position:absolute;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);backdrop-filter:blur(16px);border-radius:18px;padding:14px 16px;box-shadow:0 20px 50px rgba(0,0,0,.22)}.budget-float{right:0;top:45px}.budget-float span,.budget-float small{display:block;color:#94a3b8;font-size:9px}.budget-float strong{display:block;font-size:26px;margin:2px 0}.talent-float{left:0;bottom:55px;font-size:10px;color:#cbd5e1}.talent-float b{display:block;margin-top:5px;font-size:13px;color:#fff}.live-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 12px #22c55e;margin-right:7px}@keyframes remoteGlobeFloat{50%{transform:translateY(-12px) rotate(2deg)}}

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .remote-staffing-pro-inner{grid-template-columns:1fr;gap:30px}.remote-staffing-visual{min-height:360px}.budget-float{right:8%}.talent-float{left:8%}
          .services-cards-grid-3d, .why-us-grid-3d {
            grid-template-columns: repeat(2, 1fr);
          }
          .quick-actions-grid-3d {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .remote-staffing-pro-section{padding:80px 0}.remote-staffing-points>div{grid-template-columns:34px 1fr}.remote-staffing-points small{grid-column:2}.remote-globe{width:230px;height:230px}.globe-core{font-size:58px}.budget-float{right:0;top:10px}.talent-float{left:0;bottom:15px}.remote-staffing-actions{flex-direction:column}.remote-staffing-actions a{justify-content:center}
          .services-hero-title {
            font-size: 36px;
          }
          .services-cards-grid-3d, .why-us-grid-3d, .quick-actions-grid-3d {
            grid-template-columns: 1fr;
          }
          .hero-action-buttons, .about-cta-buttons-pro {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Services;