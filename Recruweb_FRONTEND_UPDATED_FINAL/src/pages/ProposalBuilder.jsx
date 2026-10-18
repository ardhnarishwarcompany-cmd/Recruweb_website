import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download, FileText, Plus, Save, Trash2, Printer, Sparkles, Globe2,
  IndianRupee, Users, CheckCircle2, ArrowRight, RefreshCw, Building2
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import "./ProposalBuilder.css";

const STORAGE_KEY = "recruweb_proposal_draft_v1";

const RECRUITMENT_PLANS = [
  { id: "premium", badge: "Best Value", recommended: true, name: "Premium Recruitment Partnership", price: "8.33%", priceNote: "of Annual CTC · approx. 1 month's salary",
    features: [{ label: "Closure target", value: "Within 7 working days" }, { label: "Replacement", value: "4 months FREE" }, { label: "Commitment Charges", value: "₹5,000" }, { label: "HRMS", value: "Free 4 months" }], bestFor: "Corporate, IT, growing & specialized hiring" },
  { id: "standard", badge: "Balanced", recommended: false, name: "Standard Recruitment Partnership", price: "20 days", priceNote: "candidate salary · reduced hiring cost model",
    features: [{ label: "Closure target", value: "Within 7 working days" }, { label: "Replacement", value: "3 months FREE" }, { label: "Commitment Charges", value: "₹5,000 adjustable" }, { label: "HRMS", value: "Free 3 months" }], bestFor: "Companies seeking cost efficiency + support" },
  { id: "startup", badge: "Startup Friendly", recommended: false, name: "Startup Recruitment Partnership", price: "15 days", priceNote: "candidate salary · lowest recruitment fee",
    features: [{ label: "Closure target", value: "Within 7 working days" }, { label: "Replacement", value: "2 months FREE" }, { label: "Commitment Charges", value: "₹5,000 adjustable" }, { label: "HRMS", value: "Free 2 months" }], bestFor: "Startups, SMEs & early-stage organizations" },
];

const AI_PRODUCTS = [
  { name: "AI Automated Attendance System", mrp: "₹499 / employee / month", offer: "₹99 / employee / month", features: ["Geo-tagging", "Geo-fencing", "Mobile attendance", "Shift management", "Real-time reports"] },
  { name: "AI Candidate Interview System", mrp: "₹299 / candidate", offer: "₹99 / week", features: ["AI screening", "AI scoring", "Interview reports", "HR recommendation engine"] },
  { name: "Employee Verification Portal", mrp: "₹1,000 / employee", offer: "₹999 / month · unlimited", features: ["Document verification", "ID verification", "Employment verification", "Background workflow"] },
  { name: "Standalone HRMS", mrp: "₹1,000 / employee / month", offer: "₹299 / employee / month", features: ["Attendance", "Leave", "Payroll support", "Employee database", "Reports & analytics"] },
];

const MARKET_COMPARISON = [
  { service: "Recruitment Premium", market: "Standard market rate", recruweb: "8.33% Annual CTC" },
  { service: "Recruitment Standard", market: "25 days salary", recruweb: "20 days salary" },
  { service: "Recruitment Startup", market: "25 days salary", recruweb: "15 days salary" },
  { service: "HR Technology Starter", market: "₹10,000 / month", recruweb: "₹2,000 / candidate" },
  { service: "AI Attendance", market: "₹499 / employee", recruweb: "₹99 / employee" },
  { service: "AI Interview", market: "₹299 / candidate", recruweb: "₹99 / week" },
  { service: "Verification Portal", market: "₹1,000 / employee", recruweb: "₹999 / month · unlimited" },
  { service: "HRMS Standalone", market: "₹1,000 / employee", recruweb: "₹299 / employee" },
];

const SEVEN_DAY_STEPS = [
  { num: "01", title: "Requirement", desc: "JD intake, role scoping and mandate alignment" },
  { num: "02", title: "Sourcing", desc: "Multi-channel candidate sourcing across the Recruweb network" },
  { num: "03", title: "Screening", desc: "AI-assisted CV screening and recruiter shortlisting" },
  { num: "04", title: "Interview", desc: "Structured interviews with AI scoring and reports" },
  { num: "05", title: "Joining", desc: "Offer, documentation and onboarding coordination" },
];

