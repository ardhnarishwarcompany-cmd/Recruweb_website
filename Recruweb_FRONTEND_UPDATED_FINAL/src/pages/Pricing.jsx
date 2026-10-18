import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  Clock3,
  FileCheck2,
  Globe2,
  Headphones,
  IndianRupee,
  Layers3,
  MapPin,
  Network,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import "./pricing.css";

const recruitmentPlans = [
  {
    id: "premium",
    eyebrow: "Best value",
    name: "Premium Recruitment Partnership",
    price: "8.33%",
    unit: "of Annual CTC",
    equivalent: "Approximately 1 month's salary",
    replacement: "4 Months FREE",
    closure: "Within 7 working days",
    token: "₹5,000",
    hrms: "FREE HRMS access for 4 months",
    bestFor: "Corporate, IT, growing & specialized hiring",
    accent: "violet",
    popular: true,
  },
  {
    id: "standard",
    eyebrow: "Balanced",
    name: "Standard Recruitment Partnership",
    price: "20 days",
    unit: "candidate salary",
    equivalent: "Reduced hiring cost model",
    replacement: "3 Months FREE",
    closure: "Within 7 working days",
    token: "₹5,000 adjustable",
    hrms: "FREE HRMS access for 3 months",
    bestFor: "Companies seeking cost efficiency + support",
    accent: "blue",
  },
  {
    id: "startup",
    eyebrow: "Startup friendly",
    name: "Startup Recruitment Partnership",
    price: "15 days",
    unit: "candidate salary",
    equivalent: "Lowest recruitment fee",
    replacement: "2 Months FREE",
    closure: "Within 7 working days",
    token: "₹5,000 adjustable",
    hrms: "FREE HRMS access for 2 months",
    bestFor: "Startups, SMEs & early-stage organizations",
    accent: "emerald",
  },
];

const hrPlan = {
  name: "HR Technology Starter",
  tagline: "Ideal for startups & small teams.",
  mrp: "₹10,000 / month",
  price: "₹2,000",
  unit: "per candidate per month",
  duration: "For 11 months",
  commitment: "₹5,000",
  commitmentNote: "at the time of agreement",
};

const hrServices = [
  ["Hiring support", "Per hired candidate (as per package)"],
  ["Replacement support", "Included"],
  ["Payroll support", "Included"],
  ["Compliance support", "Included"],
  ["HRMS access", "Included"],
  ["AI interview & screening", "Included"],
  ["Attendance management", "Included"],
  ["Employee verification", "Included"],
  ["Operational HR support", "Included"],
];

const products = [
  {
    title: "AI Automated Attendance System",
    icon: <MapPin size={23} />,
    mrp: "₹499 / employee / month",
    offer: "₹99 / employee / month",
    features: ["Geo-tagging", "Geo-fencing", "Mobile attendance", "Shift management", "Real-time attendance reports"],
  },
  {
    title: "AI Candidate Interview System",
    icon: <Bot size={23} />,
    mrp: "₹299 / candidate",
    offer: "₹99 / week",
    features: ["AI screening", "AI scoring", "Interview reports", "HR recommendation engine"],
  },
  {
    title: "Employee Verification Portal",
    icon: <ShieldCheck size={23} />,
    mrp: "₹1,000 / employee",
    offer: "₹999 / month",
    offerNote: "Unlimited verifications",
    features: ["Document verification", "ID verification", "Employment verification", "Background workflow"],
  },
  {
    title: "Standalone HRMS",
    icon: <Layers3 size={23} />,
    mrp: "₹1,000 / employee / month",
    offer: "₹299 / employee / month",
    features: ["Attendance", "Leave management", "Payroll support", "Employee database", "Offer & experience letters", "Reports & analytics", "HR support desk"],
  },
];

