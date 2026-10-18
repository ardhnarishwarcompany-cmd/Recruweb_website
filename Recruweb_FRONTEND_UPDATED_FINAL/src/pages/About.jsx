import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ScrollIndicator from "../components/ScrollIndicator";

const About = () => {
  const [countersActive, setCountersActive] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountersActive(true);
        }
      },
      { threshold: 0.3 },
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { end: 10, suffix: "+", label: "Years Experience", icon: "🏢" },
    { end: 500, suffix: "+", label: "Happy Clients", icon: "😊" },
    { end: 10000, suffix: "+", label: "Placements Made", icon: "🎯" },
    { end: 50, suffix: "+", label: "Cities Served", icon: "🌍" },
    { end: 98, suffix: "%", label: "Success Rate", icon: "⭐" },
    { end: 50, suffix: "+", label: "Team Members", icon: "👥" },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Excellence",
      description:
        "We strive for excellence in every aspect of our service delivery, setting high standards that exceed expectations.",
      accent: "#6366f1",
    },
    {
      icon: "🤝",
      title: "Integrity",
      description:
        "Building trust through transparent and honest relationships with clients, candidates, and team members.",
      accent: "#10b981",
    },
    {
      icon: "💡",
      title: "Innovation",
      description:
        "Continuously evolving our solutions to meet the changing needs of the modern workplace.",
      accent: "#f59e0b",
    },
    {
      icon: "⚡",
      title: "Efficiency",
      description:
        "Delivering results quickly and effectively, ensuring minimal turnaround time without compromising quality.",
      accent: "#ec4899",
    },
    {
      icon: "🌍",
      title: "Pan-India",
      description:
        "Serving clients across all major cities in India with localized solutions and on-ground support.",
      accent: "#3b82f6",
    },
    {
      icon: "📈",
      title: "Growth",
      description:
        "Committed to the growth of our clients, candidates, and team members through continuous development.",
      accent: "#8b5cf6",
    },
  ];

  const milestones = [
    {
      year: "2023",
      title: "Founded",
      description: "Started with a vision to transform HR services in India",
      icon: "🚀",
    },
    {
      year: "2024",
      title: "Expansion",
      description: "Expanded operations to serve PAN India clients",
      icon: "🌏",
    },
    {
      year: "2025",
      title: "Digital Transformation",
      description: "Launched digital HRMS solutions for remote workforce",
      icon: "💻",
    },
    {
      year: "2026",
      title: "Growth",
      description: "Team grew to 50+ HR professionals",
      icon: "📈",
    },
  ];

  const Counter = ({ end, suffix }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!countersActive) return;

      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [countersActive, end]);

    return (
      <span>
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  return (
    <div className="about-page-wrapper">
      {/* About Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-bg">
          <div className="about-gradient"></div>
          <div className="about-particles">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="about-particle"
                style={{
                  left: `${(i * 5.5) % 100}%`,
                  animationDelay: `${(i * 0.4) % 6}s`,
                  animationDuration: `${12 + (i % 8)}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
        <div className="container">
          <div className="about-hero-grid">
            <div className="about-hero-content">
              <div className="about-badge">
                <span className="about-badge-dot"></span>
                <span>About Recruweb</span>
              </div>
              <h1 className="about-hero-title">
                Empowering Businesses Through{" "}
                <span className="about-gradient-text">People</span>
              </h1>
              <p className="about-hero-description">
                We are Recruweb - your trusted partner in comprehensive HR
                solutions. Founded with a mission to transform how organizations
                manage their most valuable asset - their people.
              </p>
              <div className="about-hero-actions">
                <Link to="/contact" className="about-btn-primary">
                  <span>Get in Touch</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/services" className="about-btn-secondary">
                  <span>Our Services</span>
                </Link>
              </div>
            </div>
            <div className="about-hero-visual">
              <div className="about-visual-glow"></div>
              <div className="about-visual-main">
                <div className="about-visual-icon">🌟</div>
              </div>
              <div className="about-floating-card about-float-1">
                <span className="float-icon">💼</span>
                <div className="float-content">
                  <span className="float-title">Complete HR Solutions</span>
                  <span className="float-subtitle">Recruitment to payroll</span>
                </div>
              </div>
              <div className="about-floating-card about-float-2">
                <span className="float-icon">🏆</span>
                <div className="float-content">
                  <span className="float-title">Industry Leaders</span>
                  <span className="float-subtitle">
                    500+ companies trust us
                  </span>
                </div>
              </div>
              <div className="about-floating-card about-float-3">
                <span className="float-icon">⚡</span>
                <div className="float-content">
                  <span className="float-title">Within 1 Week</span>
                  <span className="float-subtitle">Workforce deployment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Stats Section */}
      <section className="about-stats-section" ref={statsRef}>
        <div className="stats-particles-container">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="stats-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${7 + Math.random() * 6}s`,
              }}
            ></div>
          ))}
        </div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="about-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="about-stat-card">
                <span className="about-stat-icon">{stat.icon}</span>
                <span className="about-stat-number">
                  <Counter end={stat.end} suffix={stat.suffix} />
                </span>
                <span className="about-stat-name">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section Pro */}
      <section className="about-story-section-pro">
        <div className="story-bg-glow"></div>
        <div className="container">
          <div className="about-story-grid-pro">
            <div className="about-story-content-pro">
              <div className="about-section-badge">
                <span className="about-badge-dot"></span>
                Our Story
              </div>
              <h2 className="about-section-title">
                A Journey of{" "}
                <span className="about-gradient-text">Excellence</span>
              </h2>
              <div className="about-story-text-pro">
                <p>
                  Founded in 2015, Recruweb Resources Private Limited began as a
                  small recruitment agency with big dreams. Today, we have
                  evolved into a comprehensive HR solutions provider serving
                  clients across India and beyond.
                </p>
                <p>
                  Our journey has been marked by continuous learning,
                  adaptation, and an unwavering commitment to client success. We
                  believe that great businesses are built on great people.
                </p>
              </div>
              <div className="about-story-features-pro">
                <div className="story-feature-pill">
                  <span className="story-check-icon">✓</span>
                  <span>PAN India Coverage</span>
                </div>
                <div className="story-feature-pill">
                  <span className="story-check-icon">✓</span>
                  <span>Integrated HRMS Solutions</span>
                </div>
                <div className="story-feature-pill">
                  <span className="story-check-icon">✓</span>
                  <span>Workforce Within 1 Week</span>
                </div>
              </div>
            </div>

            <div className="about-story-visual-pro">
              <div className="story-3d-card">
                <div className="story-card-inner-glow"></div>
                <div className="story-icon-badge">🏢</div>
                <h3>Trusted Partner</h3>
                <p>For all your HR & Recruitment needs</p>
                <div className="story-card-footer">
                  <span className="pulse-dot"></span>
                  <span>Active & Growing</span>
                </div>
              </div>
              <div className="story-floating-badge-1">⭐ 98% Success</div>
              <div className="story-floating-badge-2">🚀 500+ Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Pro */}
      <section className="about-mission-section-pro">
        <div className="mission-bg-glow"></div>
        <div className="container">
          <div className="about-section-header">
            <div className="about-section-badge">
              <span className="about-badge-dot"></span>
              Core Purpose
            </div>
            <h2 className="about-section-title">
              Our Mission & <span className="about-gradient-text">Vision</span>
            </h2>
            <p className="about-section-subtitle">
              Driving corporate transformation with clarity, passion, and future-ready goals.
            </p>
          </div>

          <div className="about-mission-grid-pro">
            <div className="mission-3d-card">
              <div className="mission-card-glow"></div>
              <div className="mission-icon-box">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To empower businesses with innovative HR solutions that drive
                growth, enhance employee engagement, and create lasting value
                for all stakeholders.
              </p>
              <div className="mission-tags-pro">
                <span>Innovation</span>
                <span>Excellence</span>
                <span>Partnership</span>
              </div>
              <div className="card-glow-bar" style={{ background: "#6366f1" }}></div>
            </div>

            <div className="mission-3d-card vision-card">
              <div className="mission-card-glow"></div>
              <div className="mission-icon-box vision-icon">🌟</div>
              <h3>Our Vision</h3>
              <p>
                To be the most trusted HR partner in India, known for delivering
                exceptional results, fostering meaningful relationships, and
                setting new standards in the industry.
              </p>
              <div className="mission-tags-pro">
                <span>Leadership</span>
                <span>Quality</span>
                <span>Trust</span>
              </div>
              <div className="card-glow-bar" style={{ background: "#a855f7" }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section Pro */}
      <section className="about-values-section-pro">
        <div className="values-bg-glow"></div>
        <div className="container">
          <div className="about-section-header">
            <div className="about-section-badge">
              <span className="about-badge-dot"></span>
              Our Values
            </div>
            <h2 className="about-section-title">
              What Drives Us{" "}
              <span className="about-gradient-text">Forward</span>
            </h2>
            <p className="about-section-subtitle">
              Our core values guide everything we do, from how we interact with
              clients to how we treat our team members.
            </p>
          </div>
          <div className="about-values-grid-pro">
            {values.map((value, index) => (
              <div key={index} className="value-3d-card">
                <div className="value-card-glow" style={{ background: `radial-gradient(circle, ${value.accent}25 0%, transparent 70%)` }}></div>
                <div className="value-icon-box" style={{ background: `${value.accent}15`, color: value.accent, borderColor: `${value.accent}30` }}>
                  {value.icon}
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
                <div className="card-glow-bar" style={{ background: value.accent }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section Pro */}
      <section className="about-timeline-section-pro">
        <div className="timeline-bg-glow"></div>
        <div className="container">
          <div className="about-section-header">
            <div className="about-section-badge">
              <span className="about-badge-dot"></span>
              Our Journey
            </div>
            <h2 className="about-section-title">
              Milestones That{" "}
              <span className="about-gradient-text">Matter</span>
            </h2>
            <p className="about-section-subtitle">
              Key moments that shaped our growth and defined our commitment to excellence.
            </p>
          </div>

          <div className="vertical-timeline-container-pro">
            <div className="vertical-line-pro"></div>
            {milestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`timeline-3d-row ${isEven ? "left" : "right"}`}
                >
                  <div className="timeline-node-pro">
                    <span className="node-emoji">{milestone.icon}</span>
                    <div className="node-pulse-ring"></div>
                  </div>
                  <div className="timeline-3d-card">
                    <div className="timeline-card-glow"></div>
                    <span className="timeline-card-year">{milestone.year}</span>
                    <h3 className="timeline-card-title">{milestone.title}</h3>
                    <p className="timeline-card-desc">{milestone.description}</p>
                    <div className="card-glow-bar" style={{ background: index % 2 === 0 ? "#6366f1" : "#a855f7" }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upgraded 3D Interactive Pro CTA Section with Live Particles */}
      <section className="about-cta-section-pro">
        <div className="about-cta-bg-pro">
          <div className="about-cta-gradient-pro"></div>
          {/* Live Floating Particles */}
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
              <h2>Ready to Transform Your HR?</h2>
              <p>
                Partner with Recruweb for all your human resource needs. From recruitment to payroll, we've got you covered. Get workforce within a week.
              </p>
              <div className="about-cta-buttons-pro">
                <Link to="/contact" className="btn-about-cta-primary">
                  <span>Get Started Now</span>
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

      {/* CSS */}
      <style>{`
        .about-page-wrapper {
          background: #f8fafc;
          color: #0f172a;
          font-family: inherit;
          overflow-x: hidden;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero Section */
        .about-hero-section {
          position: relative;
          padding: 110px 0 80px;
          background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(217, 70, 239, 0.08) 0%, transparent 40%),
                      #f8fafc;
          overflow: hidden;
        }

        .about-hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .about-gradient {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 60%;
          height: 120%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(30px);
        }

        .about-particles .about-particle {
          position: absolute;
          width: 10px;
          height: 10px;
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

        .about-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .about-badge, .about-section-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(139, 92, 246, 0.12));
          border: 1.5px solid rgba(99, 102, 241, 0.35);
          padding: 9px 22px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 800;
          color: #3730a3;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          margin-bottom: 20px;
        }

        .about-badge-dot {
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

        .about-hero-title {
          font-size: 52px;
          font-weight: 800;
          line-height: 1.15;
          color: #0f172a;
          margin-bottom: 20px;
          letter-spacing: -1px;
        }

        .about-gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .about-hero-description {
          font-size: 17.5px;
          color: #475569;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .about-hero-actions {
          display: flex;
          gap: 16px;
        }

        .about-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          padding: 14px 28px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
          transition: transform 0.2s;
        }

        .about-btn-primary:hover {
          transform: translateY(-2px);
        }

        .about-btn-secondary {
          display: inline-flex;
          align-items: center;
          background: #ffffff;
          color: #0f172a;
          border: 1.5px solid #cbd5e1;
          padding: 14px 28px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          transition: border-color 0.2s;
        }

        .about-btn-secondary:hover {
          border-color: #6366f1;
          color: #4f46e5;
        }

        /* Hero Visual & Glass Cards */
        .about-hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 380px;
        }

        .about-visual-main {
          width: 180px;
          height: 180px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.3);
        }

        .about-floating-card {
          position: absolute;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 14px 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          animation: float 4s ease-in-out infinite;
        }

        .about-float-1 { top: 10%; right: 0; animation-delay: 0s; }
        .about-float-2 { bottom: 20%; left: -5%; animation-delay: 1.5s; }
        .about-float-3 { bottom: 5%; right: 10%; animation-delay: 3s; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .float-icon { font-size: 24px; }
        .float-title { font-size: 14px; font-weight: 700; color: #0f172a; display: block; }
        .float-subtitle { font-size: 12px; color: #64748b; }

        /* Stats Section */
        .about-stats-section {
          background: linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #4c1d95 100%);
          padding: 80px 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .about-stats-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.6;
          pointer-events: none;
        }

        .stats-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .stats-particle {
          position: absolute;
          width: 5px;
          height: 5px;
          background: #c084fc;
          border-radius: 50%;
          opacity: 0.5;
          animation: floatStatsParticle linear infinite;
        }

        @keyframes floatStatsParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          30% { opacity: 0.7; }
          70% { opacity: 0.7; }
          100% { transform: translateY(-90px) scale(1.3); opacity: 0; }
        }

        .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
          position: relative;
          z-index: 2;
        }

        .about-stat-card {
          text-align: center;
          color: white;
          padding: 22px 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .about-stat-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(192, 132, 252, 0.5);
          box-shadow: 0 15px 35px rgba(168, 85, 247, 0.3);
        }

        .about-stat-icon { font-size: 32px; display: block; margin-bottom: 10px; }
        .about-stat-number { font-size: 30px; font-weight: 800; color: #ffffff; display: block; margin-bottom: 4px; }
        .about-stat-name { font-size: 13px; color: #cbd5e1; font-weight: 600; }

        /* Story Section Pro */
        .about-story-section-pro {
          padding: 100px 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #f8faff 0%, #ffffff 100%);
        }

        .story-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .about-story-grid-pro {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .about-story-text-pro p {
          font-size: 16.5px;
          color: #475569;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .about-story-features-pro {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 28px;
        }

        .story-feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 12px 20px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14.5px;
          color: #1e293b;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
          width: fit-content;
        }

        .story-feature-pill:hover {
          transform: translateX(6px);
          border-color: #6366f1;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
        }

        .story-check-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
        }

        .about-story-visual-pro {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 420px;
        }

        .story-3d-card {
          background: linear-gradient(135deg, #ffffff 0%, #fcf8ff 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 32px;
          padding: 50px 40px;
          text-align: center;
          box-shadow: 0 25px 60px rgba(99, 102, 241, 0.12);
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
          width: 340px;
        }

        .story-3d-card:hover {
          transform: perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-10px);
          box-shadow: 0 35px 80px rgba(99, 102, 241, 0.22);
          border-color: #6366f1;
        }

        .story-card-inner-glow {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .story-icon-badge {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
          border: 1.5px solid rgba(99, 102, 241, 0.3);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          margin: 0 auto 24px auto;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
          transition: transform 0.3s ease;
        }

        .story-3d-card:hover .story-icon-badge {
          transform: scale(1.1) rotate(6deg);
        }

        .story-3d-card h3 {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .story-3d-card p {
          font-size: 14.5px;
          color: #64748b;
          margin-bottom: 24px;
        }

        .story-card-footer {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          color: #059669;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse-dot 1.5s infinite;
        }

        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .story-floating-badge-1 {
          position: absolute;
          top: 30px;
          left: -10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 10px 18px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13.5px;
          color: #4f46e5;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          animation: float 4s ease-in-out infinite;
        }

        .story-floating-badge-2 {
          position: absolute;
          bottom: 30px;
          right: -10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 10px 18px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13.5px;
          color: #7c3aed;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          animation: float 4s ease-in-out infinite 2s;
        }

        /* Mission & Vision Section Pro */
        .about-mission-section-pro {
          padding: 100px 0;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.04) 0%, transparent 60%);
        }

        .mission-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.07) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .about-mission-grid-pro {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 35px;
          position: relative;
          z-index: 2;
        }

        .mission-3d-card {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1px solid #e2e8f0;
          border-radius: 32px;
          padding: 45px 40px;
          box-shadow: 0 15px 40px rgba(15, 23, 42, 0.04);
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
          overflow: hidden;
          transform: perspective(1000px) rotateX(2deg);
        }

        .mission-3d-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-10px);
          box-shadow: 0 30px 70px rgba(99, 102, 241, 0.18);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .mission-card-glow {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .mission-icon-box {
          width: 76px;
          height: 76px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1));
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          margin-bottom: 24px;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.1);
          transition: transform 0.3s ease;
        }

        .mission-3d-card:hover .mission-icon-box {
          transform: scale(1.1) rotate(6deg);
        }

        .vision-icon {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1)) !important;
          border-color: rgba(168, 85, 247, 0.25) !important;
        }

        .mission-3d-card h3 {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 14px;
        }

        .mission-3d-card p {
          font-size: 16px;
          color: #475569;
          line-height: 1.75;
          margin-bottom: 24px;
        }

        .mission-tags-pro {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .mission-tags-pro span {
          background: rgba(99, 102, 241, 0.08);
          color: #4f46e5;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 20px;
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .mission-3d-card:hover .card-glow-bar,
        .value-3d-card:hover .card-glow-bar {
          transform: scaleX(1);
        }

        /* Values Section Pro */
        .about-values-section-pro {
          padding: 100px 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
        }

        .values-bg-glow {
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

        .about-values-grid-pro {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          position: relative;
          z-index: 2;
        }

        .value-3d-card {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow: 0 10px 35px rgba(15, 23, 42, 0.04);
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
          overflow: hidden;
          transform: perspective(1000px) rotateX(2deg);
        }

        .value-3d-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-10px);
          box-shadow: 0 25px 60px rgba(99, 102, 241, 0.18);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .value-card-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          pointer-events: none;
        }

        .value-icon-box {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          margin-bottom: 22px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.04);
          transition: transform 0.3s ease;
        }

        .value-3d-card:hover .value-icon-box {
          transform: scale(1.1) rotate(5deg);
        }

        .value-3d-card h3 {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .value-3d-card p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        /* Timeline Section Pro */
        .about-timeline-section-pro {
          padding: 110px 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #f8faff 0%, #ffffff 100%);
        }

        .timeline-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .vertical-timeline-container-pro {
          position: relative;
          max-width: 1000px;
          margin: 60px auto 0 auto;
          display: flex;
          flex-direction: column;
          gap: 50px;
        }

        .vertical-line-pro {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 3px;
          background: linear-gradient(180deg, #6366f1 0%, #a855f7 50%, #f093fb 100%);
          transform: translateX(-50%);
          border-radius: 3px;
        }

        .timeline-3d-row {
          display: grid;
          grid-template-columns: 1fr 60px 1fr;
          align-items: center;
          position: relative;
        }

        .timeline-3d-row.left {
          grid-template-columns: 1fr 60px 1fr;
        }

        .timeline-3d-row.left .timeline-3d-card {
          grid-column: 1 / 2;
        }

        .timeline-3d-row.right .timeline-3d-card {
          grid-column: 3 / 4;
        }

        .timeline-node-pro {
          grid-column: 2 / 3;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 0 0 6px #ffffff, 0 12px 30px rgba(99, 102, 241, 0.4);
          z-index: 2;
          margin: 0 auto;
          position: relative;
          transition: transform 0.3s ease;
        }

        .timeline-3d-row:hover .timeline-node-pro {
          transform: scale(1.15) rotate(10deg);
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

        .timeline-3d-card {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          padding: 38px;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.05);
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
          overflow: hidden;
          transform: perspective(1000px) rotateX(2deg);
        }

        .timeline-3d-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-8px);
          box-shadow: 0 25px 60px rgba(99, 102, 241, 0.18);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .timeline-card-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .timeline-card-year {
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
          margin: 0;
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
          border-radius: 36px;
          padding: 60px 40px;
          text-align: center;
          color: white;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
          max-width: 900px;
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
          padding: 6px 18px;
          background: rgba(192, 132, 252, 0.15);
          border: 1px solid rgba(192, 132, 252, 0.3);
          border-radius: 30px;
          font-weight: 700;
          font-size: 13.5px;
          color: #d8b4fe;
          margin-bottom: 22px;
        }

        .about-cta-inner-card h2 {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 16px;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .about-cta-inner-card p {
          font-size: 16.5px;
          color: #cbd5e1;
          line-height: 1.8;
          margin-bottom: 35px;
          max-width: 650px;
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
          padding: 16px 36px;
          background: #ffffff;
          color: #4f46e5;
          border-radius: 40px;
          font-weight: 700;
          font-size: 15px;
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
          padding: 16px 36px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border-radius: 40px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-about-cta-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #ffffff;
          transform: translateY(-3px);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
          .about-stats-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .about-hero-grid, .about-story-grid-pro, .about-mission-grid-pro, .about-values-grid-pro {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .about-hero-actions, .about-story-features-pro, .mission-tags-pro { justify-content: center; margin-left: auto; margin-right: auto; }
          .story-feature-pill { margin: 0 auto; }
          .about-hero-visual { display: none; }
          .about-stats-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
          .vertical-line-pro { left: 28px; }
          .timeline-3d-row { grid-template-columns: 50px 1fr !important; gap: 20px; }
          .timeline-3d-row.left .timeline-3d-card,
          .timeline-3d-row.right .timeline-3d-card { grid-column: 2 / 3 !important; }
          .timeline-node-pro { grid-column: 1 / 2 !important; margin: 0; width: 44px; height: 44px; font-size: 18px; }
          .about-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .about-cta-inner-card { padding: 40px 20px; }
          .about-cta-buttons-pro { flex-direction: column; }
        }

        @media (max-width: 640px) {
          .about-hero-title { font-size: 36px; }
          .about-mission-grid-pro, .about-values-grid-pro, .about-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default About;