const FULL_SLIDES = [
  { src: "/images/proposal/slide-cover.jpg", alt: "Cover" },
  { src: "/images/proposal/slide-ecosystem.jpg", alt: "Ecosystem" },
  { src: "/images/proposal/slide-plans.jpg", alt: "Plans" },
  { src: "/images/proposal/slide-hr-outsource.jpg", alt: "HR Outsourcing" },
  { src: "/images/proposal/slide-hr-tech.jpg", alt: "HR Tech" },
  { src: "/images/proposal/slide-ai-products.jpg", alt: "AI Products" },
  { src: "/images/proposal/slide-7day.jpg", alt: "7-day process" },
  { src: "/images/proposal/slide-why.jpg", alt: "Why partner" },
  { src: "/images/proposal/slide-closing.jpg", alt: "Closing" },
];

const TEMPLATES = {
  recruitment: {
    label: "Recruitment & Talent Acquisition", service: "Permanent Recruitment",
    summary: "End-to-end sourcing, screening, shortlisting. Premium 8.33% / Standard 20 days / Startup 15 days — 7-day closure.",
    deliverables: ["Requirement discovery & JD alignment", "Multi-channel sourcing & screening", "AI-assisted shortlisting", "Offer / joining coordination", "Replacement guarantee", "Complimentary HRMS"],
    showPlans: true, showAiProducts: false,
  },
  remote: {
    label: "Global Remote Staffing", service: "Remote Staffing",
    summary: "Remote staffing for Indian and international talent within approved budget.",
    deliverables: ["Role & skill mapping", "Indian + global talent sourcing", "Screening & interview support", "Onboarding coordination"],
    showPlans: false, showAiProducts: false,
  },
  hrms: {
    label: "HRMS & Workforce Solutions", service: "HRMS / HR Operations",
    summary: "HR operations and AI-powered products at Recruweb pricing.",
    deliverables: ["Process discovery", "AI Attendance / Interview / Verification", "Standalone or integrated HRMS", "Workforce reporting"],
    showPlans: false, showAiProducts: true,
  },
  full: {
    label: "Full Client Proposal", service: "Complete Workforce Ecosystem",
    summary: "Complete commercial proposal — recruitment, HR outsourcing, payroll, compliance and AI technology under one ecosystem.",
    deliverables: ["Recruitment partnership", "Enterprise HR outsourcing", "HR Technology & SaaS", "AI products", "HRMS", "7-day pipeline", "Single partnership"],
    showPlans: true, showAiProducts: true,
  },
};

const blankRole = () => ({ role: "", location: "", headcount: 1, workMode: "Remote", budget: "" });

const defaultProposal = {
  template: "full", clientName: "", companyName: "", clientEmail: "", clientPhone: "",
  proposalTitle: "Complete Workforce Ecosystem Proposal", validUntil: "", preparedFor: "", objective: "",
  service: TEMPLATES.full.service, globalScope: true, includePayment: true,
  paymentStructure: "Commercials follow the published Recruweb partnership tiers and product pricing. Final fees and milestones will be mutually agreed before engagement.",
  currency: "INR", roles: [blankRole()], deliverables: TEMPLATES.full.deliverables, notes: "",
  terms: "This proposal is indicative and subject to final scope confirmation, commercial approval and mutually agreed terms.",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function safeText(value) {
  return String(value || "").trim();
}

function loadImageAsDataUrl(src) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      try {
        var c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        resolve({ dataUrl: c.toDataURL("image/jpeg", 0.93), w: img.naturalWidth, h: img.naturalHeight });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = function () { reject(new Error("Failed to load " + src)); };
    img.src = src;
  });
}

async function captureElWide(el, targetWidthPx, bg) {
  if (!el) return null;
  targetWidthPx = targetWidthPx || 1400;
  bg = bg || "#ffffff";
  var prev = { width: el.style.width, minWidth: el.style.minWidth, maxWidth: el.style.maxWidth, boxSizing: el.style.boxSizing };
  el.style.boxSizing = "border-box";
  el.style.width = targetWidthPx + "px";
  el.style.minWidth = targetWidthPx + "px";
  el.style.maxWidth = targetWidthPx + "px";
  await new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });
  try {
    var canvas = await html2canvas(el, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: bg, logging: false,
      width: targetWidthPx, windowWidth: targetWidthPx,
    });
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.95), w: canvas.width, h: canvas.height };
  } finally {
    el.style.width = prev.width;
    el.style.minWidth = prev.minWidth;
    el.style.maxWidth = prev.maxWidth;
    el.style.boxSizing = prev.boxSizing;
  }
}

