import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import "../sop-page.css";
import "../../components/sop/sop.css";

const roles = [
  ["admin","Admin"],["superadmin","Super Admin"],["client","Client"],["candidate","Candidate"],
  ["hr","HR"],["hr_manager","HR Manager"],["recruiter","Recruiter"],["recruitment_manager","Recruitment Manager"],
  ["finance_manager","Finance Manager"],["hr_partner","HR Partner"],
];

export default function AdminSopForm() {
  const { id } = useParams();
  const edit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:"", department:"General", description:"", version:"1.0", effectiveDate:"",
    status:"draft", applicableRoles:["admin","superadmin"], content:"",
  });
  const [loading,setLoading]=useState(edit);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(() => {
    if (!edit) return;
    api.sops.get(id).then((res)=>{
      if(res?.success){
        const s=res.data;
        setForm({
          title:s.title||"", department:s.department||"General", description:s.description||"",
          version:s.version||"1.0", effectiveDate:s.effectiveDate ? s.effectiveDate.slice(0,10) : "",
          status:s.status||"draft", applicableRoles:s.applicableRoles||[], content:s.content||"",
        });
      }
      setLoading(false);
    });
  },[id,edit]);

  const set = (key,value) => setForm((f)=>({...f,[key]:value}));
  const toggleRole = (role) => setForm((f)=>({...f,applicableRoles:f.applicableRoles.includes(role)?f.applicableRoles.filter((r)=>r!==role):[...f.applicableRoles,role]}));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    const res = edit ? await api.sops.update(id, form) : await api.sops.create(form);
    setSaving(false);
    if(res?.success){ navigate("/admin/sops"); return; }
    setMessage(res?.message || "Unable to save SOP.");
  };

  if(loading) return <div className="sop-page"><div className="sop-container">Loading…</div></div>;

  return (
    <div className="sop-page">
      <div className="sop-container">
        <div className="sop-header">
          <div><div className="sop-kicker">ADMIN CONTROL</div><h1>{edit ? "Edit SOP" : "Create New SOP"}</h1><p>Build a versioned SOP, select who can see it, then publish it to their portal and SOP inbox.</p></div>
          <Link className="sop-btn sop-btn-secondary" to="/admin/sops">← Back to SOPs</Link>
        </div>
        <form className="sop-form" onSubmit={save}>
          <div className="sop-form-grid">
            <div className="sop-field"><label>SOP Title *</label><input className="sop-input" value={form.title} onChange={(e)=>set("title",e.target.value)} required /></div>
            <div className="sop-field"><label>Department</label><input className="sop-input" value={form.department} onChange={(e)=>set("department",e.target.value)} /></div>
            <div className="sop-field"><label>Version</label><input className="sop-input" value={form.version} onChange={(e)=>set("version",e.target.value)} /></div>
            <div className="sop-field"><label>Effective date</label><input className="sop-input" type="date" value={form.effectiveDate} onChange={(e)=>set("effectiveDate",e.target.value)} /></div>
            <div className="sop-field"><label>Status</label><select className="sop-select" value={form.status} onChange={(e)=>set("status",e.target.value)}><option value="draft">Draft</option><option value="published">Publish now</option></select></div>
            <div className="sop-field"><label>Short description</label><input className="sop-input" value={form.description} onChange={(e)=>set("description",e.target.value)} placeholder="What this SOP covers…" /></div>
            <div className="sop-field full"><label>Visible to roles</label><div className="sop-checks">{roles.map(([value,label])=><label className="sop-check" key={value}><input type="checkbox" checked={form.applicableRoles.includes(value)} onChange={()=>toggleRole(value)} />{label}</label>)}</div></div>
            <div className="sop-field full"><label>Full SOP content * (Markdown-style headings/lists supported)</label><textarea className="sop-textarea" value={form.content} onChange={(e)=>set("content",e.target.value)} required placeholder="# Purpose\n\nWrite the complete SOP here…" /></div>
          </div>
          {message && <div className="sop-inline-message">{message}</div>}
          <div className="sop-email-actions"><button type="submit" className="sop-btn sop-btn-primary" disabled={saving}>{saving ? "Saving…" : edit ? "Save Changes" : form.status==="published" ? "Publish SOP" : "Save Draft"}</button><Link className="sop-btn sop-btn-secondary" to="/admin/sops">Cancel</Link></div>
        </form>
      </div>
    </div>
  );
}