const industries = ["IT & Technology", "BFSI", "Healthcare", "Manufacturing", "BPO & KPO", "Retail & E-Commerce", "Hospitality", "Logistics", "Education", "Real Estate", "Startups & SMEs"];
const solutions = [
  ["Recruitment & Staffing", "Permanent, contract, temporary, executive and bulk hiring."],
  ["HR Outsourcing", "Operational HR support, employee documentation and HR coordination."],
  ["Payroll & Compliance", "Payroll processing with PF, ESIC and compliance support."],
  ["Facility & Hospitality Workforce", "Industrial, facility, hospitality and manpower solutions."],
  ["HRMS & SaaS", "Centralized employee management, attendance, leave and reports."],
  ["AI Recruitment", "AI CV screening, interview workflows, scoring and recommendations."],
  ["Verification", "Digital employee, document, ID and employment verification workflows."],
  ["Workforce Analytics", "Data-led workforce visibility and operational insights."],
];
const digitalRecruitmentServices = ["India Job Portal", "International Job Portal", "Employer Job Posting", "Candidate Recruitment Marketplace", "AI CV Screening", "AI Interview", "Recruiter Calling", "WhatsApp Recruitment", "CV Database Services", "Premium / Featured Jobs", "Recruiter Subscription Plans", "Bulk Recruitment", "International Recruitment"];
const comingSoonProducts = ["Additional AI HR products", "AI workforce copilots", "Advanced compliance automation", "Predictive workforce intelligence"];

const process = [
  ["01", "Requirement Discussion", "Client shares hiring, HR or workforce requirements."],
  ["02", "JD Finalization", "Role, skills, salary, location and hiring requirements are confirmed."],
  ["03", "Commercial Confirmation", "Client selects the appropriate recruitment, HR or technology plan."],
  ["04", "Agreement & Onboarding", "Commercial agreement and onboarding formalities are completed."],
  ["05", "Recruitment Activation", "Recruweb activates recruitment teams and sourcing channels."],
  ["06", "Candidate Shortlisting", "Relevant candidates are screened and shared."],
  ["07", "Interview & Selection", "Interview coordination, feedback and candidate follow-up."],
  ["08", "Joining & Closure", "Offer, joining coordination and post-joining support."],
];
const faqs = [
  ["What is the 7-working-day commitment?", "It is a recruitment closure target, subject to suitable candidate availability, complete JD, timely client feedback, interview scheduling and agreed hiring requirements. It is not an unconditional guarantee of joining."],
  ["Are the ₹5,000 commitment charges adjustable?", "The supplied commercial structure states that the ₹5,000 commitment charges are adjustable against the applicable final recruitment invoice wherever specified. Final treatment should follow the mutually executed agreement or work order."],
  ["Can bulk hiring be negotiated?", "Yes. Bulk hiring, multi-location deployment, long-term outsourcing and enterprise contracts are eligible for customized commercial discussion."],
  ["Are prices inclusive of GST?", "No. The commercial terms state that prices are subject to applicable GST and statutory taxes."],
  ["Can international recruitment be supported?", "Yes. International recruitment requirements can be commercially evaluated according to country, role, manpower category and recruitment scope."],
];

const money = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

