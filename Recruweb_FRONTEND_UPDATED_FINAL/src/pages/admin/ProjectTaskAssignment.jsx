import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Layers3,
  Plus,
  Search,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";

const initialForm = {
  candidateId: "",
  projectName: "",
  title: "",
  instructions: "",
  dueDate: "",
  priority: "medium",
  estimatedMinutes: 60,
};

const statusLabel = {
  assigned: "Assigned",
  in_progress: "In Progress",
  submitted: "Submitted",
  reviewed: "Reviewed",
};

const ProjectTaskAssignment = () => {
  const [candidates, setCandidates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [candidateRes, taskRes] = await Promise.all([
        api.candidates.getAll({ page: 1, limit: 500 }),
        api.tasks.getAll({}),
      ]);
      setCandidates(candidateRes?.data || []);
      setTasks((taskRes?.data || []).filter((task) => task.taskType === "interview_task"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const interviewCandidates = useMemo(() => {
    const withInterviews = candidates.filter((candidate) => ["Interview Scheduled", "Interview Cleared"].includes(candidate.pipelineStage));
    return withInterviews.length ? withInterviews : candidates;
  }, [candidates]);

  const candidateById = useMemo(() => new Map(candidates.map((candidate) => [Number(candidate.id), candidate])), [candidates]);

  const selectedCandidate = candidateById.get(Number(form.candidateId));
  const filteredTasks = tasks.filter((task) => {
    const candidate = candidateById.get(Number(task.relatedId));
    const candidateName = candidate ? `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() : task.assignedTo || "";
    const haystack = `${task.title} ${task.projectName || ""} ${candidateName}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.candidateStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreate = () => {
    setForm(initialForm);
    setMessage("");
    setShowForm(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!selectedCandidate?.userId) {
      setMessage("This candidate does not have a linked candidate portal account yet. Ask the candidate to register/login first.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.tasks.create({
        title: form.title.trim(),
        description: form.instructions.trim(),
        instructions: form.instructions.trim(),
        projectName: form.projectName.trim(),
        dueDate: form.dueDate || null,
        priority: form.priority,
        relatedType: "candidate",
        relatedId: selectedCandidate.id,
        assignedToId: selectedCandidate.userId,
        assignedTo: `${selectedCandidate.firstName || ""} ${selectedCandidate.lastName || ""}`.trim(),
        taskType: "interview_task",
        estimatedMinutes: Number(form.estimatedMinutes) || null,
        candidateStatus: "assigned",
        assignedAt: new Date().toISOString(),
        status: "pending",
      });
      if (!res?.success) throw new Error(res?.message || "Task assignment failed");
      setMessage("Project task assigned successfully. It is now visible in the candidate portal.");
      setShowForm(false);
      await load();
    } catch (error) {
      setMessage(error.message || "Unable to assign task");
    } finally {
      setSaving(false);
    }
  };

  const updateStaffReview = async (task, candidateStatus) => {
    const res = await api.tasks.update(task.id, {
      candidateStatus,
      status: candidateStatus === "reviewed" ? "done" : "in-progress",
      reviewedAt: candidateStatus === "reviewed" ? new Date().toISOString() : null,
    });
    if (res?.success) setTasks((prev) => prev.map((item) => (item.id === task.id ? res.data : item)));
  };

  return (
    <div className="interview-task-page">
      <div className="itp-glow itp-glow-a" /><div className="itp-glow itp-glow-b" />
      <header className="itp-hero">
        <div>
          <span className="itp-kicker"><Sparkles size={14} /> INTERVIEW WORKFLOW</span>
          <h1>Project &amp; Task Assignment <span>Studio</span></h1>
          <p>Assign practical projects directly to candidates who reach the interview stage. Every task appears inside the candidate portal with instructions, deadline and submission tracking.</p>
        </div>
        <button className="itp-primary" onClick={openCreate}><Plus size={18} /> Assign Interview Task</button>
      </header>

      {message && <div className="itp-message"><CheckCircle2 size={17} />{message}<button onClick={() => setMessage("")}><X size={15}/></button></div>}

      <section className="itp-stats">
        <div><span><Target size={17}/></span><b>{interviewCandidates.length}</b><small>Interview-ready candidates</small></div>
        <div><span><Layers3 size={17}/></span><b>{tasks.length}</b><small>Assigned projects</small></div>
        <div><span><Clock3 size={17}/></span><b>{tasks.filter(t => t.candidateStatus === "submitted").length}</b><small>Awaiting review</small></div>
        <div><span><CheckCircle2 size={17}/></span><b>{tasks.filter(t => t.candidateStatus === "reviewed").length}</b><small>Reviewed</small></div>
      </section>

      <section className="itp-toolbar">
        <div className="itp-search"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidate, project or task..." /></div>
        <div className="itp-filter"><Filter size={16}/><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All statuses</option><option value="assigned">Assigned</option><option value="in_progress">In Progress</option><option value="submitted">Submitted</option><option value="reviewed">Reviewed</option></select></div>
      </section>

      <section className="itp-table-card">
        <div className="itp-table-head"><div><span className="itp-kicker">LIVE TASK QUEUE</span><h2>Candidate Projects</h2></div><span className="itp-count">{filteredTasks.length} tasks</span></div>
        {loading ? <div className="itp-empty">Loading interview candidates and task queue…</div> : !filteredTasks.length ? <div className="itp-empty"><FileText size={34}/><h3>No interview projects yet</h3><p>Assign a practical task to a candidate after their interview.</p><button className="itp-secondary" onClick={openCreate}>Create first task <ArrowRight size={15}/></button></div> : <div className="itp-task-grid">{filteredTasks.map((task) => {
          const candidate = candidateById.get(Number(task.relatedId));
          const name = candidate ? `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() : task.assignedTo || "Candidate";
          return <article className="itp-task-card" key={task.id}>
            <div className="itp-task-top"><span className={`itp-priority ${task.priority}`}>{task.priority}</span><span className={`itp-status ${task.candidateStatus || "assigned"}`}>{statusLabel[task.candidateStatus] || task.candidateStatus || "Assigned"}</span></div>
            <div className="itp-avatar"><UserRound size={18}/></div>
            <h3>{task.projectName || "Interview Assignment"}</h3><h4>{task.title}</h4><p>{name}</p>
            <div className="itp-meta"><span><CalendarDays size={14}/>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No deadline"}</span><span><Clock3 size={14}/>{task.estimatedMinutes || 60} min</span></div>
            {task.submissionUrl && <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="itp-submission"><ExternalLink size={14}/> View submission</a>}
            <div className="itp-actions">{task.candidateStatus === "submitted" && <button onClick={() => updateStaffReview(task, "reviewed")}><CheckCircle2 size={15}/> Mark reviewed</button>}{task.candidateStatus === "reviewed" && <span className="itp-reviewed">✓ Reviewed</span>}</div>
          </article>;
        })}</div>}
      </section>

      {showForm && <div className="itp-modal-backdrop" onClick={() => setShowForm(false)}><div className="itp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="itp-modal-head"><div><span className="itp-kicker">NEW ASSIGNMENT</span><h2>Send a project to a candidate</h2><p>The candidate will see this instantly in <b>Candidate Portal → Interview Tasks</b>.</p></div><button onClick={() => setShowForm(false)}><X size={20}/></button></div>
        <form onSubmit={submit} className="itp-form">
          <label>Candidate *<select value={form.candidateId} onChange={(e) => setForm({ ...form, candidateId: e.target.value })} required><option value="">Select interview candidate</option>{interviewCandidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.firstName} {candidate.lastName} · {candidate.email}{candidate.userId ? " · Portal ready" : " · No portal account"}</option>)}</select></label>
          <div className="itp-two"><label>Project name *<input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="e.g. React Dashboard Challenge" required /></label><label>Task title *<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Build the candidate analytics screen" required /></label></div>
          <label>Instructions *<textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={6} placeholder="Explain deliverables, acceptance criteria, files/links expected and how the candidate should submit." required /></label>
          <div className="itp-three"><label>Deadline<input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label><label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Estimated minutes<input type="number" min="10" max="1440" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })} /></label></div>
          <div className="itp-form-footer"><button type="button" className="itp-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="itp-primary" disabled={saving}>{saving ? "Assigning…" : "Assign Task →"}</button></div>
        </form>
      </div></div>}

      <style>{`
        .interview-task-page{min-height:100%;padding:34px;position:relative;overflow:hidden;background:linear-gradient(135deg,#f8faff 0%,#fff 48%,#f5f3ff 100%);color:#0f172a}.itp-glow{position:absolute;border-radius:999px;filter:blur(60px);opacity:.3;pointer-events:none}.itp-glow-a{width:300px;height:300px;right:-80px;top:10px;background:#c4b5fd}.itp-glow-b{width:260px;height:260px;left:-120px;bottom:100px;background:#bfdbfe}.itp-hero{position:relative;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:34px;border:1px solid #e2e8f0;border-radius:28px;background:rgba(255,255,255,.8);backdrop-filter:blur(18px);box-shadow:0 25px 60px rgba(15,23,42,.08);z-index:1}.itp-kicker{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:900;letter-spacing:.12em;color:#6366f1}.itp-hero h1{font-size:clamp(30px,4vw,50px);line-height:1.05;margin:10px 0 12px;letter-spacing:-.04em}.itp-hero h1 span{background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;color:transparent}.itp-hero p{max-width:780px;color:#64748b;line-height:1.7;margin:0}.itp-primary,.itp-secondary{border:0;border-radius:14px;padding:12px 17px;font-weight:850;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;text-decoration:none}.itp-primary{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 12px 28px rgba(79,70,229,.25)}.itp-primary:disabled{opacity:.6;cursor:not-allowed}.itp-secondary{background:#fff;color:#4338ca;border:1px solid #c7d2fe}.itp-message{position:relative;z-index:2;margin:18px 0;padding:13px 16px;border-radius:14px;background:#ecfdf5;border:1px solid #a7f3d0;color:#047857;display:flex;align-items:center;gap:9px;font-weight:700}.itp-message button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}.itp-stats{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:18px 0}.itp-stats>div{padding:19px;border:1px solid #e2e8f0;background:rgba(255,255,255,.82);border-radius:20px;display:grid;grid-template-columns:40px 1fr;column-gap:12px;box-shadow:0 12px 35px rgba(15,23,42,.05)}.itp-stats span{grid-row:span 2;width:40px;height:40px;border-radius:13px;background:#eef2ff;color:#4f46e5;display:grid;place-items:center}.itp-stats b{font-size:25px;line-height:1}.itp-stats small{color:#64748b;font-weight:700}.itp-toolbar{position:relative;z-index:1;display:flex;gap:12px;margin:18px 0}.itp-search,.itp-filter{background:#fff;border:1px solid #e2e8f0;border-radius:15px;padding:11px 14px;display:flex;align-items:center;gap:9px}.itp-search{flex:1}.itp-search input,.itp-filter select{border:0;outline:0;background:transparent;font:inherit;color:#334155;width:100%}.itp-filter{min-width:180px}.itp-table-card{position:relative;z-index:1;background:rgba(255,255,255,.9);border:1px solid #e2e8f0;border-radius:26px;padding:25px;box-shadow:0 20px 55px rgba(15,23,42,.07)}.itp-table-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.itp-table-head h2{margin:5px 0 0;font-size:25px}.itp-count{padding:7px 11px;border-radius:99px;background:#f1f5f9;color:#475569;font-weight:800;font-size:12px}.itp-task-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.itp-task-card{border:1px solid #e2e8f0;border-radius:20px;padding:18px;background:linear-gradient(180deg,#fff,#fafbff);transition:.25s;position:relative}.itp-task-card:hover{transform:translateY(-3px);box-shadow:0 16px 35px rgba(79,70,229,.1);border-color:#c7d2fe}.itp-task-top{display:flex;justify-content:space-between;gap:8px}.itp-priority,.itp-status{font-size:10px;text-transform:uppercase;font-weight:900;letter-spacing:.07em;padding:6px 8px;border-radius:99px}.itp-priority.high{background:#fef2f2;color:#dc2626}.itp-priority.medium{background:#fff7ed;color:#c2410c}.itp-priority.low{background:#eff6ff;color:#2563eb}.itp-status.assigned{background:#eef2ff;color:#4f46e5}.itp-status.in_progress{background:#eff6ff;color:#2563eb}.itp-status.submitted{background:#fff7ed;color:#c2410c}.itp-status.reviewed{background:#ecfdf5;color:#047857}.itp-avatar{margin:17px 0 10px;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#ede9fe,#dbeafe);color:#4f46e5}.itp-task-card h3{font-size:13px;color:#6366f1;margin:0 0 4px}.itp-task-card h4{font-size:17px;margin:0 0 6px}.itp-task-card p{color:#64748b;font-weight:700;margin:0 0 13px}.itp-meta{display:flex;gap:13px;flex-wrap:wrap;color:#64748b;font-size:12px;font-weight:700}.itp-meta span{display:flex;align-items:center;gap:5px}.itp-submission{margin-top:13px;display:inline-flex;align-items:center;gap:6px;color:#4f46e5;font-weight:800;font-size:12px}.itp-actions{margin-top:14px}.itp-actions button{border:1px solid #c7d2fe;background:#eef2ff;color:#4338ca;border-radius:10px;padding:8px 10px;font-weight:800;cursor:pointer;display:inline-flex;gap:6px;align-items:center}.itp-reviewed{font-size:12px;color:#047857;font-weight:900}.itp-empty{min-height:240px;display:grid;place-items:center;text-align:center;color:#64748b;padding:35px}.itp-empty h3{margin:12px 0 3px;color:#0f172a}.itp-empty p{margin:0 0 15px}.itp-modal-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.48);backdrop-filter:blur(7px);display:grid;place-items:center;padding:20px}.itp-modal{width:min(850px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:25px;box-shadow:0 30px 100px rgba(15,23,42,.3)}.itp-modal-head{padding:24px 26px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:20px}.itp-modal-head h2{margin:6px 0;font-size:25px}.itp-modal-head p{margin:0;color:#64748b;font-size:13px}.itp-modal-head button{border:0;background:#f1f5f9;width:38px;height:38px;border-radius:12px;cursor:pointer}.itp-form{padding:25px;display:grid;gap:15px}.itp-form label{display:grid;gap:7px;font-size:12px;font-weight:900;color:#334155}.itp-form input,.itp-form select,.itp-form textarea{font:inherit;border:1px solid #cbd5e1;border-radius:12px;padding:11px 12px;outline:none;background:#fff;color:#0f172a}.itp-form textarea{resize:vertical}.itp-form input:focus,.itp-form select:focus,.itp-form textarea:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}.itp-two,.itp-three{display:grid;grid-template-columns:1fr 1fr;gap:14px}.itp-three{grid-template-columns:1fr 1fr 1fr}.itp-form-footer{display:flex;justify-content:flex-end;gap:10px;padding-top:6px}@media(max-width:1100px){.itp-task-grid{grid-template-columns:repeat(2,1fr)}.itp-stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.interview-task-page{padding:18px}.itp-hero{padding:22px;align-items:stretch;flex-direction:column}.itp-hero .itp-primary{width:100%}.itp-stats,.itp-task-grid{grid-template-columns:1fr}.itp-toolbar{flex-direction:column}.itp-filter{width:auto}.itp-two,.itp-three{grid-template-columns:1fr}.itp-modal{max-height:96vh}}
/* Home-page visual language: same fonts, larger hierarchy, softer Recruweb cards. */
.interview-task-page{font-family:var(--font-body) !important;background:linear-gradient(135deg,#f8faff 0%,#fff 50%,#f5f3ff 100%);padding:44px;color:#1a1a2e}
.interview-task-page h1,.interview-task-page h2,.interview-task-page h3,.interview-task-page h4,.interview-task-page b{font-family:var(--font-heading) !important}
.itp-hero{padding:38px 40px;border-radius:28px;box-shadow:0 20px 50px rgba(0,0,0,.06)}
.itp-kicker{font-family:var(--font-body) !important;font-size:14px;letter-spacing:2px}
.itp-hero h1{font-size:clamp(40px,4.6vw,56px);line-height:1.08;margin:14px 0 16px;letter-spacing:-.045em}
.itp-hero p{font-size:17px;line-height:1.8;color:#666}
.itp-primary,.itp-secondary{font-family:var(--font-body) !important;font-size:14px;padding:13px 20px;border-radius:50px}
.itp-primary{background:linear-gradient(135deg,#667eea,#764ba2);box-shadow:0 10px 25px rgba(102,126,234,.2)}
.itp-message{font-size:14px;padding:15px 18px;margin:22px 0}
.itp-stats{gap:22px;margin:22px 0}
.itp-stats>div{padding:24px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.035)}
.itp-stats b{font-size:30px}
.itp-stats small{font-size:12px}
.itp-toolbar{margin:22px 0;gap:14px}
.itp-search,.itp-filter{padding:13px 16px;border-radius:15px;font-size:14px}
.itp-table-card{border-radius:28px;padding:32px;box-shadow:0 15px 40px rgba(0,0,0,.05)}
.itp-table-head h2{font-size:28px}
.itp-count{font-size:13px}
.itp-task-grid{gap:24px}
.itp-task-card{border-radius:24px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,.035);transition:all .35s ease}
.itp-task-card:hover{transform:translateY(-7px);box-shadow:0 25px 50px rgba(102,126,234,.12);border-color:#667eea}
.itp-priority,.itp-status{font-size:11px;padding:7px 10px}
.itp-task-card h3{font-size:14px}
.itp-task-card h4{font-size:20px;line-height:1.3}
.itp-task-card p{font-size:14px;line-height:1.7}
.itp-meta{font-size:13px}
.itp-actions button{font-family:var(--font-body) !important;font-size:13px;padding:10px 13px;border-radius:12px}
.itp-empty{font-size:15px}
.itp-empty h3{font-family:var(--font-heading) !important;font-size:25px}
.itp-modal{border-radius:26px}
.itp-modal-head h2{font-size:28px}
.itp-form{font-size:14px}
.itp-form label{font-size:13px}
.itp-form input,.itp-form select,.itp-form textarea{font-family:var(--font-body) !important;font-size:14px;padding:13px;border-radius:13px}
@media(max-width:760px){.interview-task-page{padding:22px}.itp-hero{padding:28px}.itp-hero h1{font-size:38px}.itp-table-card{padding:24px}.itp-stats{gap:14px}}

      `}</style>
    </div>
  );
};

export default ProjectTaskAssignment;
