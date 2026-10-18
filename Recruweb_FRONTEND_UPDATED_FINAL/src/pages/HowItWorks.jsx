import { Link } from "react-router-dom";
import ScrollIndicator from "../components/ScrollIndicator";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Initial Consultation",
      description:
        "We begin by understanding your business, challenges, and goals through a comprehensive consultation process.",
      details: [
        "Discuss your current HR needs",
        "Identify pain points",
        "Set clear objectives",
      ],
    },
    {
      number: "02",
      title: "Requirement Analysis",
      description:
        "We analyze your specific requirements including job roles, skills needed, and company culture fit.",
      details: [
        "Review job descriptions",
        "Understand team dynamics",
        "Define candidate profile",
      ],
    },
    {
      number: "03",
      title: "Talent Sourcing",
      description:
        "Our team taps into extensive networks and databases to find the best candidates.",
      details: ["Resume screening", "Initial outreach", "Candidate pipeline"],
    },
    {
      number: "04",
      title: "Screening & Assessment",
      description:
        "Rigorous screening process including interviews, skills assessments, and background checks.",
      details: [
        "Phone/video interviews",
        "Technical assessments",
        "Reference verification",
      ],
    },
    {
      number: "05",
      title: "Client Interviews",
      description:
        "We coordinate and facilitate interviews at your convenience.",
      details: [
        "Schedule coordination",
        "Interview feedback",
        "Candidate ranking",
      ],
    },
    {
      number: "06",
      title: "Selection & Offer",
      description:
        "We help you evaluate and select the best candidate and manage the offer process.",
      details: ["Offer negotiation", "Salary benchmarking", "Joining timeline"],
    },
    {
      number: "07",
      title: "Onboarding Support",
      description:
        "We assist with offer letters, joining formalities, and smooth onboarding.",
      details: ["Documentation", "Orientation support", "30-60-90 day plan"],
    },
    {
      number: "08",
      title: "Ongoing Support",
      description:
        "Continuous monitoring and optimization to ensure long-term success.",
      details: [
        "Regular check-ins",
        "Performance tracking",
        "Continuous improvement",
      ],
    },
  ];

  const timeline = [
    {
      day: "Day 1-2",
      title: "Requirement Gathering",
      description: "Initial discussion and requirement collection",
    },
    {
      day: "Day 3-7",
      title: "Candidate Sourcing",
      description: "Active recruitment and candidate search",
    },
    {
      day: "Day 8-14",
      title: "Screening Process",
      description: "Interviews and assessments",
    },
    {
      day: "Day 15-21",
      title: "Client Interviews",
      description: "Coordinate interviews with clients",
    },
    {
      day: "Day 22-28",
      title: "Selection & Offer",
      description: "Final selection and offer process",
    },
    {
      day: "Day 29-30",
      title: "Onboarding",
      description: "Candidate joins and gets oriented",
    },
  ];

  const benefits = [
    {
      icon: "⏱️",
      title: "Quick Turnaround",
      description: "Fast implementation without compromising quality",
    },
    {
      icon: "💡",
      title: "Expert Guidance",
      description: "Access to seasoned HR professionals",
    },
    {
      icon: "📈",
      title: "Scalable Solutions",
      description: "Grow your HR capabilities as you grow",
    },
    {
      icon: "🔒",
      title: "Data Security",
      description: "Your data is protected at all times",
    },
    {
      icon: "🌍",
      title: "Global Network",
      description: "Access to international talent pools and markets",
    },
    {
      icon: "💰",
      title: "Cost-Effective",
      description: "Competitive pricing with no hidden costs",
    },
    {
      icon: "🎯",
      title: "Quality Assured",
      description: "Rigorous vetting process for all candidates",
    },
    {
      icon: "🤝",
      title: "Dedicated Support",
      description: "24/7 customer support and account management",
    },
    {
      icon: "📊",
      title: "Analytics & Reporting",
      description: "Detailed insights and performance metrics",
    },
    {
      icon: "✅",
      title: "Compliance Guaranteed",
      description: "Full adherence to labor laws and regulations",
    },
    {
      icon: "🔄",
      title: "Flexible Contracts",
      description: "Customizable terms to suit your needs",
    },
    {
      icon: "🏆",
      title: "Industry Experience",
      description: "Years of expertise across multiple sectors",
    },
  ];

  return (
    <div className="how-it-works-wrapper">
      {/* Hero Section with Light Background & Hover Image Animation */}
      <section className="how-hero-section">
        <div className="how-hero-bg">
          <div className="how-particles">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="how-particle"
                style={{
                  left: `${(i * 5.5) % 100}%`,
                  animationDelay: `${(i * 0.4) % 6}s`,
                  animationDuration: `${12 + (i % 8)}s`,
                }}
              ></div>
            ))}
          </div>
          <div className="hero-glow-blob"></div>
        </div>
        <div className="container">
          <div className="how-hero-header">
            <div className="how-badge">
              <span className="badge-dot"></span>
              <span>Proven Methodology</span>
            </div>
            <h1 className="how-hero-title">
              Your Path to <span className="gradient-text">HR Excellence</span>
            </h1>
            <p className="how-hero-subtitle">
              A simple, proven process to transform your human resources
              operations.
            </p>

            <div className="hero-img-box">
              <img
                src="/images/howitworks-image.jpg"
                alt="How It Works"
                className="hero-img-hover-effect"
              />
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Vertical Timeline Process Steps with 3D Cards */}
      <section className="process-main-section">
        <div className="process-bg-glow"></div>
        <div className="container">
          <div className="section-header-box">
            <div className="how-badge">
              <span className="badge-dot"></span>
              <span>Our Process</span>
            </div>
            <h2>Eight Step Process</h2>
            <p>
              From consultation to ongoing support, we guide you through every
              step.
            </p>
          </div>

          <div className="vertical-timeline-container">
            <div className="vertical-line"></div>
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`vertical-timeline-item ${isEven ? "left" : "right"}`}
                >
                  <div className="timeline-center-marker">
                    <div className="timeline-icon-circle">
                      <span className="step-marker-number">{step.number}</span>
                      <div className="node-pulse-ring"></div>
                    </div>
                  </div>
                  <div className="timeline-card-box-3d">
                    <div className="card-bg-light-glow"></div>
                    <span className="timeline-step-num">{step.number}</span>
                    <h3 className="timeline-card-title">{step.title}</h3>
                    <p className="timeline-card-desc">{step.description}</p>

                    <ul className="step-detail-bullets">
                      {step.details.map((detail, i) => (
                        <li key={i}>
                          <span className="bullet-check">✓</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="card-glow-bar"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upgraded 3D Estimated Timeline Section with Live Particles */}
      <section className="timeline-main-section-pro">
        <div className="timeline-bg-pro">
          <div className="timeline-gradient-pro"></div>
          <div className="timeline-particles-container">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="timeline-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${8 + Math.random() * 6}s`,
                }}
              ></div>
            ))}
          </div>
          <div className="timeline-shapes-pro">
            <div className="timeline-shape-pro shape-1-pro"></div>
            <div className="timeline-shape-pro shape-2-pro"></div>
          </div>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="section-header-box dark">
            <div className="how-badge light">
              <span className="badge-dot"></span>
              <span>Estimated Timeline</span>
            </div>
            <h2 className="timeline-title-pro">Quick Turnaround Process</h2>
            <p className="timeline-subtitle-pro">
              We understand your urgency. See our typical recruitment timeline
              below.
            </p>
          </div>

          <div className="timeline-flex-grid-3d">
            {timeline.map((item, index) => (
              <div key={index} className="timeline-dark-3d-card">
                <div className="card-glow"></div>
                <span className="day-pill">{item.day}</span>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <div className="card-glow-bar"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with 3D Cards */}
      <section className="benefits-main-section">
        <div className="container">
          <div className="section-header-box">
            <div className="how-badge">
              <span className="badge-dot"></span>
              <span>Why Choose Us</span>
            </div>
            <h2>The Recruweb Advantage</h2>
            <p>
              Experience the difference with our proven approach to HR
              solutions.
            </p>
          </div>

          <div className="benefits-cards-grid-3d">
            {benefits.map((benefit, index) => (
              <div className="benefit-3d-card" key={index}>
                <div className="card-bg-light-glow"></div>
                <div className="benefit-icon-box">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
                <div className="card-glow-bar"></div>
              </div>
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
              <h2>Ready to Get Started?</h2>
              <p>Contact us today to schedule your free consultation.</p>
              <div className="about-cta-buttons-pro">
                <Link to="/contact" className="btn-about-cta-primary">
                  <span>Contact Us Now</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .how-it-works-wrapper {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero with Light Theme */
        .how-hero-section {
          position: relative;
          padding: 130px 0 70px;
          background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(217, 70, 239, 0.08) 0%, transparent 40%),
                      #f8fafc;
          color: #0f172a;
          text-align: center;
          overflow: hidden;
        }

        .how-hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .how-particles .how-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.75;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
          animation: floatParticle linear infinite;
        }

        @keyframes floatParticle {
          0% { transform: translateY(100vh) scale(0.6); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }

        .hero-glow-blob {
          position: absolute;
          top: -20%;
          left: 20%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(50px);
        }

        .how-hero-header {
          max-width: 850px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .how-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(139, 92, 246, 0.12));
          border: 1.5px solid rgba(99, 102, 241, 0.35);
          padding: 9px 22px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 800;
          color: #3730a3;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          margin-bottom: 20px;
        }

        .how-badge.light {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .badge-dot {
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #3730a3 0%, #6d28d9 100%);
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(55, 48, 163, 0.8), 0 0 4px rgba(255, 255, 255, 0.8);
          animation: dot-pulse 1.8s ease-in-out infinite;
        }

        @keyframes dot-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 10px rgba(55, 48, 163, 0.8);
          }
          50% {
            transform: scale(1.4);
            box-shadow: 0 0 20px rgba(109, 40, 217, 1), 0 0 8px rgba(255, 255, 255, 0.9);
          }
        }

        .how-hero-title {
          font-size: 52px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .how-hero-subtitle {
          font-size: 18px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .hero-img-box {
          margin-top: 24px;
          display: inline-block;
          perspective: 1000px;
        }

        /* Image Hover Transition & 3D Animation */
        .hero-img-hover-effect {
          width: 100%;
          max-width: 850px;
          height: auto;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.2);
          border: 2px solid #e2e8f0;
          transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(2deg) scale(1);
        }

        .hero-img-hover-effect:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-8px) scale(1.02);
          box-shadow: 0 30px 70px rgba(99, 102, 241, 0.35);
          border-color: #6366f1;
        }

        /* Section Headers */
        .section-header-box {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 50px;
        }

        .section-header-box h2 {
          font-size: 38px;
          font-weight: 800;
          color: #0f172a;
          margin: 12px 0;
        }

        .section-header-box.dark h2 {
          color: #ffffff;
        }

        .section-header-box p {
          font-size: 16px;
          color: #64748b;
        }

        .section-header-box.dark p {
          color: #cbd5e1;
        }

        /* Vertical Alternating Process Steps with 3D Effect */
        .process-main-section {
          padding: 100px 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #f8faff 0%, #ffffff 100%);
        }

        .process-bg-glow {
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

        .vertical-timeline-container {
          position: relative;
          max-width: 1000px;
          margin: 40px auto 0;
          padding: 20px 0;
        }

        .vertical-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 3px;
          background: linear-gradient(180deg, #6366f1 0%, #a855f7 100%);
          transform: translateX(-50%);
          z-index: 1;
        }

        .vertical-timeline-item {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 60px;
          width: 100%;
        }

        .vertical-timeline-item:last-child {
          margin-bottom: 0;
        }

        .vertical-timeline-item.left {
          justify-content: flex-start;
        }

        .vertical-timeline-item.right {
          justify-content: flex-end;
        }

        .timeline-center-marker {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }

        .timeline-icon-circle {
          width: 56px;
          height: 56px;
          background: #ffffff;
          border: 3px solid #6366f1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.35);
          position: relative;
        }

        .step-marker-number {
          font-size: 16px;
          font-weight: 800;
          color: #6366f1;
        }

        .node-pulse-ring {
          position: absolute;
          inset: -6px;
          border: 2px solid #a855f7;
          border-radius: 50%;
          animation: pulse-ring 2s infinite;
          opacity: 0.7;
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .timeline-card-box-3d {
          width: 42%;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          padding: 36px 30px;
          border-radius: 26px;
          box-shadow: 0 10px 35px rgba(15, 23, 42, 0.04);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(2deg);
        }

        .timeline-card-box-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-8px);
          box-shadow: 0 25px 60px rgba(99, 102, 241, 0.18);
          border-color: rgba(99, 102, 241, 0.4);
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

        .timeline-step-num {
          font-size: 38px;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          margin-bottom: 10px;
          line-height: 1;
        }

        .timeline-card-title {
          font-size: 21px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .timeline-card-desc {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          margin-bottom: 18px;
        }

        .step-detail-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid #f1f5f9;
          padding-top: 16px;
        }

        .step-detail-bullets li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .bullet-check {
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

        /* --- Upgraded 3D Estimated Timeline Section Pro --- */
        .timeline-main-section-pro {
          position: relative;
          padding: 100px 0;
          overflow: hidden;
        }

        .timeline-bg-pro {
          position: absolute;
          inset: 0;
        }

        .timeline-gradient-pro {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #311042 100%);
        }

        .timeline-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .timeline-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #c084fc;
          border-radius: 50%;
          opacity: 0.6;
          animation: floatTimelineParticle linear infinite;
          box-shadow: 0 0 12px #c084fc;
        }

        @keyframes floatTimelineParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-120px) scale(1.2); opacity: 0; }
        }

        .timeline-shapes-pro {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .timeline-shape-pro {
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

        .timeline-title-pro {
          font-size: 38px;
          font-weight: 800;
          color: #ffffff;
          margin: 12px 0;
          letter-spacing: -0.5px;
        }

        .timeline-subtitle-pro {
          font-size: 16px;
          color: #cbd5e1;
          line-height: 1.6;
        }

        .timeline-flex-grid-3d {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
          position: relative;
          z-index: 2;
        }

        .timeline-dark-3d-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          padding: 30px 20px;
          border-radius: 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(2deg);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .timeline-dark-3d-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-10px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(192, 132, 252, 0.5);
          box-shadow: 0 25px 60px rgba(168, 85, 247, 0.25);
        }

        .day-pill {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 16px;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        .timeline-dark-3d-card h4 {
          font-size: 17px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .timeline-dark-3d-card p {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }

        /* Benefits Grid with 3D Cards */
        .benefits-main-section {
          padding: 100px 0;
          background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
        }

        .benefits-cards-grid-3d {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .benefit-3d-card {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px 24px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(2deg);
        }

        .benefit-3d-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-8px);
          box-shadow: 0 22px 50px rgba(99, 102, 241, 0.16);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .benefit-icon-box {
          font-size: 34px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12));
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.08);
          transition: transform 0.3s ease;
        }

        .benefit-3d-card:hover .benefit-icon-box {
          transform: scale(1.1) rotate(6deg);
        }

        .benefit-3d-card h3 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .benefit-3d-card p {
          font-size: 13.5px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
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

        .timeline-card-box-3d:hover .card-glow-bar,
        .timeline-dark-3d-card:hover .card-glow-bar,
        .benefit-3d-card:hover .card-glow-bar {
          transform: scaleX(1);
        }

        /* --- Upgraded 3D Pro CTA Section with Live Particles --- */
        .about-cta-section-pro {
          position: relative;
          padding: 100px 0;
          overflow: hidden;
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
          font-size: 36px;
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

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .benefits-cards-grid-3d {
            grid-template-columns: repeat(2, 1fr);
          }
          .timeline-flex-grid-3d {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .vertical-line {
            left: 28px;
          }
          .timeline-center-marker {
            left: 28px;
            top: 40px;
            transform: translateY(0);
          }
          .vertical-timeline-item.left,
          .vertical-timeline-item.right {
            justify-content: flex-end;
          }
          .timeline-card-box-3d {
            width: calc(100% - 70px);
          }
          .timeline-flex-grid-3d {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .how-hero-title {
            font-size: 36px;
          }
          .benefits-cards-grid-3d, .timeline-flex-grid-3d {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HowItWorks;