function SectionHeading({ kicker, title, text }) {
  return (
    <div className="pricing-section-heading">
      <span className="pricing-kicker">{kicker}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export default function Pricing() {
  const [activePlan, setActivePlan] = useState("premium");
  const [employeeCount, setEmployeeCount] = useState(50);
  const [activeProduct, setActiveProduct] = useState("attendance");
  const [openFaq, setOpenFaq] = useState(0);

  const estimate = useMemo(() => {
    if (activeProduct === "attendance") return employeeCount * 99;
    if (activeProduct === "hrms") return employeeCount * 299;
    if (activeProduct === "verification") return 999;
    return 99;
  }, [activeProduct, employeeCount]);

  const selectedPlan = recruitmentPlans.find((p) => p.id === activePlan) || recruitmentPlans[0];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="rw-commercials-page">
      <div className="pricing-orb pricing-orb-one" />
      <div className="pricing-orb pricing-orb-two" />
      <div className="pricing-grid-bg" />



      <header className="commercials-hero">
        <div className="hero-copy">
          <div className="live-badge"><span className="live-dot" /> Client Edition · Effective August 2026</div>
          <h1>One workforce partner.<br /><span>Every HR solution.</span></h1>
          <p>Recruitment, staffing, HR outsourcing, payroll, compliance and AI-powered workforce technology — brought together under one integrated ecosystem.</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => scrollTo("recruitment-plans")}>Explore commercials <ArrowRight size={17} /></button>
            <Link className="secondary-action" to="/proposal"><Sparkles size={17} /> Build a proposal</Link>
          </div>
          <div className="hero-trust-row">
            <span><BadgeCheck size={16} /> JD-based recruitment</span>
            <span><Clock3 size={16} /> 7-day closure target</span>
            <span><Globe2 size={16} /> India + global talent</span>
          </div>
        </div>
        <div className="hero-dashboard-card">
          <div className="hero-card-top"><span>WORKFORCE OS</span><span className="secure-pill"><ShieldCheck size={13} /> Integrated</span></div>
          <div className="hero-metric"><div><small>Hiring pipeline</small><strong>JD → Joining</strong></div><div className="metric-ring">7<span>days</span></div></div>
          <div className="mini-pipeline">
            {["Requirement", "Sourcing", "Screening", "Interview", "Joining"].map((item, i) => <div key={item}><span className="pipeline-num">0{i + 1}</span><span>{item}</span><span className="pipeline-check"><Check size={12} /></span></div>)}
          </div>
          <div className="hero-card-footer"><span><Users size={15} /> Scalable hiring</span><span><Bot size={15} /> AI enabled</span></div>
        </div>
      </header>

      <section className="promise-strip">
        <div><strong>“RIGHT TALENT. RIGHT TIME. WITHIN 7 WORKING DAYS.”</strong><span>Target subject to JD clarity, candidate availability and client response timelines.</span></div>
        <Link to="/contact">Discuss your requirement <ArrowRight size={16} /></Link>
      </section>

      <main>
        <section className="commercial-section ecosystem-section" id="solutions">
          <SectionHeading kicker="01 · All-in-one ecosystem" title="From recruitment to workforce technology" text="Instead of managing multiple HR, recruitment and workforce vendors, organizations can work with Recruweb as a single HR & workforce solutions partner." />
          <div className="solution-grid">
            {solutions.map(([title, text], index) => <article className="solution-card" key={title}><span className="solution-number">0{index + 1}</span><div className="solution-icon">{[<BriefcaseBusiness />, <Users />, <IndianRupee />, <Building2 />, <Layers3 />, <Bot />, <FileCheck2 />, <BarChart3 />][index]}</div><h3>{title}</h3><p>{text}</p><Link to="/services">Explore service <ArrowRight size={14} /></Link></article>)}
          </div>
        </section>

        <section className="commercial-section" id="recruitment-plans">
          <SectionHeading kicker="02 · Section A" title="Recruitment service plans" text="Choose a hiring model around speed, replacement protection and cost efficiency." />
          <div className="plan-switcher" role="tablist" aria-label="Recruitment plans">
            {recruitmentPlans.map((plan) => <button key={plan.id} className={activePlan === plan.id ? "active" : ""} onClick={() => setActivePlan(plan.id)}><span>{plan.name.replace(" Recruitment Partnership", "")}</span><small>{plan.price} {plan.unit}</small></button>)}
          </div>
          <div className="recruitment-grid">
            {recruitmentPlans.map((plan) => (
              <article key={plan.id} className={`recruitment-card ${plan.id === activePlan ? "selected" : ""} ${plan.popular ? "popular" : ""}`} onClick={() => setActivePlan(plan.id)}>
                {plan.popular && <div className="popular-ribbon">Recommended</div>}
                <div className="card-eyebrow">{plan.eyebrow}</div><h3>{plan.name}</h3>
                <div className="big-price">{plan.price}<small>{plan.unit}</small></div>
                <p className="equivalent">{plan.equivalent}</p>
                <div className="commercial-lines"><div><span>Closure target</span><b>{plan.closure}</b></div><div><span>Replacement</span><b>{plan.replacement}</b></div><div><span>Commitment Charges</span><b>{plan.token}</b></div><div><span>HRMS</span><b>{plan.hrms}</b></div></div>
                <div className="best-for"><strong>Best for</strong><span>{plan.bestFor}</span></div>
                <Link className="card-action" to="/contact">Discuss {plan.name.split(" ")[0]} <ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
          <div className="selection-summary"><div><span>Selected model</span><strong>{selectedPlan.name}</strong></div><div><span>Recruitment fee</span><strong>{selectedPlan.price} {selectedPlan.unit}</strong></div><div><span>Replacement</span><strong>{selectedPlan.replacement}</strong></div><div><span>HRMS</span><strong>{selectedPlan.hrms.replace("FREE HRMS access for ", "Free ")}</strong></div></div>
        </section>

        <section className="commercial-section outsourcing-section">
          <div className="split-feature">
            <div className="feature-copy"><span className="pricing-kicker">03 · Section A</span><h2>Enterprise HR Outsourcing</h2><p className="feature-lead">A complete HR operating layer on an <strong>11-month contract</strong>, designed for organizations that want recruitment, payroll, attendance and employee operations coordinated through one partner.</p><div className="feature-stats"><div><strong>11</strong><span>month agreement</span></div><div><strong>₹5,000</strong><span>commitment charges</span></div><div><strong>11 mo.</strong><span>replacement support</span></div></div><Link className="primary-action compact" to="/contact">Request HR outsourcing scope <ArrowRight size={16} /></Link></div>
            <div className="feature-list"><div className="feature-list-head"><ShieldCheck size={19} /><div><strong>Included services</strong><span>Built around agreed manpower scope</span></div></div>{["Payroll Processing", "Attendance Management", "PF & ESIC Support", "HRMS Software", "Operational HR Support", "Employee Documentation", "Offer & Joining Management", "Exit Management", "HR Coordination", "Basic HR Audit Support", "All tools including free"].map(item => <div key={item}><Check size={15} />{item}</div>)}</div>
          </div>
        </section>

        <section className="commercial-section" id="hr-tech">
          <SectionHeading kicker="04 · Section B" title="HR technology & SaaS plans" text="Subscription plans combine HRMS access with hiring, payroll, compliance and operational HR support." />
          <div className="hrtech-single">
            <article className="saas-card popular hrtech-card">
              <span className="saas-badge">Starter</span>
              <div className="saas-title"><span>{hrPlan.name}</span><Zap size={18} /></div>
              <p className="hrtech-tagline">{hrPlan.tagline}</p>
              <div className="saas-price"><strong>{hrPlan.price}</strong><small>{hrPlan.unit}</small></div>
              <div className="hrtech-mrp">Market price: <del>{hrPlan.mrp}</del></div>
              <div className="save-chip">{hrPlan.duration}</div>
              <div className="hrtech-commit"><span>Commitment charges</span><strong>{hrPlan.commitment}</strong><small>{hrPlan.commitmentNote}</small></div>
              <Link to="/contact" className="saas-action">Choose Starter <ArrowRight size={15} /></Link>
            </article>
            <div className="hrtech-services">
              <div className="hrtech-services-head"><span>Service</span><span>{hrPlan.name}</span></div>
              {hrServices.map(([service, value]) => <div className="hrtech-services-row" key={service}><span>{service}</span><b>{value === "Included" ? <><Check size={14} /> Included</> : value}</b></div>)}
            </div>
          </div>
        </section>

        <section className="commercial-section" id="products">
          <SectionHeading kicker="05 · Product suite" title="AI & HR products" text="Deploy focused workforce products individually or as part of a broader HR technology stack." />
          <div className="product-grid">
            {products.map((product) => <article className="product-card" key={product.title}><div className="product-icon">{product.icon}</div><h3>{product.title}</h3><div className="product-prices"><div><span>MRP</span><strong>{product.mrp}</strong></div><div className="offer-price"><span>Recruweb offer</span><strong>{product.offer}</strong>{product.offerNote && <small>{product.offerNote}</small>}</div></div><div className="product-terms"><span>11-month agreement</span><span>₹5,000 commitment charges where applicable</span></div><ul>{product.features.map(f => <li key={f}><Check size={14} />{f}</li>)}</ul><Link to="/contact" className="text-action">Get product details <ArrowRight size={15} /></Link></article>)}
          </div>
        </section>

        <section className="commercial-section digital-services-section" id="digital-recruitment">
          <SectionHeading kicker="06 · Job portal & digital recruitment" title="Digital recruitment, built into the ecosystem" text="Recruweb combines human recruitment operations with a modern digital hiring stack." />
          <div className="digital-service-grid">{digitalRecruitmentServices.map((item, index) => <div className="digital-service-chip" key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>)}</div>
          <div className="coming-soon-panel"><div><span className="pricing-kicker">PRODUCT ROADMAP</span><h3>More AI HR products are coming soon.</h3><p>New automation and workforce intelligence modules can be added to the same Recruweb ecosystem as they become available.</p></div><div className="coming-soon-tags">{comingSoonProducts.map(item => <span key={item}><Sparkles size={13}/>{item}</span>)}</div></div>
        </section>

        <section className="commercial-section calculator-section">
          <div className="calculator-wrap">
            <div className="calculator-copy"><span className="pricing-kicker">06 · Planning tool</span><h2>Estimate your monthly technology cost</h2><p>Use this interactive estimator for planning only. Final commercials are confirmed in the mutually executed agreement / work order.</p><div className="product-tabs"><button className={activeProduct === "attendance" ? "active" : ""} onClick={() => setActiveProduct("attendance")}>AI Attendance</button><button className={activeProduct === "hrms" ? "active" : ""} onClick={() => setActiveProduct("hrms")}>Standalone HRMS</button><button className={activeProduct === "verification" ? "active" : ""} onClick={() => setActiveProduct("verification")}>Verification</button><button className={activeProduct === "interview" ? "active" : ""} onClick={() => setActiveProduct("interview")}>AI Interview</button></div>{activeProduct !== "verification" && <label className="range-control"><span>Employees / usage base <strong>{employeeCount}</strong></span><input type="range" min="1" max="1000" value={employeeCount} onChange={(e) => setEmployeeCount(Number(e.target.value))} /></label>}</div>
            <div className="estimate-card"><div className="estimate-label"><Calculator size={16} /> Planning estimate</div><strong>{money(estimate)}</strong><span>{activeProduct === "attendance" ? "per month at ₹99 / employee" : activeProduct === "hrms" ? "per month at ₹299 / employee" : activeProduct === "verification" ? "per month · unlimited verifications" : "per week"}</span><div className="estimate-breakdown"><span>Selected product</span><b>{activeProduct === "attendance" ? "AI Automated Attendance" : activeProduct === "hrms" ? "Standalone HRMS" : activeProduct === "verification" ? "Employee Verification Portal" : "AI Candidate Interview"}</b></div><Link to="/contact">Request exact quote <ArrowRight size={15} /></Link></div>
          </div>
        </section>

        <section className="commercial-section process-section" id="process">
          <SectionHeading kicker="08 · Partnership process" title="From requirement to joining — fast & structured" text="The recruitment model follows a clear eight-step operating flow." />
          <div className="process-grid">{process.map(([num, title, text]) => <article key={num}><span>{num}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </section>

        <section className="commercial-section industries-section">
          <div className="industries-copy"><span className="pricing-kicker">08 · Industries</span><h2>Built for different workforce environments</h2><p>Solutions can be customized across sectors, role types, locations and workforce models.</p><Link className="text-action" to="/industry">Explore industries <ArrowRight size={15} /></Link></div>
          <div className="industry-cloud">{industries.map((industry) => <span key={industry}><Network size={15} />{industry}</span>)}</div>
        </section>

        <section className="commercial-section advantage-section">
          <SectionHeading kicker="10 · Why Recruweb" title="The advantage is integration" text="Recruitment quality is measured beyond CV volume — with focus on relevance, conversion, joining and replacement protection." />
          <div className="advantage-grid">{[["SPEED", "7 working days vacancy closure target"], ["JD-BASED", "Skills + experience + qualification + salary + location"], ["END-TO-END", "Requirement to candidate joining support"], ["REPLACEMENT", "Defined replacement periods by selected plan"], ["TECH ENABLEMENT", "HRMS + AI recruitment + verification + payroll"], ["SCALABLE", "1 vacancy → 10 → 100 → bulk hiring"]].map(([title, text], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>

        <section className="commercial-section comparison-section">
          <SectionHeading kicker="12 · Commercial snapshot" title="Market price vs Recruweb offer" text="A quick client-facing comparison of the supplied commercial structure." />
          <div className="comparison-table-wrap"><table><thead><tr><th>Service</th><th>Market price / MRP</th><th>Recruweb price</th></tr></thead><tbody><tr><td>Recruitment Premium</td><td>Standard market rate</td><td className="offer">8.33% Annual CTC</td></tr><tr><td>Recruitment Standard</td><td>25 days salary</td><td className="offer">20 days salary</td></tr><tr><td>Recruitment Startup</td><td>25 days salary</td><td className="offer">15 days salary</td></tr><tr><td>HR Technology Starter</td><td>₹10,000 / month</td><td className="offer">₹2,000 / candidate</td></tr><tr><td>AI Attendance</td><td>₹499 / employee</td><td className="offer">₹99 / employee</td></tr><tr><td>AI Interview</td><td>₹299 / candidate</td><td className="offer">₹99 / week</td></tr><tr><td>Verification Portal</td><td>₹1,000 / employee</td><td className="offer">₹999 / month · unlimited</td></tr><tr><td>HRMS Standalone</td><td>₹1,000 / employee</td><td className="offer">₹299 / employee</td></tr></tbody></table></div>
        </section>

        <section className="commercial-section client-responsibilities-section">
          <SectionHeading kicker="11 · Client readiness" title="What helps us hit the 7-day target" text="The closure target starts after a complete and approved JD and depends on candidate availability and timely client coordination." />
          <div className="responsibility-grid">{["Complete and approved JD", "Accurate salary budget", "Number of vacancies", "Interview availability", "Timely candidate feedback", "Selection decision within reasonable timelines", "Offer / appointment details", "Joining date confirmation"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>)}</div>
          <div className="target-note"><ShieldCheck size={18}/><p><b>Important:</b> the 7-working-day commitment is a recruitment closure target, not an unconditional guarantee of joining. Market conditions, candidate availability, notice periods, salary competitiveness, interview schedules and client response times can affect actual closure.</p></div>
        </section>

        <section className="commercial-section terms-section">
          <div className="terms-grid"><div><span className="pricing-kicker">11 · Universal terms</span><h2>Clear commercials.<br />Flexible enterprise discussions.</h2><p>Bulk hiring, multi-location deployment, long-term outsourcing and enterprise contracts can be customized.</p><Link className="primary-action compact" to="/contact">Start a commercial discussion <ArrowRight size={16} /></Link></div><div className="terms-list">{["₹5,000 commitment charges are payable at agreement signing for applicable plans and are adjustable against the final invoice where specified.", "Standard agreement period is 11 months unless otherwise agreed.", "Recruitment invoices are payable within 7 days of candidate joining; subscriptions are monthly in advance unless otherwise agreed.", "Replacement support follows the selected recruitment plan and agreed replacement terms; client payments must be clear.", "Vacancy closure timelines begin after receipt of a complete and approved JD.", "The 7-working-day target is subject to client cooperation and candidate availability.", "Bulk hiring and large manpower requirements may be negotiated separately.", "International recruitment is commercially evaluated by country, role, manpower category and recruitment scope.", "Customized enterprise packages can be created according to client requirements.", "Prices are subject to applicable GST / statutory taxes; final commercials are confirmed in the mutually executed agreement / work order."].map((t, i) => <div key={i}><span>{String(i + 1).padStart(2, "0")}</span><p>{t}</p></div>)}</div></div>
        </section>

        <section className="commercial-section faq-section">
          <SectionHeading kicker="14 · FAQ" title="Commercial questions, answered" />
          <div className="faq-list">{faqs.map(([q, a], i) => <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={q}><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><span>{q}</span><ChevronDown size={18} /></button>{openFaq === i && <p>{a}</p>}</div>)}</div>
        </section>

        <section className="commercial-cta">
          <div className="cta-glow" /><div><span className="pricing-kicker">13 · Let's build</span><h2>Your vacancy is our priority.</h2><p>Give us the JD. We activate the process, source relevant talent, coordinate interviews and follow up until joining.</p></div><div className="cta-actions"><Link to="/contact" className="primary-action">Discuss hiring requirements <ArrowRight size={17} /></Link><Link to="/proposal" className="secondary-action">Create client proposal <Sparkles size={17} /></Link><a className="phone-action" href="tel:+919958256785"><Phone size={16} /> +91-9958256785</a></div></section>
      </main>

    </div>
  );
}
