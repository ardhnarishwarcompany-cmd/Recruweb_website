import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { CalendarDays, CheckCircle2, Clock3, ExternalLink, FileCheck2, Sparkles, UploadCloud } from "lucide-react";

const InterviewTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.candidatePortal.getTasks();
    if (res?.success) setTasks(res.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openSubmit = (task) => {
    setActive(task); setUrl(task.submissionUrl || ""); setNotes(task.submissionNotes || ""); setMessage("");
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMessage("");
    const res = await api.candidatePortal.updateTask(active.id, { candidateStatus: "submitted", submissionUrl: url, submissionNotes: notes });
    if (res?.success) { setTasks(prev => prev.map(t => t.id === active.id ? res.data : t)); setActive(null); setMessage("Your task has been submitted successfully."); }
    else setMessage(res?.message || "Submission failed");
    setSaving(false);
  };

  const markStarted = async (task) => {
    const res = await api.candidatePortal.updateTask(task.id, { candidateStatus: "in_progress" });
    if (res?.success) setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
  };

  return <div className="candidate-tasks-page">
    <div className="ctp-hero"><div><span className="ctp-kicker"><Sparkles size={14}/> INTERVIEW TASK HUB</span><h1>Your Interview <span>Projects</span></h1><p>Practical assignments shared by the Recruweb hiring team appear here. Complete the brief, submit your work and track review status from one place.</p></div><div className="ctp-hero-badge"><FileCheck2 size={18}/><b>{tasks.length}</b><small>assigned tasks</small></div></div>
    {message && <div className="ctp-message"><CheckCircle2 size={17}/>{message}</div>}
    {loading ? <div className="ctp-empty">Loading your interview tasks…</div> : !tasks.length ? <div className="ctp-empty"><UploadCloud size={42}/><h2>No project assigned yet</h2><p>If your interviewer assigns a practical task, it will appear here automatically.</p></div> : <div className="ctp-grid">{tasks.map(task => <article className="ctp-card" key={task.id}>
      <div className="ctp-top"><span>{task.projectName || "Interview Project"}</span><b className={`ctp-status ${task.candidateStatus}`}>{task.candidateStatus === "in_progress" ? "In Progress" : task.candidateStatus}</b></div>
      <h2>{task.title}</h2><p className="ctp-instructions">{task.instructions || task.description || "Follow the assignment brief shared by your hiring team."}</p>
      <div className="ctp-meta"><span><CalendarDays size={14}/>{task.dueDate ? new Date(task.dueDate).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }) : "Flexible deadline"}</span><span><Clock3 size={14}/>{task.estimatedMinutes || 60} min</span></div>
      {task.reviewerFeedback && <div className="ctp-feedback"><b>Reviewer feedback</b><p>{task.reviewerFeedback}</p></div>}
      {task.submissionUrl && <a className="ctp-link" href={task.submissionUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Your submitted work</a>}
      <div className="ctp-actions">{task.candidateStatus === "assigned" && <button onClick={() => markStarted(task)} className="ctp-secondary">Start task</button>}{task.candidateStatus !== "reviewed" && <button onClick={() => openSubmit(task)} className="ctp-primary">{task.candidateStatus === "submitted" ? "Update submission" : "Submit work"}</button>}{task.candidateStatus === "reviewed" && <span className="ctp-done"><CheckCircle2 size={17}/> Reviewed by Recruweb</span>}</div>
    </article>)}</div>}
    {active && <div className="ctp-backdrop"><div className="ctp-modal"><div className="ctp-modal-head"><div><span className="ctp-kicker">SUBMIT PROJECT</span><h2>{active.title}</h2></div><button onClick={() => setActive(null)}>×</button></div><form onSubmit={save} className="ctp-form"><label>Submission link (GitHub / Drive / live demo)<input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." /></label><label>Notes for reviewer<textarea rows="6" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Mention what you completed, setup instructions or anything the reviewer should know." /></label><div className="ctp-modal-actions"><button type="button" className="ctp-secondary" onClick={()=>setActive(null)}>Cancel</button><button className="ctp-primary" disabled={saving}>{saving ? "Submitting…" : "Submit assignment"}</button></div></form></div></div>}
    <style>{`.candidate-tasks-page{min-height:100%;padding:32px;background:linear-gradient(135deg,#f8faff,#fff 52%,#f5f3ff);color:#0f172a}.ctp-hero{display:flex;justify-content:space-between;align-items:center;gap:25px;padding:30px;border:1px solid #e2e8f0;border-radius:26px;background:#ffffffcc;backdrop-filter:blur(15px);box-shadow:0 20px 50px rgba(15,23,42,.07)}.ctp-kicker{display:inline-flex;align-items:center;gap:7px;color:#6366f1;font-size:11px;font-weight:900;letter-spacing:.12em}.ctp-hero h1{font-size:clamp(30px,4vw,46px);margin:8px 0 10px;letter-spacing:-.04em}.ctp-hero h1 span{color:#7c3aed}.ctp-hero p{max-width:760px;color:#64748b;line-height:1.7;margin:0}.ctp-hero-badge{min-width:130px;padding:18px;border-radius:20px;background:linear-gradient(135deg,#eef2ff,#f5f3ff);color:#4f46e5;display:grid;grid-template-columns:24px 1fr;column-gap:7px}.ctp-hero-badge svg{grid-row:span 2}.ctp-hero-badge b{font-size:26px}.ctp-hero-badge small{color:#64748b;font-weight:800}.ctp-message{margin:16px 0;padding:13px 16px;border-radius:13px;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:800;display:flex;gap:8px}.ctp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;margin-top:20px}.ctp-card{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:22px;box-shadow:0 15px 40px rgba(15,23,42,.05)}.ctp-top{display:flex;justify-content:space-between;gap:10px;align-items:center}.ctp-top>span{font-size:11px;font-weight:900;color:#6366f1;text-transform:uppercase;letter-spacing:.08em}.ctp-status{font-size:10px;text-transform:uppercase;padding:6px 8px;border-radius:99px;background:#eef2ff;color:#4338ca}.ctp-status.submitted{background:#fff7ed;color:#c2410c}.ctp-status.reviewed{background:#ecfdf5;color:#047857}.ctp-card h2{font-size:21px;margin:15px 0 10px}.ctp-instructions{white-space:pre-wrap;color:#475569;line-height:1.65;min-height:78px}.ctp-meta{display:flex;gap:16px;flex-wrap:wrap;color:#64748b;font-size:12px;font-weight:800;border-top:1px solid #eef2f7;padding-top:13px}.ctp-meta span{display:flex;gap:5px;align-items:center}.ctp-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}.ctp-primary,.ctp-secondary{border-radius:12px;padding:10px 14px;font-weight:850;cursor:pointer;border:0}.ctp-primary{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff}.ctp-secondary{background:#fff;border:1px solid #cbd5e1;color:#4338ca}.ctp-done{display:flex;align-items:center;gap:6px;color:#047857;font-weight:900}.ctp-link{display:inline-flex;gap:6px;align-items:center;margin-top:13px;color:#4f46e5;font-weight:800;font-size:12px}.ctp-feedback{margin-top:14px;padding:12px;border-radius:12px;background:#f8fafc}.ctp-feedback p{margin:4px 0 0;color:#475569}.ctp-empty{min-height:350px;margin-top:20px;background:#fff;border:1px solid #e2e8f0;border-radius:22px;display:grid;place-items:center;text-align:center;color:#64748b;padding:40px}.ctp-empty h2{color:#0f172a;margin:10px 0 3px}.ctp-backdrop{position:fixed;inset:0;z-index:1000;background:#0f172a77;backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px}.ctp-modal{width:min(650px,100%);background:#fff;border-radius:23px;box-shadow:0 30px 90px #0004;overflow:hidden}.ctp-modal-head{padding:22px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.ctp-modal-head h2{margin:6px 0 0}.ctp-modal-head button{border:0;background:#f1f5f9;width:36px;height:36px;border-radius:10px;font-size:20px;cursor:pointer}.ctp-form{padding:23px;display:grid;gap:15px}.ctp-form label{display:grid;gap:7px;font-size:12px;font-weight:900;color:#334155}.ctp-form input,.ctp-form textarea{border:1px solid #cbd5e1;border-radius:11px;padding:11px;font:inherit;outline:0}.ctp-form input:focus,.ctp-form textarea:focus{border-color:#6366f1;box-shadow:0 0 0 3px #6366f11a}.ctp-modal-actions{display:flex;justify-content:flex-end;gap:9px}@media(max-width:850px){.ctp-hero{flex-direction:column;align-items:stretch}.ctp-grid{grid-template-columns:1fr}.candidate-tasks-page{padding:18px}}
/* Home-page visual language: larger type, same Recruweb font hierarchy and card rhythm. */
.candidate-tasks-page{font-family:var(--font-body) !important;background:linear-gradient(135deg,#f8faff 0%,#fff 50%,#f5f3ff 100%);padding:44px;color:#1a1a2e}
.ctp-hero{padding:38px 40px;border-radius:28px;box-shadow:0 20px 50px rgba(0,0,0,.06)}
.ctp-kicker{font-family:var(--font-body) !important;font-size:14px;letter-spacing:2px}
.ctp-hero h1,.ctp-card h2,.ctp-modal-head h2,.ctp-empty h2{font-family:var(--font-heading) !important;font-weight:800}
.ctp-hero h1{font-size:clamp(40px,4.6vw,56px);line-height:1.08;margin:14px 0 16px;letter-spacing:-.045em}
.ctp-hero p{font-size:17px;line-height:1.8;color:#666}
.ctp-hero-badge{min-width:155px;padding:22px;border-radius:20px}
.ctp-hero-badge b{font-family:var(--font-heading) !important;font-size:30px}
.ctp-hero-badge small{font-size:13px}
.ctp-message{font-size:14px;padding:15px 18px;margin:22px 0}
.ctp-grid{gap:28px;margin-top:28px}
.ctp-card{border-radius:24px;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,.035);transition:all .35s ease}
.ctp-card:hover{transform:translateY(-7px);box-shadow:0 25px 50px rgba(102,126,234,.12);border-color:#667eea}
.ctp-top>span{font-size:12px;letter-spacing:1.5px}
.ctp-status{font-size:11px;padding:7px 10px}
.ctp-card h2{font-size:24px;line-height:1.25;margin:18px 0 12px}
.ctp-instructions{font-size:15px;line-height:1.75;min-height:92px;color:#666}
.ctp-meta{font-size:13px;padding-top:16px}
.ctp-actions{margin-top:22px;gap:12px}
.ctp-primary,.ctp-secondary{font-family:var(--font-body) !important;font-size:14px;padding:12px 18px;border-radius:50px}
.ctp-primary{background:linear-gradient(135deg,#667eea,#764ba2);box-shadow:0 10px 25px rgba(102,126,234,.2)}
.ctp-link{font-size:13px}
.ctp-feedback{padding:15px;border-radius:15px;font-size:13px}
.ctp-empty{min-height:380px;border-radius:24px;font-size:15px}
.ctp-empty h2{font-size:27px}
@media(max-width:850px){.candidate-tasks-page{padding:24px}.ctp-hero{padding:30px}.ctp-card{padding:26px}}
@media(max-width:600px){.candidate-tasks-page{padding:18px}.ctp-hero h1{font-size:38px}.ctp-hero p{font-size:15px}.ctp-card h2{font-size:21px}}

`}</style></div>;
};
export default InterviewTasks;