async function captureBlock(el, scale) {
  if (!el) return null;
  scale = scale || 2;
  var canvas = await html2canvas(el, {
    scale: scale, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", logging: false,
  });
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), w: canvas.width, h: canvas.height };
}

function ProposalBuilder(props) {
  var pdfMode = props && props.pdfMode ? props.pdfMode : false;
  var _proposal = useState(defaultProposal);
  var proposal = _proposal[0];
  var setProposal = _proposal[1];
  var _dl = useState(false);
  var isDownloading = _dl[0];
  var setIsDownloading = _dl[1];
  var previewRef = useRef(null);
  var headerRef = useRef(null);
  var bannerRef = useRef(null);
  var footerRef = useRef(null);

  useEffect(function () {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProposal(Object.assign({}, defaultProposal, JSON.parse(saved)));
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(function () {
    if (pdfMode) return;
    var future = new Date(Date.now() + 15 * 86400000);
    setProposal(function (c) {
      return c.validUntil ? c : Object.assign({}, c, { validUntil: future.toISOString().slice(0, 10) });
    });
  }, [pdfMode]);

  var template = TEMPLATES[proposal.template] || TEMPLATES.full;
  var isFull = proposal.template === "full";
  var totalPeople = useMemo(function () {
    return proposal.roles.reduce(function (s, r) { return s + Math.max(0, Number(r.headcount) || 0); }, 0);
  }, [proposal.roles]);
  var proposalId = useMemo(function () {
    var s = new Date();
    return "RWR-" + s.getFullYear() + String(s.getMonth() + 1).padStart(2, "0") + "-" + String(Math.floor(1000 + Math.random() * 9000));
  }, []);

  function update(key, value) {
    setProposal(function (c) {
      var n = Object.assign({}, c);
      n[key] = value;
      return n;
    });
  }

  function chooseTemplate(key) {
    var selected = TEMPLATES[key];
    if (!selected) return;
    setProposal(function (c) {
      return Object.assign({}, c, {
        template: key,
        service: selected.service,
        deliverables: selected.deliverables,
        objective: c.objective || selected.summary,
        proposalTitle: key === "full" ? "Complete Workforce Ecosystem Proposal" : (c.proposalTitle || "Talent & Workforce Solution Proposal"),
        roles: c.roles && c.roles.length ? c.roles : [blankRole()],
      });
    });
  }

  function updateRole(index, key, value) {
    setProposal(function (c) {
      return Object.assign({}, c, {
        roles: c.roles.map(function (r, i) {
          if (i !== index) return r;
          var nr = Object.assign({}, r);
          nr[key] = value;
          return nr;
        }),
      });
    });
  }

  function addRole() { update("roles", proposal.roles.concat([blankRole()])); }
  function removeRole(index) {
    update("roles", proposal.roles.length === 1 ? [blankRole()] : proposal.roles.filter(function (_, i) { return i !== index; }));
  }
  function saveDraft() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposal));
    toast.success("Draft saved.");
  }
  function resetDraft() {
    localStorage.removeItem(STORAGE_KEY);
    setProposal(Object.assign({}, defaultProposal, { validUntil: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10) }));
    toast.success("Reset.");
  }

  async function downloadSectionPdf(safeName) {
    var root = previewRef.current;
    if (!root) return;
    var selector = ".paper-top-line, .paper-header, .paper-cover, .paper-client-banner, .paper-highlight-grid, .paper-section, .paper-commercial, .paper-footer";
    var nodes = Array.from(root.querySelectorAll(selector)).filter(function (el) {
      var r = el.getBoundingClientRect();
      return r.width > 2 && r.height > 2;
    });
    var pdf = new jsPDF("p", "mm", "a4");
    var pageW = 210, pageH = 297, margin = 10;
    var usableW = pageW - margin * 2;
    var usableH = pageH - margin * 2;
    var y = margin;
    for (var i = 0; i < nodes.length; i++) {
      var cap = await captureBlock(nodes[i], 2);
      if (!cap) continue;
      var blockH = (cap.h * usableW) / cap.w;
      var drawW = usableW, drawH = blockH;
      if (drawH > usableH) {
        var sc = usableH / drawH;
        drawH = usableH;
        drawW = usableW * sc;
      }
      if (y + drawH > pageH - margin) {
        pdf.addPage();
        y = margin;
      }
      var x = margin + (usableW - drawW) / 2;
      pdf.addImage(cap.dataUrl, "JPEG", x, y, drawW, drawH, undefined, "FAST");
      y += drawH + 3;
    }
    pdf.save("Recruweb-Proposal-" + safeName + ".pdf");
  }

  async function downloadPDF() {
    setIsDownloading(true);
    var safeName = safeText(proposal.companyName || proposal.clientName || "Client").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "Client";
    try {
      if (isFull) {
        var pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        var pageW = pdf.internal.pageSize.getWidth();
        var pageH = pdf.internal.pageSize.getHeight();
        var n = FULL_SLIDES.length;
        var headerCap = await captureElWide(headerRef.current, 1400, "#ffffff");
        var bannerCap = await captureElWide(bannerRef.current, 1400, "#eef2ff");
        var footerCap = await captureElWide(footerRef.current, 1400, "#0f172a");
        var headerMm = headerCap ? Math.min(16, (headerCap.h / headerCap.w) * pageW) : 0;
        var bannerMm = bannerCap ? Math.min(12, (bannerCap.h / bannerCap.w) * pageW) : 0;
        var footerMm = footerCap ? Math.min(14, (footerCap.h / footerCap.w) * pageW) : 0;
        var firstTop = headerMm + bannerMm;
        var lastBottom = footerMm;
        for (var i = 0; i < n; i++) {
          if (i > 0) pdf.addPage("a4", "landscape");
          var isFirst = i === 0;
          var isLast = i === n - 1;
          var top = isFirst ? firstTop : 0;
          var bottom = isLast ? lastBottom : 0;
          var imgH = pageH - top - bottom;
          if (isFirst) {
            if (headerCap) pdf.addImage(headerCap.dataUrl, "JPEG", 0, 0, pageW, headerMm, undefined, "FAST");
            if (bannerCap) pdf.addImage(bannerCap.dataUrl, "JPEG", 0, headerMm, pageW, bannerMm, undefined, "FAST");
          }
          try {
            var slide = await loadImageAsDataUrl(FULL_SLIDES[i].src);
            pdf.addImage(slide.dataUrl, "JPEG", 0, top, pageW, imgH, undefined, "FAST");
          } catch (err) {
            console.warn("Slide failed", FULL_SLIDES[i].src, err);
            pdf.setFontSize(12);
            pdf.setTextColor(100, 116, 139);
            pdf.text(FULL_SLIDES[i].alt || ("Slide " + (i + 1)), pageW / 2, top + imgH / 2, { align: "center" });
          }
          if (isLast && footerCap) {
            pdf.addImage(footerCap.dataUrl, "JPEG", 0, pageH - footerMm, pageW, footerMm, undefined, "FAST");
          }
        }
        pdf.save("Recruweb-Proposal-" + safeName + ".pdf");
        toast.success("Full proposal PDF downloaded.");
      } else {
        await downloadSectionPdf(safeName);
        toast.success("Proposal PDF downloaded (no mid-page cuts).");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF. Try Print → Save as PDF.");
    } finally {
      setIsDownloading(false);
    }
  }

  function printProposal() { window.print(); }

  function renderPlans() {
    return (
      <div className="paper-section">
        <h3>Recruitment partnership plans</h3>
        <div className="paper-plans-grid">
          {RECRUITMENT_PLANS.map(function (plan) {
            return (
              <div key={plan.id} className={"paper-plan-card" + (plan.recommended ? " recommended" : "")}>
                <div className="plan-badge-row">
                  <span className="plan-badge">{plan.badge}</span>
                  {plan.recommended ? <span className="plan-rec">Recommended</span> : null}
                </div>
                <strong className="plan-name">{plan.name}</strong>
                <div className="plan-price">{plan.price}</div>
                <div className="plan-price-note">{plan.priceNote}</div>
                <ul className="plan-features">
                  {plan.features.map(function (f, i) {
                    return <li key={i}><span>{f.label}</span><b>{f.value}</b></li>;
                  })}
                </ul>
                <div className="plan-bestfor">Best for: {plan.bestFor}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderAiProducts() {
    return (
      <div className="paper-section">
        <h3>AI &amp; HR products</h3>
        <div className="paper-ai-grid">
          {AI_PRODUCTS.map(function (prod, i) {
            return (
              <div key={i} className="paper-ai-card">
                <strong>{prod.name}</strong>
                <div className="ai-pricing">
                  <span className="mrp">MRP: {prod.mrp}</span>
                  <span className="offer">Recruweb: {prod.offer}</span>
                </div>
                <ul>
                  {prod.features.map(function (f, j) {
                    return <li key={j}><CheckCircle2 size={12} /> {f}</li>;
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderComparison() {
    return (
      <div className="paper-section">
        <h3>Market price vs Recruweb offer</h3>
        <table className="paper-table comparison-table">
          <thead><tr><th>Service</th><th>Market / MRP</th><th>Recruweb</th></tr></thead>
          <tbody>
            {MARKET_COMPARISON.map(function (row, i) {
              return <tr key={i}><td>{row.service}</td><td>{row.market}</td><td className="rec-price">{row.recruweb}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderSevenDay() {
    return (
      <div className="paper-section">
        <h3>From requirement to joining — in seven days</h3>
        <div className="paper-steps">
          {SEVEN_DAY_STEPS.map(function (s) {
            return (
              <div key={s.num} className="paper-step">
                <span className="step-num">{s.num}</span>
                <div><strong>{s.title}</strong><p>{s.desc}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={"proposal-page" + (pdfMode ? " proposal-pdf-page" : "")}>
      {!pdfMode && (
        <header className="proposal-hero">
          <div className="proposal-hero-orb orb-one" />
          <div className="proposal-hero-orb orb-two" />
          <div className="proposal-hero-content">
            <div className="proposal-eyebrow"><Sparkles size={15} /> Recruweb Proposal Studio</div>
            <h1>Build a client-ready proposal <span>in minutes.</span></h1>
            <p>Full template = PPT slides. Other templates = section PDF without mid-page cuts.</p>
            <div className="proposal-hero-actions">
              <button type="button" className="proposal-primary-btn" onClick={downloadPDF} disabled={isDownloading}>
                <Download size={17} /> {isDownloading ? "Generating PDF…" : "Download PDF"}
              </button>
              <Link to="/services" className="proposal-secondary-btn">Explore Services <ArrowRight size={17} /></Link>
            </div>
          </div>
          <div className="proposal-floating-card">
            <div className="mini-icon"><FileText size={20} /></div>
            <div><strong>HR-ready document</strong><span>No mid-page cuts</span></div>
            <CheckCircle2 size={22} />
          </div>
        </header>
      )}

      <main className="proposal-workspace">
        <section className="proposal-builder-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">01 · Configure</span>
              <h2>Proposal Builder</h2>
              <p>PDF builds section-by-section so content is never sliced mid-card.</p>
            </div>
            <div className="builder-actions">
              <button type="button" className="ghost-btn" onClick={saveDraft}><Save size={16} /> Save Draft</button>
              <button type="button" className="ghost-btn" onClick={resetDraft}><RefreshCw size={16} /> Reset</button>
            </div>
          </div>

          <div className="template-grid four">
            {Object.entries(TEMPLATES).map(function (entry) {
              var key = entry[0], item = entry[1];
              return (
                <button key={key} type="button" className={"template-card" + (proposal.template === key ? " selected" : "")} onClick={function () { chooseTemplate(key); }}>
                  <span>{key === "remote" ? <Globe2 size={19} /> : key === "hrms" ? <Users size={19} /> : key === "full" ? <Building2 size={19} /> : <Sparkles size={19} />}</span>
                  <strong>{item.label}</strong>
                  <small>{item.summary.slice(0, 75)}…</small>
                </button>
              );
            })}
          </div>

          <div className="form-section">
            <div className="section-title"><span>Client &amp; proposal details</span><small>Shown on the proposal.</small></div>
            <div className="form-grid two">
              <label>Client name<input value={proposal.clientName} onChange={function (e) { update("clientName", e.target.value); }} placeholder="e.g. Priya Sharma" /></label>
              <label>Company name<input value={proposal.companyName} onChange={function (e) { update("companyName", e.target.value); }} placeholder="e.g. Acme Technologies" /></label>
              <label>Email<input type="email" value={proposal.clientEmail} onChange={function (e) { update("clientEmail", e.target.value); }} placeholder="client@company.com" /></label>
              <label>Phone<input value={proposal.clientPhone} onChange={function (e) { update("clientPhone", e.target.value); }} placeholder="+91 …" /></label>
              <label className="full">Proposal title<input value={proposal.proposalTitle} onChange={function (e) { update("proposalTitle", e.target.value); }} /></label>
              <label>Valid until<input type="date" value={proposal.validUntil} onChange={function (e) { update("validUntil", e.target.value); }} /></label>
              <label>Prepared for<input value={proposal.preparedFor} onChange={function (e) { update("preparedFor", e.target.value); }} placeholder="Decision maker / HR team" /></label>
              <label className="full">Business objective<textarea value={proposal.objective} onChange={function (e) { update("objective", e.target.value); }} placeholder={template.summary} rows={3} /></label>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title"><span>Service scope</span></div>
            <div className="scope-row">
              <label>Primary service
                <select value={proposal.service} onChange={function (e) { update("service", e.target.value); }}>
                  <option>Permanent Recruitment</option><option>Executive Search</option><option>Contract Staffing</option>
                  <option>Temporary Staffing</option><option>Remote Staffing</option><option>HRMS / HR Operations</option>
                  <option>Workforce Management</option><option>Complete Workforce Ecosystem</option>
                </select>
              </label>
              <label>Currency
                <select value={proposal.currency} onChange={function (e) { update("currency", e.target.value); }}>
                  <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option>
                </select>
              </label>
            </div>
            <div className="deliverable-grid">
              {proposal.deliverables.map(function (item, index) {
                return <div key={item + "-" + index} className="deliverable-chip"><CheckCircle2 size={15} /> {item}</div>;
              })}
            </div>
          </div>

          {!isFull && (
            <div className="form-section">
              <div className="section-title"><span>Staffing plan</span></div>
              <div className="role-table-wrap">
                <table className="role-table">
                  <thead><tr><th>Role</th><th>Location</th><th>HC</th><th>Mode</th><th>Budget</th><th /></tr></thead>
                  <tbody>
                    {proposal.roles.map(function (role, index) {
                      return (
                        <tr key={index}>
                          <td><input value={role.role} onChange={function (e) { updateRole(index, "role", e.target.value); }} placeholder="Role" /></td>
                          <td><input value={role.location} onChange={function (e) { updateRole(index, "location", e.target.value); }} placeholder="Location" /></td>
                          <td><input type="number" min="1" value={role.headcount} onChange={function (e) { updateRole(index, "headcount", e.target.value); }} /></td>
                          <td><select value={role.workMode} onChange={function (e) { updateRole(index, "workMode", e.target.value); }}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></td>
                          <td><input value={role.budget} onChange={function (e) { updateRole(index, "budget", e.target.value); }} placeholder="Budget" /></td>
                          <td><button type="button" className="icon-delete" onClick={function () { removeRole(index); }}><Trash2 size={16} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button type="button" className="add-role-btn" onClick={addRole}><Plus size={16} /> Add role</button>
              <div className="plan-stat"><Users size={17} /> Headcount: <strong>{totalPeople}</strong></div>
            </div>
          )}

          <div className="form-section">
            <div className="section-title"><span>Payment · notes · terms</span></div>
            <label className="toggle-row">
              <input type="checkbox" checked={proposal.includePayment} onChange={function (e) { update("includePayment", e.target.checked); }} />
              <span className="fake-toggle" /><b>Include payment structure</b>
            </label>
            {proposal.includePayment ? <textarea className="wide-textarea" value={proposal.paymentStructure} onChange={function (e) { update("paymentStructure", e.target.value); }} rows={3} /> : null}
            <label>Notes<textarea value={proposal.notes} onChange={function (e) { update("notes", e.target.value); }} rows={2} /></label>
            <label>Terms<textarea value={proposal.terms} onChange={function (e) { update("terms", e.target.value); }} rows={2} /></label>
          </div>
        </section>

        <section className="proposal-preview-panel">
          <div className="preview-toolbar">
            <div><span className="panel-kicker">02 · Preview</span><h2>Live proposal</h2></div>
            <div className="preview-actions">
              <button type="button" onClick={printProposal}><Printer size={16} /> Print</button>
              <button type="button" className="download-mini" onClick={downloadPDF} disabled={isDownloading}><Download size={16} /> PDF</button>
            </div>
          </div>

          <div className={"proposal-paper" + (isFull ? " paper-full" : "")} ref={previewRef}>
            <div className="paper-top-line" />
            <header className="paper-header" ref={headerRef}>
              <div className="paper-brand">
                <img src="/images/RW_LOGO_Black_page-0001-removebg-preview.png" alt="Recruweb" />
                <div><strong>RECRUWEB</strong><span>Resources Pvt. Ltd.</span></div>
              </div>
              <div className="paper-meta">
                <span>Proposal ID</span>
                <strong>{proposalId}</strong>
                <span>Valid until {formatDate(proposal.validUntil)}</span>
              </div>
            </header>

            {isFull ? (
              <>
                <div className="paper-client-banner" ref={bannerRef}>
                  <span>Prepared for</span>
                  <strong>{proposal.companyName || proposal.clientName || "Your Company"}</strong>
                  {proposal.preparedFor ? <em> · {proposal.preparedFor}</em> : null}
                </div>
                {FULL_SLIDES.map(function (slide, i) {
                  return <img key={i} className="paper-slide-img" src={slide.src} alt={slide.alt} />;
                })}
              </>
            ) : (
              <>
                <div className="paper-cover">
                  <span className="paper-kicker">{template.label}</span>
                  <h1>{proposal.proposalTitle}</h1>
                  <p>Prepared for <strong>{proposal.companyName || proposal.clientName || "Your Company"}</strong></p>
                </div>
                <div className="paper-section">
                  <h3>Executive objective</h3>
                  <p>{proposal.objective || template.summary}</p>
                </div>
                <div className="paper-highlight-grid">
                  <div><span>Service</span><strong>{proposal.service}</strong></div>
                  <div><span>Talent</span><strong>{proposal.globalScope ? "India + Global" : "India"}</strong></div>
                  <div><span>Roles</span><strong>{proposal.roles.filter(function (r) { return safeText(r.role); }).length || proposal.roles.length}</strong></div>
                  <div><span>Headcount</span><strong>{totalPeople}</strong></div>
                </div>
                <div className="paper-section">
                  <h3>Scope &amp; deliverables</h3>
                  <div className="paper-deliverables">
                    {proposal.deliverables.map(function (item, i) {
                      return <div key={i}><CheckCircle2 size={15} /> {item}</div>;
                    })}
                  </div>
                </div>
                {template.showPlans ? renderPlans() : null}
                {template.showAiProducts ? renderAiProducts() : null}
                {(template.showPlans || template.showAiProducts) ? renderComparison() : null}
                {template.showPlans ? renderSevenDay() : null}
                <div className="paper-section">
                  <h3>Staffing plan</h3>
                  <table className="paper-table">
                    <thead><tr><th>Role</th><th>Location</th><th>HC</th><th>Mode</th><th>Budget</th></tr></thead>
                    <tbody>
                      {proposal.roles.map(function (r, i) {
                        return <tr key={i}><td>{r.role || "TBC"}</td><td>{r.location || "Remote"}</td><td>{r.headcount || 1}</td><td>{r.workMode}</td><td>{r.budget || "As approved"}</td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                {proposal.includePayment ? (
                  <div className="paper-commercial">
                    <div className="commercial-icon"><IndianRupee size={19} /></div>
                    <div><h3>Payment structure</h3><p>{proposal.paymentStructure}</p></div>
                  </div>
                ) : null}
                <div className="paper-section">
                  <h3>Terms &amp; next steps</h3>
                  <p>{proposal.terms}</p>
                  <div className="paper-next">
                    <span>01</span> Confirm scope <ArrowRight size={15} />
                    <span>02</span> Approve commercials <ArrowRight size={15} />
                    <span>03</span> Launch hiring
                  </div>
                </div>
              </>
            )}

            <footer className="paper-footer" ref={footerRef}>
              <div><strong>Recruweb Resources Pvt. Ltd.</strong><span>Recruitment · Remote Staffing · HR Technology · Workforce Solutions</span></div>
              <div><span>{proposal.clientEmail || "hello@recruweb.com"}</span><span>{proposal.clientPhone || "Contact team"}</span></div>
            </footer>
          </div>
          <div className="preview-bottom-note">
            <CheckCircle2 size={16} /> Other templates: section-based PDF. Full: one slide per page.
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProposalBuilder;
