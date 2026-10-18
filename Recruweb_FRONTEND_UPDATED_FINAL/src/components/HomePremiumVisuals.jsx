import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* ---------------------------------------------------------
   Mini 3D-style service icon scenes (pure CSS/SVG, no WebGL)
--------------------------------------------------------- */
export const ServiceIconScene = ({ type }) => {
  if (type === "target") {
    return (
      <div className="rwp-service-icon-scene">
        <div className="rwp-icon-base">
          <svg className="rwp-icon-glyph" width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#6366f1" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="5.5" stroke="#8b5cf6" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="2" fill="#4338ca" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#a5b4fc" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="rwp-icon-orbit rwp-orbit-target-1" />
        <div className="rwp-icon-orbit rwp-orbit-target-2" />
      </div>
    );
  }
  if (type === "payroll") {
    return (
      <div className="rwp-service-icon-scene">
        <div className="rwp-icon-base">
          <svg className="rwp-icon-glyph" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 3c-3.9 0-6.5 2.6-6.5 5.4C5.5 11 7 12 9 12.3c-2.7.4-4.5 1.6-4.5 4C4.5 19 7.4 21 12 21s7.5-2 7.5-4.7c0-2.4-1.8-3.6-4.5-4 2-.3 3.5-1.3 3.5-3.9C18.5 5.6 15.9 3 12 3Z" fill="url(#rwpCoinGrad)" stroke="#b45309" strokeWidth="0.6" />
            <text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#78350f">$</text>
            <defs>
              <linearGradient id="rwpCoinGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fde68a" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="rwp-icon-orbit rwp-orbit-coin-1" />
        <div className="rwp-icon-orbit rwp-orbit-coin-2" />
      </div>
    );
  }
  if (type === "hrms") {
    return (
      <div className="rwp-service-icon-scene">
        <div className="rwp-icon-base">
          <svg className="rwp-icon-glyph" width="34" height="34" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="14" rx="2.5" stroke="#6366f1" strokeWidth="1.5" />
            <path d="M6.5 14.5v-3M10.5 14.5v-6M14.5 14.5v-4M18.5 14.5v-2" stroke="#8b5cf6" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <div className="rwp-icon-orbit rwp-orbit-chart-1" />
        <div className="rwp-icon-orbit rwp-orbit-chart-2" />
      </div>
    );
  }
  return null;
};

/* ---------------------------------------------------------
   3D glowing globe for the Stats / HR Data Hub section
--------------------------------------------------------- */
export const StatsGlobe = () => (
  <div className="rwp-stats-globe-col">
    <div className="rwp-globe-stage">
      <div className="rwp-globe-glow" aria-hidden="true" />
      <div className="rwp-globe-ring rwp-globe-ring-1" aria-hidden="true" />
      <div className="rwp-globe-ring rwp-globe-ring-2" aria-hidden="true" />
      <div className="rwp-globe-sphere" aria-hidden="true" />
      <div className="rwp-globe-node n1" aria-hidden="true" />
      <div className="rwp-globe-node n2" aria-hidden="true" />
      <div className="rwp-globe-node n3" aria-hidden="true" />
      <div className="rwp-globe-node n4" aria-hidden="true" />
      <div className="rwp-globe-node n5" aria-hidden="true" />
    </div>
  </div>
);

/* ---------------------------------------------------------
   Small 3D-ish icons for the "How It Works" zebra timeline
--------------------------------------------------------- */
export const ZebraStepIcon = ({ index }) => {
  const icons = [
    // 01 — profile + plus (create account)
    <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="8.5" r="3.2" stroke="#6366f1" strokeWidth="1.6" />
      <path d="M4 19c0-3.3 2.7-5.5 6-5.5" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18" cy="17" r="4" fill="#eef2ff" stroke="#8b5cf6" strokeWidth="1.4" />
      <path d="M18 15.2v3.6M16.2 17h3.6" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>,
    // 02 — briefcase (post jobs)
    <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="11" rx="2.2" stroke="#6366f1" strokeWidth="1.6" />
      <path d="M8.5 8V6.5A2.5 2.5 0 0 1 11 4h2a2.5 2.5 0 0 1 2.5 2.5V8" stroke="#8b5cf6" strokeWidth="1.6" />
      <path d="M3 13h18" stroke="#a5b4fc" strokeWidth="1.4" />
    </svg>,
    // 03 — scanning candidate cards (review & shortlist)
    <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="12" height="15" rx="2" stroke="#6366f1" strokeWidth="1.5" />
      <circle cx="10" cy="10.5" r="2" stroke="#8b5cf6" strokeWidth="1.4" />
      <path d="M7 16.5c0-1.8 1.4-3 3-3s3 1.2 3 3" stroke="#8b5cf6" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 4v16" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 3" />
      <circle cx="18" cy="4" r="1.6" fill="#22c55e" />
    </svg>,
    // 04 — rocket (hire & onboard)
    <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2c3 2 4.5 5.5 4 10-1 .8-2 1.3-3 1.5v3.5l-1-1.5-1 1.5v-3.5c-1-.2-2-.7-3-1.5-.5-4.5 1-8 4-10Z" stroke="#6366f1" strokeWidth="1.5" fill="#eef2ff" />
      <circle cx="12" cy="9" r="1.6" fill="#8b5cf6" />
      <path d="M8 15l-2 3M16 15l2 3" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>,
  ];
  return <div className="rwp-zebra-icon">{icons[index] || icons[0]}<span className="rwp-zebra-flow-dot" style={{ animationDelay: `${index * 1.5}s` }} /></div>;
};

/* ---------------------------------------------------------
   AI core visual: candidates -> AI -> best match
--------------------------------------------------------- */
export const AiCoreFlow = () => (
  <div className="rwp-ai-core-wrap">
    <div className="rwp-ai-flow-row">
      <div className="rwp-ai-candidates">
        <span className="rwp-ai-chip"><span className="dot" />Candidate profile A</span>
        <span className="rwp-ai-chip"><span className="dot" />Candidate profile B</span>
        <span className="rwp-ai-chip"><span className="dot" />Candidate profile C</span>
      </div>
      <div className="rwp-ai-connector" aria-hidden="true" />
      <div className="rwp-ai-core">AI</div>
      <div className="rwp-ai-connector" aria-hidden="true" />
      <div className="rwp-ai-match-card">✓ Best match found</div>
    </div>
  </div>
);

/* ---------------------------------------------------------
   Cursor-tilt wrapper for testimonial glass cards
--------------------------------------------------------- */
export const TiltCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 6);
    rx.set(-py * 6);
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`${className} rwp-tilt-card`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: srx, rotateY: sry }}
    >
      {children}
    </motion.div>
  );
};

/* ---------------------------------------------------------
   Floating 3D-style rocket for the final CTA
--------------------------------------------------------- */
export const CtaRocket = () => (
  <div className="rwp-cta-rocket-wrap" aria-hidden="true">
    <div className="rwp-cta-rocket-glow" />
    <svg className="rwp-cta-rocket" viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="88" rx="16" ry="4" fill="#4c1d95" opacity="0.4" />
      <path d="M50 10c14 10 20 27 18 48-4 4-9 6.5-13 7.5v14l-5-7-5 7v-14c-4-1-9-3.5-13-7.5-2-21 4-38 18-48Z" fill="url(#rwpRocketGrad)" stroke="#c4b5fd" strokeWidth="1" />
      <circle cx="50" cy="40" r="7" fill="#1e1b4b" stroke="#67e8f9" strokeWidth="1.5" />
      <circle cx="50" cy="40" r="3" fill="#67e8f9" />
      <path d="M37 60l-9 12M63 60l9 12" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 78c-2 6-2 10 0 16 2-6 2-10 0-16Z" fill="#fbbf24" />
      <defs>
        <linearGradient id="rwpRocketGrad" x1="30" y1="10" x2="70" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0e7ff" />
          <stop offset="0.5" stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);
