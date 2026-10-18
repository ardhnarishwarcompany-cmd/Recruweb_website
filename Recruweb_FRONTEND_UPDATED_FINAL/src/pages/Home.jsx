/*
 * Recruweb redesign reminder: preserve the existing hero, content, and blue/purple color theme.
 * Only non-hero sections are upgraded with tactile CSS 3D scenes, glass layers, tilt, and scroll reveals.
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronRight, Rocket, Sparkles, Target, Users, Zap, BrainCircuit, Smartphone, Headphones, ShieldCheck, FileText, MessagesSquare } from "lucide-react";
import "./home-premium-visuals.css";
import { Link } from "react-router-dom";
const GlobeScene = lazy(() => import("../components/globe/GlobeScene"));
import InquiryPopup from "../components/InquiryPopup";

const heroVideo = "/media/recruweb-resources-hero_3e30a52e.mp4";
const aiVideo = "/media/recruweb-ai-hero-h264_7964c0c1.mp4";
const service3DImages = { target: "/media/recruweb-3d-target_23927d03.png", payroll: "/media/recruweb-3d-payroll_df9fe851.png", hrms: "/media/recruweb-3d-dashboard_99fd93cc.png", profile: "/media/recruweb-3d-target_23927d03.png", clock: "/media/recruweb-3d-payroll_df9fe851.png", globe: "/media/recruweb-3d-dashboard_99fd93cc.png", shield: "/media/recruweb-3d-ai-core_5413a4ff.png",
  // Dedicated, non-repeating icons for the "What We Offer" services grid
  talentAcquisition: "/media/service-talent-acquisition.png",
  payrollMgmt: "/media/service-payroll.png",
  hrmsSolutions: "/media/service-hrms.png",
  training: "/media/service-training.png",
  outsourcing: "/media/service-outsourcing.png",
  compliance: "/media/service-compliance.png",
  executiveSearch: "/media/service-executive-search.png",
  international: "/media/service-international.png",
  industrial: "/media/service-industrial.png",
};
const aiCore3DImage = "/media/recruweb-3d-ai-core_5413a4ff.png";
const rocket3DImage = "/media/recruweb-3d-rocket_582f7d05.png";
// Reuse already-live 3D artwork for deterministic first paint; the additional generated variants remain available for later art direction.
const profile3DImage = service3DImages.target;
const clock3DImage = service3DImages.payroll;
const miniGlobe3DImage = service3DImages.hrms;
const shieldDoc3DImage = aiCore3DImage;

// New premium 3D stat icons (hero-bottom stat cards)
const statHappyClientsImage = "/media/stat-happy-clients.png";
const statCitiesCoveredImage = "/media/stat-cities-covered.png";
const statPlacementTimeImage = "/media/stat-placement-time.png";
const statResumeDatabaseImage = "/media/stat-resume-database.png";
const statSuccessRateImage = "/media/stat-success-rate.png";
const shareRequirementsImage = "/media/share_requirement_3d.png";
const screeningSelectionImage = "/media/screening.png";

const services = [
  { icon: "🎯", visual: "talentAcquisition", title: "Talent Acquisition", description: "Strategic recruitment solutions to find perfect candidates for your organization." },
  { icon: "💰", visual: "payrollMgmt", title: "Payroll Management", description: "Streamlined payroll with accurate calculations and timely disbursements." },
  { icon: "📊", visual: "hrmsSolutions", title: "HRMS Solutions", description: "Comprehensive human resource management system for all your HR operations." },
  { icon: "📚", visual: "training", title: "Training & Development", description: "Empower your workforce with customized training and skill development." },
  { icon: "🤝", visual: "outsourcing", title: "HR Outsourcing", description: "Focus on core business while we handle your HR functions completely." },
  { icon: "⚖️", visual: "compliance", title: "Compliance & Advisory", description: "Stay compliant with labor laws and get expert HR guidance." },
  { icon: "👔", visual: "executiveSearch", title: "Executive Search", description: "Find top-level executives aligned with your culture and goals." },
  { icon: "🌐", visual: "international", title: "International Recruitment", description: "Access global talent pools with our extensive network." },
  { icon: "🏭", visual: "industrial", title: "Industrial Staffing", description: "Skilled and unskilled labor for manufacturing sectors." },
];

const stats = [
  { number: 500, suffix: "+", label: "Happy Clients", icon: "🏢", visual: statHappyClientsImage },
  { number: 10000, suffix: "+", label: "Successful Placements", icon: "👥", visual: profile3DImage },
  { number: 50, suffix: "+", label: "Cities Covered", icon: "🌍", visual: statCitiesCoveredImage },
  { number: 98, suffix: "%", label: "Success Rate", icon: "⭐", visual: statSuccessRateImage },
  { number: 48, suffix: "hrs", label: "Avg. Placement Time", icon: "⚡", visual: statPlacementTimeImage },
  { number: 10000, suffix: "+", label: "Resume Database", icon: "📄", visual: statResumeDatabaseImage },
];

const aiTools = [
  { visual: "/media/tool-jd-maker.png", title: "JD Maker", desc: "Create professional job descriptions in seconds", path: "/jd-maker" },
  { visual: "/media/tool-cv-maker.png", title: "CV Maker", desc: "Create professional resumes in minutes", path: "/cv-maker" },
  { visual: "/media/tool-cv-screening.png", title: "CV Screening", desc: "AI-powered resume analysis and ranking", path: "/cv-screening" },
  { visual: "/media/tool-resume-checker.png", title: "Resume Checker", desc: "Free instant ATS score with category breakdown", path: "/resume-checker" },
  { visual: "/media/tool-cover-letter.png", title: "Cover Letter Builder (AI)", desc: "Generate a tailored cover letter for any job", path: "/cover-letter-builder" },
  { visual: "/media/tool-resume-builder.png", title: "Resume Builder (AI)", desc: "Build a resume with templates and live ATS score", path: "/resume-builder" },
  { visual: "/media/tool-interview-scheduler.png", title: "AI Interview Scheduler", desc: "Smart scheduling with optimal slot suggestions", externalUrl: "https://ardhnarishwar-ai.hr-robo.recruweb.com/" },
];

const processSteps = [
  { number: "01", visual: shareRequirementsImage, title: "Share Requirements", description: "Tell us about your hiring needs and workforce requirements.", points: ["Specify job roles and openings", "Define experience and skills", "Set hiring timelines"] },
  { number: "02", visual: aiCore3DImage, title: "AI Matching", description: "Our AI finds the best candidates from our extensive database.", points: ["Instant resume matching", "Smart skill filtering", "Top talent ranking"] },
  { number: "03", visual: screeningSelectionImage, title: "Screening & Selection", description: "We shortlist and screen candidates for your review.", points: ["Rigorous evaluations", "Pre-vetted profiles", "Client review submissions"] },
  { number: "04", visual: rocket3DImage, title: "Deployment", description: "Onboard your new team members within the promised timeframe.", points: ["Offer management", "Joining tracking", "Fast workforce onboarding"] },
];

const clients = [
  { name: "Manufacturing", icon: "🏭", visual: "/media/industry-manufacturing.png", desc: "Industrial & Factory Staffing" },
  { name: "Construction", icon: "🏗️", visual: "/media/industry-construction.png", desc: "Engineers & Labor Force" },
  { name: "Healthcare", icon: "🏥", visual: "/media/industry-healthcare.png", desc: "Medical & Support Staff" },
  { name: "Hospitality", icon: "🏨", visual: "/media/industry-hospitality.png", desc: "Hotel & Restaurant Experts" },
  { name: "IT", icon: "💻", visual: aiCore3DImage, desc: "Tech & Software Talent" },
  { name: "Retail", icon: "🛒", visual: service3DImages.payroll, desc: "Store & Sales Workforce" },
];

const testimonials = [
  { text: "Recruweb transformed our HR operations. Their team is professional, efficient, and truly understands our unique needs. We have reduced our hiring time by 60%.", author: "Rajesh Kumar", position: "CEO, TechCorp India", rating: 5 },
  { text: "The recruitment process became seamless thanks to their expertise. We found exceptional talent within just two weeks. Highly recommended for any business!", author: "Priya Sharma", position: "HR Director, Global Solutions", rating: 5 },
  { text: "Outstanding payroll management service. They handle everything with precision and always on time. Their compliance expertise has saved us from potential legal issues.", author: "Amit Patel", position: "Founder, StartUp Ventures", rating: 5 },
  { text: "The HRMS solution they implemented has revolutionized how we manage our workforce. Real-time tracking and automated processes have boosted our productivity significantly.", author: "Sneha Reddy", position: "COO, Manufacturing Plus", rating: 5 },
];

function SectionTag({ children, ai = false }) {
  return <span className="section-tag"><span className={`tag-dot ${ai ? "ai" : ""}`} />{children}</span>;
}

function CardIcon3D({ children, image, className = "" }) {
  return <span className={`shared-3d-icon ${className}`}>{image ? <img src={image} alt="" /> : <span className="shared-3d-icon-glyph">{children}</span>}<i className="shared-3d-icon-shine" /></span>;
}

function Reveal({ children, className = "" }) {
  return <div className={`rw-reveal ${className}`}>{children}</div>;
}

function ServiceIconScene({ type }) {
  const image = service3DImages[type];
  if (image) return <div className={`service-icon-scene scene-${type} service-image-scene`} aria-hidden="true"><div className="scene-orbit orbit-a" /><div className="scene-orbit orbit-b" /><CardIcon3D image={image} className="service-art-icon" /></div>;
  return (
    <div className={`service-icon-scene scene-${type}`} aria-hidden="true">
      <div className="scene-disc" />
      <div className="scene-orbit orbit-a" /><div className="scene-orbit orbit-b" />
      {type === "target" && <Target className="scene-glyph" />}
      {type === "payroll" && <span className="scene-currency">$</span>}
      {type === "hrms" && <div className="scene-bars"><i /><i /><i /><i /></div>}
    </div>
  );
}

function AiCoreFlow() {
  return (
    <div className="ai-core-flow" aria-hidden="true">
      <div className="ai-chip-stack"><span>Candidate profile A</span><span>Candidate profile B</span><span>Candidate profile C</span></div>
      <div className="ai-connector" /><div className="ai-core">AI</div><div className="ai-connector" /><div className="ai-match"><Check size={15} /> Best match found</div>
    </div>
  );
}

function ProcessFloatingVisual({ index }) {
  const visuals = [
    { Icon: FileText, label: "Requirements", accent: "violet", mini: Users },
    { Icon: BrainCircuit, label: "AI Match", accent: "blue", mini: Sparkles },
    { Icon: ShieldCheck, label: "Verified", accent: "cyan", mini: Check },
    { Icon: Rocket, label: "Launch", accent: "purple", mini: Zap },
  ];
  const item = visuals[index] || visuals[0];
  const MainIcon = item.Icon;
  const MiniIcon = item.mini;
  return (
    <div className={`process-float-visual process-float-${item.accent}`} aria-hidden="true">
      <span className="pfv-orbit pfv-orbit-a" />
      <span className="pfv-orbit pfv-orbit-b" />
      <span className="pfv-particle pfv-particle-a" />
      <span className="pfv-particle pfv-particle-b" />
      <div className="pfv-platform"><i /><i /><i /></div>
      <div className="pfv-core"><span className="pfv-shine" /><MainIcon size={42} strokeWidth={1.8} /></div>
      <div className="pfv-mini"><MiniIcon size={16} /></div>
      <span className="pfv-label">{item.label}</span>
    </div>
  );
}

function TiltCard({ children }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return <div ref={ref} className="testimonial-card" style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }} onMouseMove={(event) => { const rect = ref.current?.getBoundingClientRect(); if (!rect) return; setTilt({ x: -((event.clientY - rect.top) / rect.height - .5) * 5, y: ((event.clientX - rect.left) / rect.width - .5) * 5 }); }} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>{children}</div>;
}

function Counter({ end, suffix, active }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const timer = window.setInterval(() => { start += Math.max(1, end / 70); if (start >= end) { setCount(end); window.clearInterval(timer); } else setCount(Math.floor(start)); }, 22);
    return () => window.clearInterval(timer);
  }, [active, end]);
  return <>{count.toLocaleString()}{suffix}</>;
}

export default function Home() {
  const [countersActive, setCountersActive] = useState(false);
  const [heroVideoMuted, setHeroVideoMuted] = useState(false);
  const statsRef = useRef(null);
  const heroVideoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setCountersActive(true), { threshold: .3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Pause the hero video once it scrolls out of view (saves CPU/GPU while scrolling).
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || !window.IntersectionObserver) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
      } else {
        video.pause();
      }
    }, { threshold: 0.1 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="recruweb-site">
      <InquiryPopup />
      <section className="rw-hero" id="home">
        <div className="rw-hero-grid" aria-hidden="true"></div>
        <div className="rw-hero-orbit rw-hero-orbit-a" aria-hidden="true"></div>
        <div className="rw-hero-orbit rw-hero-orbit-b" aria-hidden="true"></div>
        <div className="rw-hero-dots rw-hero-dots-left" aria-hidden="true"></div>
        <div className="rw-hero-dots rw-hero-dots-right" aria-hidden="true"></div>
        <div className="rw-hero-orb rw-orb-a" aria-hidden="true"></div>
        <div className="rw-hero-orb rw-orb-b" aria-hidden="true"></div>

        <div className="container rw-hero-container">
          <div className="rw-hero-copy">
            <div className="rw-eyebrow">
              <span className="rw-live-dot"></span>
              AI RECRUITMENT • HR TECHNOLOGY • WORKFORCE SOLUTIONS
            </div>
            <h1>
              Complete
              <span> HR &amp; Staffing</span>
              <strong> Solutions.</strong>
              <em> Faster hiring.</em>
              <strong> Better talent.</strong>
            </h1>
            <p>
              Recruweb Resources Pvt. Ltd. brings recruitment, AI screening,
              intelligent interviews and workforce solutions together in one
              powerful platform.
            </p>

            <div className="rw-hero-actions">
              <Link to="/get-started" className="rw-btn rw-btn-primary">
                Get Started <span>↗</span>
              </Link>
              <a href="#services" className="rw-btn rw-btn-ghost">
                Explore Features <span>◉</span>
              </a>
            </div>

            <div className="rw-hero-trust">
              <span><i>✓</i> AI-assisted hiring</span>
              <span><i>✓</i> End-to-end recruitment</span>
              <span><i>✓</i> Workforce solutions</span>
            </div>
          </div>

          <div className="rw-hero-media">
            <div className="rw-video-shell">
              <div className="rw-video-chrome">
                <span className="rw-chrome-dot"></span>
                <span className="rw-chrome-dot"></span>
                <span className="rw-chrome-dot"></span>
                <span className="rw-chrome-title">recruweb.ai / talent intelligence</span>
                <span className="rw-chrome-live">● LIVE</span>
              </div>
              <video
                ref={heroVideoRef}
                className="rw-hero-video"
                src="/images/recruweb-resources-hero.mp4"
                autoPlay
                muted={heroVideoMuted}
                playsInline
                preload="auto"
                onLoadedMetadata={() => {
                  const video = heroVideoRef.current;
                  if (!video) return;
                  video.muted = heroVideoMuted;
                  const attempt = video.play();
                  if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(() => {
                      video.muted = true;
                      setHeroVideoMuted(true);
                      video.play().catch(() => {});
                    });
                  }
                }}
                aria-label="Recruweb Resources Pvt. Ltd. promotional recruitment video with service audio"
              />
              <div className="rw-video-sheen" aria-hidden="true"></div>
              <button
                type="button"
                className="rw-hero-sound"
                onClick={() => {
                  const next = !heroVideoMuted;
                  setHeroVideoMuted(next);
                  if (heroVideoRef.current) {
                    heroVideoRef.current.muted = next;
                    if (!next) heroVideoRef.current.play().catch(() => {});
                  }
                }}
                data-cursor={heroVideoMuted ? "SOUND ON" : "MUTE"}
                aria-label={heroVideoMuted ? "Enable Recruweb hero video sound" : "Mute Recruweb hero video"}
              >
                <span>{heroVideoMuted ? "🔇" : "🔊"}</span>
                <strong>{heroVideoMuted ? "Enable sound" : "Sound on"}</strong>
                <i aria-hidden="true"><b></b><b></b><b></b><b></b></i>
              </button>
              <div className="rw-video-caption">
                <span className="rw-caption-pulse"></span>
                AI is matching the right skills to the right opportunity
              </div>
            </div>

            <div className="rw-float-card rw-float-score">
              <span className="rw-float-label">AI MATCH</span>
              <strong>94%</strong>
              <small>Candidate fit</small>
              <div className="rw-mini-bar"><i></i></div>
            </div>

            <div className="rw-float-card rw-float-status">
              <span className="rw-status-icon">✦</span>
              <div><strong>Interview ready</strong><small>AI screening complete</small></div>
            </div>
          </div>
        </div>

        <div className="rw-hero-bottom">
          <span>RECRUWEB RESOURCES PVT. LTD.</span>
          <div className="rw-scroll-line"><i></i></div>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </section>

      <section className="stats-section" ref={statsRef}>
        <div className="stats-particles">{["14%", "72%", "31%", "88%", "46%", "63%"].map((left, index) => <span key={left} style={{ left, animationDelay: `${index * .7}s` }} />)}</div>
        <div className="rw-container stats-orbit-layout">
          <div className="stats-card-column stats-card-column-left">{stats.slice(0, 3).map((stat, index) => <div className="stat-item stat-item-3d" key={stat.label} style={{ animationDelay: `${index * .14}s` }}><CardIcon3D image={stat.visual} className={`stat-icon-3d stat-icon-${index + 1}`} /><span className="stat-number"><Counter end={stat.number} suffix={stat.suffix} active={countersActive} /></span><span className="stat-label">{stat.label}</span><span className="stat-card-edge" /></div>)}</div>
          <Suspense fallback={<div className="stats-globe stats-globe-webgl3d" />}><GlobeScene /></Suspense>
          <div className="stats-card-column stats-card-column-right">{stats.slice(3).map((stat, index) => <div className="stat-item stat-item-3d" key={stat.label} style={{ animationDelay: `${(index + 3) * .14}s` }}><CardIcon3D image={stat.visual} className={`stat-icon-3d stat-icon-${index + 4}`} /><span className="stat-number"><Counter end={stat.number} suffix={stat.suffix} active={countersActive} /></span><span className="stat-label">{stat.label}</span><span className="stat-card-edge" /></div>)}</div>
        </div>
      </section>

      <section className="section services-section" id="services"><div className="rw-container"><Reveal className="section-header"><SectionTag>What We Offer</SectionTag><h2 className="section-title">All-in-One HR &amp; <span className="gradient-text">Recruitment Platform</span></h2><p className="section-subtitle">Empower your workforce with recruitment, onboarding, payroll, attendance, performance management and AI-driven HR automation.</p></Reveal><div className="services-grid">{services.map((service, index) => <Reveal className="service-card" key={service.title}><div className="service-card-number">0{index + 1}</div>{service.visual ? <ServiceIconScene type={service.visual} /> : <div className="service-icon-wrap"><CardIcon3D className="service-fallback-icon">{service.icon}</CardIcon3D></div>}<h3 className="service-title">{service.title}</h3><p className="service-description">{service.description}</p><a href="#contact" className="service-link">Learn More <ChevronRight size={16} /></a></Reveal>)}</div></div></section>

      <section className="section ai-tools-section" id="ai-tools">
        <div className="ai-grid-lines" aria-hidden="true" /><div className="ai-star-field" aria-hidden="true" />
        <div className="rw-container ai-tools-wrapper ai-tools-3d-layout">
          <Reveal className="ai-tools-content ai-tools-copy">
            <SectionTag ai>AI-Powered HR Solutions</SectionTag>
            <h2 className="section-title">Smart <span className="gradient-text">AI Solutions</span><br/>for Modern Workplaces</h2>
            <p className="section-subtitle">Leverage intelligent automation to accelerate recruitment, match better talent and build high-performing teams.</p>
            <div className="ai-actions"><Link to="/jd-maker" className="btn-hero-primary">Try AI Tools <ArrowRight size={18} /></Link><a href="#services" className="btn-ai-secondary">Explore Features <span>▶</span></a></div>
            <div className="ai-mini-stats"><span><b>10K+</b><small>Companies Trust Us</small></span><span><b>500K+</b><small>Successful Placements</small></span><span><b>98%</b><small>Client Satisfaction</small></span><span><b>24/7</b><small>AI Support Available</small></span></div>
          </Reveal>
          <div className="ai-stage-3d" aria-hidden="true">
            <div className="ai-orbit orbit-one"><i/><i/><i/></div>
            <div className="ai-orbit orbit-two"><i/><i/></div>
            <div className="ai-orbit orbit-three"><i/></div>
            <div className="ai-orbit-node node-a"/><div className="ai-orbit-node node-b"/><div className="ai-orbit-node node-c"/><div className="ai-orbit-node node-d"/>
            <div className="ai-float-card ai-float-a"><div className="mini-avatar avatar-one"/><span>BEST MATCH</span><b>96%</b><small>UI/UX Designer</small></div>
            <div className="ai-float-card ai-float-b"><div className="mini-avatar avatar-two"/><span>SHORTLISTED</span><b>93%</b><small>Product Manager</small></div>
            <div className="ai-float-card ai-float-c"><div className="mini-avatar avatar-three"/><span>GREAT FIT</span><b>90%</b><small>Frontend Developer</small></div>
            <div className="ai-float-card ai-float-d"><div className="mini-avatar avatar-four"/><span>INTERVIEW</span><b>88%</b><small>Marketing Lead</small></div>
            <div className="ai-cube-platform"><div className="platform-shadow"/><div className="platform-base"><div className="platform-ring ring-outer"/><div className="platform-ring ring-mid"/><div className="platform-ring ring-inner"/><div className="platform-core"/></div><div className="ai-beam"/><div className="ai-cube-halo"/><div className="ai-cube"><div className="ai-cube-face ai-face-front"><span>AI</span><i/><b/><em/></div><div className="ai-cube-face ai-face-right"><i/><b/><em/></div><div className="ai-cube-face ai-face-top"><i/><b/></div></div></div>
          </div>
          <div className="ai-tools-cards ai-tools-list">{aiTools.map((tool, index) => {
            const cardInner = <><span className="tool-index">0{index + 1}</span><CardIcon3D image={tool.visual} className="tool-icon" /><div className="tool-info"><h4>{tool.title}</h4><p>{tool.desc}</p></div><span className="tool-arrow"><ArrowRight size={18} /></span></>;
            return tool.externalUrl
              ? <a className="ai-tool-card" href={tool.externalUrl} target="_blank" rel="noopener noreferrer" key={tool.title}>{cardInner}</a>
              : <Link className="ai-tool-card" to={tool.path} key={tool.title}>{cardInner}</Link>;
          })}</div>
        </div>
      </section>

      <section className="section rw-offering-section"><div className="rw-container"><Reveal className="section-header"><SectionTag>Everything Recruweb Provides</SectionTag><h2 className="section-title">One Platform for <span className="gradient-text">Staffing + HR + Technology</span></h2><p className="section-subtitle">Recruweb Resources Pvt. Ltd. combines recruitment, workforce services, HR outsourcing, payroll, compliance and AI-powered HR technology under one connected platform.</p></Reveal><div className="rw-offering-grid">{[{ icon: "👥", visual: profile3DImage, title: "Service-Based", accent: "Solutions", cta: "Explore Services", items: ["HR Outsourcing Services", "Facility Management Services", "Recruitment Services", "Hospitality & Workforce Services", "Industry manpower and contractual hiring"] }, { icon: "🤖", visual: aiCore3DImage, title: "Product & SaaS", accent: "Solutions", cta: "Explore Products", items: ["HRMS SaaS platform", "AI Attendance System", "AI Candidate Interview System", "Employee Verification Portal", "Payroll & Compliance Automation", "Workforce Analytics"] }, { icon: "🎯", visual: service3DImages.target, title: "Recruitment & Hiring", accent: "Workflow", cta: "Explore Workflow", items: ["Job analysis and sourcing", "AI resume/CV screening", "NOVA AI video interviews", "AI proctored interviews", "Candidate/client submissions", "Joining and hiring tracking"] }].map((card, index) => <Reveal className={`rw-offering-card rw-offering-card-${index + 1}`} key={card.title}><div className="rw-card-art"><div className="rw-card-halo" /><CardIcon3D image={card.visual} className="rw-offering-icon" /></div><div className="rw-card-content"><h3>{card.title} <span className="gradient-text">{card.accent}</span></h3><ul>{card.items.slice(0, 4).map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul><a className="rw-card-cta" href="#contact"><span>{card.cta}</span><ArrowRight size={18} /></a></div><div className="card-orbit" /></Reveal>)}</div><div className="rw-benefits-panel rw-benefits-panel-v2">
  <div className="rw-benefits-stars" aria-hidden="true" />
  <div className="rw-benefits-wave rw-benefits-wave-a" aria-hidden="true" />
  <div className="rw-benefits-wave rw-benefits-wave-b" aria-hidden="true" />
  <div className="rw-benefits-left">
    <span className="rw-benefits-kicker"><Sparkles size={15} /> CLIENT BENEFITS</span>
    <h3>Why businesses <span className="gradient-text">choose Recruweb</span></h3>
    <div className="rw-benefits-line"><i /><i /><i /></div>
    <p className="rw-benefits-desc">Empowering your enterprise with scalable, AI-driven workforce operations.</p>
    <div className="rw-benefits-rw-stage" aria-hidden="true">
      <div className="rw-rw-orbit rw-rw-orbit-one" />
      <div className="rw-rw-orbit rw-rw-orbit-two" />
      <div className="rw-rw-core"><b>RW</b><span /></div>
      <div className="rw-rw-base"><i /><i /></div>
    </div>
  </div>
  <div className="rw-benefits-list rw-benefits-list-v2">
    {[
      [Users, "One company for recruitment + HR + payroll + compliance + technology"],
      [Zap, "Fast hiring commitment and workforce deployment"],
      [BrainCircuit, "AI-enabled HR operations and interview workflows"],
      [Smartphone, "Mobile-friendly HRMS and centralized HR operations"],
      [Headphones, "Free replacement support on selected recruitment plans"],
      [ShieldCheck, "Dedicated support and scalable workforce solutions"],
      [FileText, "Operational HR support, documentation and joining management"],
      [MessagesSquare, "Enterprise and bulk-hiring commercial discussions"]
    ].map(([Icon, benefit], index) => <span className={`rw-benefit-card rw-benefit-card-${index + 1}`} key={benefit}>
      <em><Icon size={31} strokeWidth={1.7} /></em><strong>{benefit}</strong><b><Check size={13} /></b>
    </span>)}
  </div>
</div><div className="rw-compliance-grid">{[{ icon: "🛡️", visual: "/media/card-policy-compliance.png", title: "Policy &", accent: "Compliance", text: "Account security, candidate-data handling, privacy, cookies, HR/compliance operations and responsible use are fully governed by published policies.", link: "Read Terms & Privacy" }, { icon: "📋", visual: service3DImages.hrms, title: "Commercial", accent: "Terms", text: "Applicable plans use professional agreement, token, payment, replacement and subscription terms subject to statutory taxes and GST.", link: "View Pricing & Commercials" }, { icon: "🔐", visual: "/media/card-interview-proctoring.png", title: "Interview &", accent: "Proctoring", text: "AI interview scoring is advisory. Authorized reviewers make final selections after assessing technical performance and proctoring logs.", link: "Access Your Portal" }].map((card, index) => <article className={`rw-compliance-card rw-compliance-card-${index + 1}`} key={card.title}><div className="rw-compliance-shine" /><div className="rw-compliance-top"><div className="rw-compliance-art"><CardIcon3D image={card.visual} className="rw-compliance-icon-wrap" /></div><div><h4>{card.title} <span className="gradient-text">{card.accent}</span></h4><p>{card.text}</p></div></div><a href="#contact"><span>{card.link}</span><ArrowRight size={16} /></a></article>)}</div></div></section>

      <section className="section process-zebra-section" id="process"><div className="rw-container"><Reveal className="section-header"><SectionTag>Simple Process</SectionTag><h2 className="section-title">How It <span className="gradient-text">Works</span></h2><p className="section-subtitle">Get workforce within a week with our streamlined 4-step process.</p></Reveal><div className="zebra-timeline-container"><div className="zebra-center-line" />{processSteps.map((step, index) => <Reveal className={`zebra-step-row ${index % 2 === 0 ? "left-side" : "right-side"}`} key={step.number}><div className="zebra-card"><div className="zebra-icon">{index === 3 ? <CardIcon3D image={rocket3DImage} className="process-3d-icon" /> : <CardIcon3D image={step.visual} className="process-3d-icon" />}</div><div className="zebra-number">{step.number}</div><h3 className="zebra-title">{step.title}</h3><p className="zebra-desc">{step.description}</p><div className="zebra-divider" /><ul className="zebra-checklist">{step.points.map((point) => <li key={point}><Check size={14} />{point}</li>)}</ul></div><div className="zebra-node"><span>{step.number}</span></div><div className="zebra-empty-space"><ProcessFloatingVisual index={index} /></div></Reveal>)}</div></div></section>

      <section className="section industries-upgraded-section"><div className="industries-glow" /><div className="rw-container industries-upgraded-wrapper"><Reveal className="industries-info-side"><SectionTag>Our Expertise</SectionTag><h2 className="section-title">Industries <span className="gradient-text">We Serve</span></h2><p className="section-subtitle">We provide agile, scalable, and compliant workforce solutions across diverse sectors throughout India.</p><div className="industries-badge-pill"><Rocket size={15} /> Trusted across 50+ Cities</div></Reveal><div className="industries-cards-grid">{clients.map((item, index) => <Reveal className="industry-pro-card" key={item.name}><div className="industry-card-index">0{index + 1}</div><CardIcon3D image={item.visual} className="industry-pro-iconbox" /><h3>{item.name}</h3><p>{item.desc}</p><div className="industry-card-arrow">→</div><div className="industry-depth" /></Reveal>)}</div></div></section>

      <section className="section testimonials-marquee-section"><div className="rw-container"><Reveal className="section-header"><SectionTag>Testimonials</SectionTag><h2 className="section-title">What Clients <span className="gradient-text">Say</span></h2><p className="section-subtitle">Don't just take our word for it. Hear from businesses we've helped transform.</p></Reveal></div><div className="marquee-wrapper"><div className="marquee-track">{[...testimonials, ...testimonials].map((testimonial, index) => <TiltCard key={`${testimonial.author}-${index}`}><div className="testimonial-header"><div className="testimonial-rating">{Array.from({ length: testimonial.rating }).map((_, i) => <span key={i}>★</span>)}</div><span className="testimonial-icon">❝</span></div><p className="testimonial-text">{testimonial.text}</p><div className="testimonial-author"><CardIcon3D className="author-avatar author-avatar-3d">{testimonial.author.charAt(0)}</CardIcon3D><div className="author-info"><h4>{testimonial.author}</h4><span>{testimonial.position}</span></div></div></TiltCard>)}</div></div></section>

      <section className="cta-section-pro" id="contact"><div className="cta-bg-pro"><div className="cta-gradient-pro" /><div className="cta-grid-mark" /><div className="cta-shapes-pro"><div className="cta-shape-pro shape-1-pro" /><div className="cta-shape-pro shape-2-pro" /></div><div className="cta-rocket"><div className="rocket-glow" /><img src={rocket3DImage} alt="" /></div></div><div className="rw-container cta-wrapper-pro"><Reveal className="cta-content-pro"><span className="cta-badge-pill"><Sparkles size={14} /> Ready For Growth</span><h2>Ready to Transform <span className="gradient-text">Your HR?</span></h2><p>Partner with Recruweb for all your human resource needs. From recruitment to payroll, we've got you covered. Get workforce within a week.</p><div className="cta-buttons-pro"><a href="#contact" className="btn-cta-primary">Get Started Now <ArrowRight size={18} /></a><a href="#jobs" className="btn-cta-secondary">Post a Job</a></div></Reveal><div className="cta-stats-pro-grid"><div className="cta-stat-pro-card"><span>24/7</span><small>Dedicated Support</small></div><div className="cta-stat-pro-card"><span>1 Week</span><small>Fast Delivery</small></div><div className="cta-stat-pro-card"><span>100%</span><small>Fully Compliant</small></div></div></div></section>

    </div>
  );
}