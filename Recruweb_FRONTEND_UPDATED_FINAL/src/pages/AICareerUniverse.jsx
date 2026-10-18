import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Bot, BriefcaseBusiness, CheckCircle2, Globe2, Loader2,
  Mic2, Search, Send, Sparkles, Target, TrendingUp, Users, WandSparkles,
  RefreshCw, MapPin, Building2
} from "lucide-react";
import { API_URL } from "../utils/api";
import "./ai-career-universe.css";

const REGION_TO_QUERY = {
  "Worldwide": "",
  "United States": "United States",
  "United Kingdom": "United Kingdom",
  India: "India",
  UAE: "UAE",
  Germany: "Germany",
};

const fallbackCurrencies = ["USD", "EUR", "GBP", "INR", "AED"];

function scoreJob(job, role) {
  const text = `${job.title || ""} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
  const terms = String(role).toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
  if (!terms.length) return 70;
  const hits = terms.filter((term) => text.includes(term)).length;
  return Math.min(99, 62 + Math.round((hits / terms.length) * 37));
}

function salaryText(job, currency, rates) {
  const min = job.salaryMin;
  const max = job.salaryMax;
  if (min == null && max == null) return "Salary not disclosed";
  const code = job.salaryCurrency || "INR";
  const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency: code, maximumFractionDigits: 0 });
  const value = (v) => formatter.format(Number(v || 0));
  const native = min != null && max != null ? `${value(min)} – ${value(max)}` : value(min ?? max);
  if (currency === code) return native;
  const rateFrom = Number(rates?.[code]);
  const rateTo = Number(rates?.[currency]);
  if (!rateFrom || !rateTo) return `${native} · ${code}`;
  const convertValue = (v) => Number(v || 0) / rateFrom * rateTo;
  const target = new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 });
  const converted = min != null && max != null ? `${target.format(convertValue(min))} – ${target.format(convertValue(max))}` : target.format(convertValue(min ?? max));
  return `${converted} · live rate`;
}

export default function AICareerUniverse() {
  const [role, setRole] = useState("React Developer");
  const [region, setRegion] = useState("Worldwide");
  const [currency, setCurrency] = useState("USD");
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0 });
  const [currencies, setCurrencies] = useState(fallbackCurrencies);
  const [rates, setRates] = useState({ USD: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assistant, setAssistant] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I’m RecruitAI. Ask me about jobs, resumes, interviews or hiring." },
  ]);
  const [sending, setSending] = useState(false);

  const loadLiveData = async () => {
    setLoading(true);
    setError("");
    try {
      const location = REGION_TO_QUERY[region] || "";
      const jobUrl = new URL(`${API_URL}/jobs`);
      jobUrl.searchParams.set("limit", "12");
      if (role.trim()) jobUrl.searchParams.set("search", role.trim());
      if (location) jobUrl.searchParams.set("location", location);

      const [jobsRes, companiesRes, currencyRes] = await Promise.all([
        fetch(jobUrl),
        fetch(`${API_URL}/companies?limit=1`),
        fetch(`${API_URL}/global/currencies?base=USD`),
      ]);
      const [jobsJson, companiesJson, currencyJson] = await Promise.all([
        jobsRes.json(), companiesRes.json(), currencyRes.json(),
      ]);
      if (!jobsRes.ok || jobsJson.success === false) throw new Error(jobsJson.message || "Unable to load jobs");
      const liveJobs = Array.isArray(jobsJson.data) ? jobsJson.data : [];
      setJobs(liveJobs);
      setStats({ jobs: Number(jobsJson.total || liveJobs.length), companies: Number(companiesJson.total || 0) });
      if (Array.isArray(currencyJson.currencies)) {
        const codes = currencyJson.currencies.map((c) => c.code).filter(Boolean);
        setCurrencies(codes.length ? codes : fallbackCurrencies);
        if (currencyJson.rates && typeof currencyJson.rates === "object") setRates(currencyJson.rates);
      }
    } catch (e) {
      setError(e.message || "Live data could not be loaded");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLiveData(); }, [region]);

  const matches = useMemo(() => jobs.map((job) => ({ ...job, match: scoreJob(job, role) }))
    .sort((a, b) => b.match - a.match), [jobs, role]);

  const sendAssistant = async (preset) => {
    const text = (preset ?? assistant).trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setAssistant("");
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/ai-chat/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "RecruitAI is unavailable");
      setMessages((m) => [...m, { role: "assistant", text: data.response || "I could not generate a response." }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `RecruitAI is currently unavailable: ${e.message}` }]);
    } finally { setSending(false); }
  };

  const prompts = [
    "Find the best jobs for me",
    "How can I improve my resume?",
    "How should I prepare for an AI interview?",
  ];

  return (
    <main className="aiu-page">
      <section className="aiu-hero">
        <div className="aiu-grid" />
        <div className="aiu-glow aiu-glow-one" />
        <div className="aiu-glow aiu-glow-two" />
        <div className="aiu-shell">
          <div className="aiu-badge"><span className="aiu-live" /> LIVE · CONNECTED TO YOUR RECRUWEB DATA</div>
          <div className="aiu-hero-grid">
            <div>
              <h1>One intelligent universe for <span>work.</span></h1>
              <p>Discover real jobs from your Recruweb database, get AI guidance, explore global opportunities and move from discovery to interview in one connected experience.</p>
              <div className="aiu-actions">
                <Link to="/jobs" className="aiu-btn aiu-btn-primary">Explore Live Jobs <ArrowRight size={18} /></Link>
                <Link to="/get-started" className="aiu-btn aiu-btn-secondary">Build My Career <Sparkles size={17} /></Link>
              </div>
              <div className="aiu-trust-row"><span><CheckCircle2 size={16}/> Live database</span><span><CheckCircle2 size={16}/> AI assistant</span><span><CheckCircle2 size={16}/> Global-ready</span></div>
            </div>
            <div className="aiu-orbit-card">
              <div className="aiu-orbit-center"><Bot size={34}/><small>RECRU</small><strong>AI</strong></div>
              {[['Live Jobs', stats.jobs ? `${stats.jobs}+` : '—', 'aiu-node-a'], ['Companies', stats.companies ? `${stats.companies}+` : '—', 'aiu-node-b'], ['Regions', 'Global', 'aiu-node-c'], ['Assistant', '24/7', 'aiu-node-d']].map(([label, value, cls]) => <div className={`aiu-node ${cls}`} key={label}><span>{label}</span><strong>{value}</strong></div>)}
              <div className="aiu-orbit orbit-1"/><div className="aiu-orbit orbit-2"/>
            </div>
          </div>
        </div>
      </section>

      <section className="aiu-shell aiu-dashboard">
        <div className="aiu-section-head"><div><span className="aiu-kicker">LIVE TALENT INTELLIGENCE</span><h2>Real opportunities. Real-time search.</h2></div><button className="aiu-refresh" onClick={loadLiveData} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""}/> Refresh</button></div>
        <div className="aiu-controlbar">
          <label><span>Role, skill or keyword</span><div><Search size={17}/><input value={role} onChange={(e) => setRole(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadLiveData()} /></div></label>
          <label><span>Region</span><select value={region} onChange={(e) => setRegion(e.target.value)}>{Object.keys(REGION_TO_QUERY).map((r) => <option key={r}>{r}</option>)}</select></label>
          <label><span>Display currency</span><select value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.slice(0, 30).map((c) => <option key={c}>{c}</option>)}</select></label>
          <button className="aiu-search-btn" onClick={loadLiveData} disabled={loading}><Sparkles size={18}/> Find matches</button>
        </div>

        {error && <div className="aiu-error">{error} <button onClick={loadLiveData}>Retry</button></div>}
        <div className="aiu-layout">
          <div className="aiu-match-list">
            {loading ? <div className="aiu-empty"><Loader2 className="spin"/> Loading live opportunities…</div> : matches.length === 0 ? <div className="aiu-empty"><Search size={28}/><strong>No live jobs matched.</strong><span>Try another role or choose Worldwide.</span><Link to="/jobs">Open all jobs <ArrowRight size={15}/></Link></div> : matches.slice(0, 8).map((job) => (
              <article className="aiu-job" key={job.id || job.title}>
                <div className="aiu-job-icon"><BriefcaseBusiness size={22}/></div>
                <div className="aiu-job-main">
                  <div className="aiu-job-top"><span className="aiu-pill">{job.jobType || job.type || "Open role"}</span><span className="aiu-match">{job.match}% match</span></div>
                  <h3>{job.title}</h3>
                  <p><Building2 size={13}/> {job.company || "Recruweb employer"} <span>·</span> <MapPin size={13}/> {job.location || "Global"}</p>
                  <div className="aiu-skills">{String(job.requirements || "").split(/[,\n]/).map(s => s.trim()).filter(Boolean).slice(0, 4).map((s) => <span key={s}>{s}</span>)}</div>
                  <div className="aiu-job-bottom"><span>{salaryText(job, currency, rates)}</span><Link to={`/jobs/${job.id}`}>View job <ArrowRight size={14}/></Link></div>
                  <div className="aiu-bar"><i style={{ width: `${job.match}%` }}/></div>
                </div>
              </article>
            ))}
          </div>

          <aside id="recruitai" className="aiu-assistant">
            <div className="aiu-assistant-head"><div className="aiu-ai-avatar"><Bot size={19}/></div><div><strong>RecruitAI</strong><small>{sending ? "Thinking…" : "Connected to Recruweb AI"}</small></div><span className="aiu-online"/></div>
            <div className="aiu-chat-log">{messages.slice(-6).map((m, i) => <div className={`aiu-bubble ${m.role === "user" ? "user" : ""}`} key={`${i}-${m.text}`}>{m.text}</div>)}</div>
            <div className="aiu-prompts">{prompts.map((p) => <button key={p} onClick={() => sendAssistant(p)}>{p}<ArrowRight size={14}/></button>)}</div>
            <form className="aiu-chat-input" onSubmit={(e) => { e.preventDefault(); sendAssistant(); }}><input value={assistant} onChange={(e) => setAssistant(e.target.value)} placeholder="Ask RecruitAI anything…"/><button disabled={sending || !assistant.trim()}><Send size={17}/></button></form>
          </aside>
        </div>
      </section>

      <section className="aiu-shell aiu-features">
        <div className="aiu-section-head"><div><span className="aiu-kicker">CONNECTED PRODUCT EXPERIENCE</span><h2>Every capability opens a real workflow.</h2></div></div>
        <div className="aiu-feature-grid">
          {[
            [Target, "AI Job Matching", "Search live jobs and rank them against the role or skill you enter.", "/jobs"],
            [Mic2, "AI Interview Studio", "Move into interview practice and the existing AI interview workflow.", "/interview-practice"],
            [TrendingUp, "Hiring Intelligence", "Recruiter analytics, pipelines and hiring workflows already connected to the platform.", "/admin/dashboard"],
            [Globe2, "Global Workforce", "Explore worldwide and remote-ready opportunities with region-aware search.", "/jobs"],
            [Users, "Professional Profiles", "Build your candidate profile, resume and career materials in the existing portal.", "/candidate/profile"],
            [WandSparkles, "AI Career Coach", "Use the live RecruitAI assistant for career, resume and interview guidance.", "#recruitai"],
          ].map(([Icon, title, desc, href]) => <article className="aiu-feature" key={title} onClick={() => { if (href.startsWith("#")) document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); }}><div className="aiu-feature-icon"><Icon size={22}/></div><h3>{title}</h3><p>{desc}</p>{href.startsWith("#") ? <button>Ask RecruitAI <ArrowRight size={15}/></button> : <Link to={href}>Open workflow <ArrowRight size={15}/></Link>}</article>)}
        </div>
      </section>

      <section className="aiu-shell aiu-report">
        <div className="aiu-report-copy"><span className="aiu-kicker">REAL PLATFORM WORKFLOW</span><h2>From live job discovery to interview readiness.</h2><p>The Universe is now a navigation layer over your actual Recruweb modules — not a fake dashboard. Every primary action takes the user to a real job, profile, interview, recruiter or AI workflow.</p><div className="aiu-report-actions"><Link to="/jobs" className="aiu-btn aiu-btn-primary">Find a real job <ArrowRight size={18}/></Link><Link to="/resume-checker" className="aiu-btn aiu-btn-secondary">Check my resume <ArrowRight size={18}/></Link></div></div>
        <div className="aiu-score-card"><div className="aiu-score-ring"><Sparkles size={25}/><strong>LIVE</strong></div><div><span>RECRUWEB DATA</span><h3>{stats.jobs || 0} jobs available now</h3></div><div className="aiu-score-lines"><div><span>Companies</span><b>{stats.companies || 0}</b><i><em style={{ width: stats.companies ? "72%" : "5%" }}/></i></div><div><span>Search region</span><b>{region}</b><i><em style={{ width: "100%" }}/></i></div><div><span>AI assistant</span><b>Connected</b><i><em style={{ width: "100%" }}/></i></div></div></div>
      </section>
    </main>
  );
}
