import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Document, Packer, Paragraph, TextRun } from "docx";
import useAuth from "../hooks/useAuth";
import { api } from "../utils/api";
import ScrollIndicator from "../components/ScrollIndicator";
import resumeTemplates, { SAMPLE_PREVIEW_DATA } from "../data/resumeTemplates";
import ResumePreview from "../components/resume/ResumePreview";
import { downloadResumeDocx } from "../utils/generateResumeDocx";
import "./styles/resumeBuilder.css";
import "./styles/resumeChecker.css";

const emptyExperience = () => ({
  jobTitle: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  bullets: [""],
});
const emptyEducation = () => ({
  degree: "",
  institution: "",
  location: "",
  startDate: "",
  endDate: "",
  grade: "",
});
const emptyProject = () => ({ name: "", description: "", techStack: "" });
const emptyCert = () => ({ name: "", issuer: "", date: "" });

const emptyResumeData = () => ({
  personal: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  experience: [emptyExperience()],
  education: [emptyEducation()],
  skills: [],
  projects: [emptyProject()],
  certifications: [emptyCert()],
  languages: [],
  achievements: [""],
});

const DEFAULT_SECTIONS = [
  { key: "personal", label: "1. Personal Info" },
  { key: "summary", label: "2. Summary" },
  { key: "experience", label: "3. Experience" },
  { key: "education", label: "4. Education" },
  { key: "skills", label: "5. Skills" },
  { key: "projects", label: "6. Projects" },
  { key: "certifications", label: "7. Certifications" },
  { key: "languages", label: "8. Languages" },
  { key: "achievements", label: "9. Achievements" },
  { key: "finish", label: "10. Review & Reorder" },
];

const PRESET_COLORS = [
  "#4f46e5",
  "#2563eb",
  "#0f766e",
  "#3b5998",
  "#b91c1c",
  "#047857",
  "#d97706",
  "#1f2937",
];

export default function ResumeBuilder() {
  const { isAuthenticated } = useAuth();

  const [view, setView] = useState("gallery"); // gallery | builder
  const [previewModalTemplate, setPreviewModalTemplate] = useState(null);
  const [modalAccentColor, setModalAccentColor] = useState("#4f46e5");

  const [resumeId, setResumeId] = useState(null);
  const [title, setTitle] = useState("Untitled Resume");
  const [templateId, setTemplateId] = useState(resumeTemplates[0].id);
  const [accentColor, setAccentColor] = useState(
    resumeTemplates[0].defaultAccent,
  );
  const [data, setData] = useState(emptyResumeData());
  const [step, setStep] = useState(0);

  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [targetJobDescription, setTargetJobDescription] = useState("");
  const [liveScore, setLiveScore] = useState(null);
  const [liveScoring, setLiveScoring] = useState(false);

  const [skillInput, setSkillInput] = useState("");
  const [langName, setLangName] = useState("");
  const [langLevel, setLangLevel] = useState("Fluent");

  const [saving, setSaving] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [myResumes, setMyResumes] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadMyResumes();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || view !== "builder") return;
    setLiveScoring(true);
    const t = setTimeout(async () => {
      const res = await api.resumes.quickScore({ data, targetJobDescription });
      if (res?.success) setLiveScore(res.data);
      setLiveScoring(false);
    }, 700);
    return () => clearTimeout(t);
  }, [data, targetJobDescription, isAuthenticated, view]);

  const loadMyResumes = async () => {
    setLoadingMine(true);
    const res = await api.resumes.getAll();
    if (res?.success) setMyResumes(res.data);
    setLoadingMine(false);
  };

  const openTemplatePreview = (tpl) => {
    setModalAccentColor(tpl.defaultAccent);
    setPreviewModalTemplate(tpl);
  };

  const useTemplate = (tpl) => {
    setTemplateId(tpl.id);
    setAccentColor(modalAccentColor || tpl.defaultAccent);
    setPreviewModalTemplate(null);
    setView("builder");
    setStep(0);
  };

  const openSavedResume = async (id) => {
    const res = await api.resumes.getById(id);
    if (!res?.success) return toast.error("Could not load resume");
    const r = res.data;
    setResumeId(r.id);
    setTitle(r.title);
    setTemplateId(r.templateId);
    setAccentColor(
      r.accentColor ||
        resumeTemplates.find((t) => t.id === r.templateId)?.defaultAccent,
    );
    setData({ ...emptyResumeData(), ...r.data });
    setTargetJobTitle(r.targetJobTitle || "");
    setTargetJobDescription(r.targetJobDescription || "");
    setStep(0);
    setView("builder");
  };

  const startBlank = () => {
    setResumeId(null);
    setTitle("Untitled Resume");
    setData(emptyResumeData());
    setStep(0);
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    setSections(newSections);
    toast.success("Section order updated successfully!");
  };

  const removeSectionKey = (keyToRemove) => {
    if (sections.length <= 2)
      return toast.error("Keep at least personal and one more section.");
    setSections(sections.filter((s) => s.key !== keyToRemove));
    toast.success("Section skipped successfully!");
  };

  const resetSections = () => {
    setSections(DEFAULT_SECTIONS);
    toast.success("Sections reset to default!");
  };

  const setPersonal = (field, value) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [field]: value } }));
  const setListItem = (listName, idx, field, value) =>
    setData((d) => ({
      ...d,
      [listName]: d[listName].map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      ),
    }));
  const addListItem = (listName, factory) =>
    setData((d) => ({ ...d, [listName]: [...d[listName], factory()] }));
  const removeListItem = (listName, idx) =>
    setData((d) => ({
      ...d,
      [listName]: d[listName].filter((_, i) => i !== idx),
    }));

  const setBullet = (expIdx, bulletIdx, value) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e, i) =>
        i === expIdx
          ? {
              ...e,
              bullets: e.bullets.map((b, bi) => (bi === bulletIdx ? value : b)),
            }
          : e,
      ),
    }));
  const addBullet = (expIdx) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e, i) =>
        i === expIdx ? { ...e, bullets: [...e.bullets, ""] } : e,
      ),
    }));
  const removeBullet = (expIdx, bulletIdx) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e, i) =>
        i === expIdx
          ? { ...e, bullets: e.bullets.filter((_, bi) => bi !== bulletIdx) }
          : e,
      ),
    }));

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (!data.skills.includes(v))
      setData((d) => ({ ...d, skills: [...d.skills, v] }));
    setSkillInput("");
  };
  const removeSkill = (skill) =>
    setData((d) => ({ ...d, skills: d.skills.filter((s) => s !== skill) }));

  const addLanguage = () => {
    if (!langName.trim()) return;
    setData((d) => ({
      ...d,
      languages: [...d.languages, { name: langName.trim(), level: langLevel }],
    }));
    setLangName("");
  };
  const removeLanguage = (idx) =>
    setData((d) => ({
      ...d,
      languages: d.languages.filter((_, i) => i !== idx),
    }));

  const handleGenerateSummary = async () => {
    if (!isAuthenticated)
      return toast.error("Please login to use AI generation.");
    setGeneratingSummary(true);
    const res = await api.resumes.generateSummary({
      headline: data.personal.headline,
      topSkills: data.skills,
      tone: "professional",
    });
    setGeneratingSummary(false);
    if (res?.success && res.data.summary) {
      setData((d) => ({ ...d, summary: res.data.summary }));
      toast.success("AI summary generated successfully!");
    } else toast.error("Could not generate summary");
  };

  const handleSave = async () => {
    if (!isAuthenticated)
      return toast.error("Please login to save your resume.");
    setSaving(true);
    const payload = {
      title,
      templateId,
      accentColor,
      data,
      targetJobTitle,
      targetJobDescription,
    };
    const res = resumeId
      ? await api.resumes.update(resumeId, payload)
      : await api.resumes.create(payload);
    setSaving(false);
    if (res?.success) {
      if (!resumeId) setResumeId(res.data.id);
      toast.success("Resume saved successfully!");
      loadMyResumes();
    } else toast.error("Failed to save resume");
  };

  const handleDownload = () => {
    window.print();
  };

  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      await downloadResumeDocx(data, accentColor, title || "resume");
      toast.success("Downloaded as Word document (.docx)");
    } catch {
      toast.error("Could not generate Word file.");
    }
    setDownloadingDocx(false);
  };

  const goNext = () => {
    setStep((s) => Math.min(sections.length - 1, s + 1));
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  // ================= GALLERY VIEW =================
  if (view === "gallery") {
    return (
      <div className="resume-builder-wrapper-light">
        {/* Live Floating Particles Background */}
        <div className="rb-particles-container">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="rb-particle"
              style={{
                left: `${(i * 7.5) % 100}%`,
                animationDelay: `${(i * 0.4) % 5}s`,
                animationDuration: `${12 + (i % 6)}s`,
              }}
            ></div>
          ))}
        </div>

        <section className="rb-hero-section-light">
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className="rb-badge">
              <span className="rb-badge-dot"></span>
              <span>Professional Suite</span>
            </div>
            <h1 className="rb-hero-title">
              Choose a Resume <span className="gradient-text">Template</span>
            </h1>
            <p className="rb-hero-subtitle">
              Pick a recruiter-approved design inspired by modern standards, customize colors, and craft your standout resume.
            </p>
          </div>
          <ScrollIndicator />
        </section>

        <section className="section" style={{ paddingTop: '20px', position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
          <div className="container">
            {isAuthenticated && (
              <div className="rb-card-3d rb-my-resumes-container" style={{ marginBottom: '40px', padding: '30px' }}>
                <div className="card-bg-light-glow"></div>
                <div className="rb-my-resumes-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Saved Resumes</h2>
                  <button
                    className="cv-action-btn primary glow-btn"
                    onClick={() => {
                      startBlank();
                      setView("builder");
                    }}
                  >
                    + Create New Resume
                  </button>
                </div>
                {loadingMine ? (
                  <p className="rb-muted" style={{ position: 'relative', zIndex: 2 }}>Loading your resumes…</p>
                ) : myResumes.length === 0 ? (
                  <p className="rb-muted" style={{ position: 'relative', zIndex: 2 }}>You haven't created a resume yet — pick a template below to get started.</p>
                ) : (
                  <div className="rb-my-resumes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', position: 'relative', zIndex: 2 }}>
                    {myResumes.map((r) => (
                      <div
                        key={r.id}
                        className="rb-my-resume-card"
                        onClick={() => openSavedResume(r.id)}
                        style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #cbd5e1', cursor: 'pointer', boxShadow: '0 8px 25px rgba(15, 23, 42, 0.03)', transition: 'all 0.3s ease' }}
                      >
                        <div
                          className="rb-my-resume-top"
                          style={{ background: r.accentColor || "#4f46e5", padding: '14px 16px', color: 'white', fontWeight: 800, fontSize: '13.5px' }}
                        >
                          <span>
                            {(
                              resumeTemplates.find((t) => t.id === r.templateId) || {}
                            ).name || r.templateId}
                          </span>
                        </div>
                        <div className="rb-my-resume-body" style={{ padding: '16px' }}>
                          <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px', fontWeight: '800', fontSize: '15px' }}>{r.title}</strong>
                          <span className="rb-muted" style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700' }}>
                            {r.atsScore != null ? `ATS Score: ${r.atsScore}/100` : "Ready to export"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="card-glow-bar"></div>
              </div>
            )}

            <div className="section-header" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Featured Resume Templates</h2>
            </div>

            <div className="rb-template-grid">
              {resumeTemplates.map((tpl) => (
                <div className="rb-card-3d rb-template-card" key={tpl.id} style={{ padding: '0', overflow: 'hidden' }}>
                  <div className="card-bg-light-glow"></div>
                  <div
                    className="rb-template-thumb"
                    onClick={() => openTemplatePreview(tpl)}
                    style={{ position: 'relative', zIndex: 2, cursor: 'pointer' }}
                  >
                    <div className="rb-template-thumb-inner">
                      <ResumePreview
                        templateId={tpl.id}
                        accentColor={tpl.defaultAccent}
                        data={SAMPLE_PREVIEW_DATA}
                      />
                    </div>
                    {/* Centered compact overlay buttons */}
                    <div className="rb-template-overlay-btns">
                      <button
                        className="cv-action-btn primary glow-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          useTemplate(tpl);
                        }}
                      >
                        Use Template
                      </button>
                      <button
                        className="cv-action-btn secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTemplatePreview(tpl);
                        }}
                      >
                        Quick Preview
                      </button>
                    </div>
                  </div>
                  <div
                    className="rb-template-meta"
                    onClick={() => openTemplatePreview(tpl)}
                    style={{ padding: '20px', position: 'relative', zIndex: 2, background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)' }}
                  >
                    <strong style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '4px' }}>{tpl.name}</strong>
                    <span className="rb-template-category" style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tpl.category}</span>
                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: '8px 0 0', fontWeight: '600' }}>{tpl.bestFor}</p>
                  </div>
                  <div className="card-glow-bar"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {previewModalTemplate && (
          <div
            className="rb-modal-overlay"
            onClick={() => setPreviewModalTemplate(null)}
          >
            <div className="rb-modal-3d" onClick={(e) => e.stopPropagation()}>
              <div className="card-bg-light-glow"></div>
              <button
                className="rb-modal-close"
                onClick={() => setPreviewModalTemplate(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontWeight: '800', cursor: 'pointer' }}
              >
                ✕
              </button>
              <div className="rb-modal-grid" style={{ position: 'relative', zIndex: 2 }}>
                <div className="rb-modal-preview">
                  <ResumePreview
                    templateId={previewModalTemplate.id}
                    accentColor={modalAccentColor}
                    data={SAMPLE_PREVIEW_DATA}
                  />
                </div>
                <div className="rb-modal-info">
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{previewModalTemplate.name}</h3>
                  <span className="rb-template-category" style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' }}>
                    {previewModalTemplate.category}
                  </span>
                  <p style={{ fontSize: '14px', color: '#475569', margin: '12px 0', lineHeight: '1.6', fontWeight: '600' }}>{previewModalTemplate.description}</p>
                  <p className="rb-muted" style={{ margin: '12px 0', fontSize: '13.5px', fontWeight: '700' }}>
                    <strong>Best for:</strong> {previewModalTemplate.bestFor}
                  </p>

                  <div className="rb-modal-color-picker" style={{ margin: '20px 0' }}>
                    <label style={{ fontWeight: 700, fontSize: '13px', display: 'block', marginBottom: '8px', color: '#334155' }}>
                      Select Accent Theme:
                    </label>
                    <div className="rb-color-swatches" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {PRESET_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          style={{ background: col, width: '30px', height: '30px', borderRadius: '50%', border: modalAccentColor === col ? '3px solid #0f172a' : '2px solid white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                          className={modalAccentColor === col ? "active" : ""}
                          onClick={() => setModalAccentColor(col)}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    className="cv-action-btn primary glow-btn"
                    style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
                    onClick={() => useTemplate(previewModalTemplate)}
                  >
                    Use This Template ✨
                  </button>
                </div>
              </div>
              <div className="card-glow-bar"></div>
            </div>
          </div>
        )}

        <style>{`
          .resume-builder-wrapper-light {
            background: #f8fafc;
            color: #0f172a;
            min-height: 100vh;
            font-family: var(--font-body);
            position: relative;
            overflow: hidden;
          }

          .container {
            max-width: 1150px;
            margin: 0 auto;
            padding: 0 24px;
          }

          .rb-particles-container {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
          }

          .rb-particle {
            position: absolute;
            width: 6px;
            height: 6px;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            border-radius: 50%;
            opacity: 0.6;
            animation: floatRbParticle linear infinite;
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          }

          @keyframes floatRbParticle {
            0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
            20% { opacity: 0.7; }
            80% { opacity: 0.7; }
            100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
          }

          .rb-hero-section-light {
            position: relative;
            padding: 110px 0 60px;
            background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                        #f8fafc;
            color: #0f172a;
            text-align: center;
            overflow: hidden;
            z-index: 1;
          }

          .rb-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(99, 102, 241, 0.1);
            border: 1.5px solid rgba(99, 102, 241, 0.25);
            padding: 7px 18px;
            border-radius: 50px;
            font-size: 12.5px;
            font-weight: 800;
            color: #4f46e5;
            margin-bottom: 16px;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
          }

          .rb-badge-dot {
            width: 10px;
            height: 10px;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
          }

          .rb-hero-title {
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 14px;
            letter-spacing: -1px;
            color: #0f172a;
          }

          .gradient-text {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .rb-hero-subtitle {
            font-size: 16.5px;
            color: #64748b;
            line-height: 1.6;
            max-width: 650px;
            margin: 0 auto;
          }

          .rb-card-3d {
            background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
            border-radius: 22px;
            padding: 30px;
            box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
            border: 1.5px solid #cbd5e1;
            position: relative;
            overflow: hidden;
            transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform: perspective(1000px) rotateX(1.5deg);
          }

          .rb-card-3d:hover {
            transform: perspective(1000px) rotateX(0deg) translateY(-6px);
            box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
            border-color: rgba(99, 102, 241, 0.4);
          }

          .card-bg-light-glow {
            position: absolute;
            top: -30px;
            right: -30px;
            width: 90px;
            height: 90px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          }

          .cv-action-btn {
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 13.5px;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
          }

          .cv-action-btn.primary {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #fff;
            box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
          }

          .cv-action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
          }

          .cv-action-btn.secondary {
            background: #f1f5f9;
            color: #334155;
            border: 1.5px solid #cbd5e1;
          }

          .cv-action-btn.secondary:hover {
            background: #e2e8f0;
            border-color: #94a3b8;
          }

          .rb-template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 28px;
          }

          .rb-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .rb-modal-3d {
            background: #ffffff;
            border-radius: 24px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            padding: 40px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.3);
            border: 1.5px solid #cbd5e1;
          }

          .rb-modal-grid {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 30px;
          }

          .card-glow-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3.5px;
            background: linear-gradient(90deg, #6366f1, #a855f7);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s ease;
          }

          .rb-card-3d:hover .card-glow-bar,
          .rb-modal-3d:hover .card-glow-bar {
            transform: scaleX(1);
          }

          @media(max-width: 768px) {
            .rb-modal-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  // ================= BUILDER VIEW =================
  const currentSection = sections[step] || sections[0];

  return (
    <div className="resume-builder-wrapper-light rb-builder-layout">
      {/* Live Floating Particles Background */}
      <div className="rb-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="rb-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Top Action Bar */}
      <div className="rb-builder-topbar no-print" style={{ position: 'relative', zIndex: 10 }}>
        <button
          className="cv-action-btn secondary"
          onClick={() => setView("gallery")}
          style={{ padding: '8px 14px', fontSize: '13px' }}
        >
          ← Change Template
        </button>
        <input
          className="rb-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resume Title"
          style={{ background: 'white', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: '700' }}
        />
        <div className="rb-topbar-right" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="rb-template-switch"
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              const t = resumeTemplates.find((x) => x.id === e.target.value);
              if (t) setAccentColor(t.defaultAccent);
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: '700', background: 'white' }}
          >
            {resumeTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="rb-color-adjuster-top" title="Accent Color">
            <input
              type="color"
              className="rb-color-picker"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              style={{ width: '36px', height: '36px', border: 'none', borderRadius: '50%', cursor: 'pointer' }}
            />
          </div>
          <button
            className="cv-action-btn secondary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            className="cv-action-btn secondary"
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
          >
            ⬇ Word
          </button>
          <button className="cv-action-btn primary glow-btn" onClick={handleDownload}>
            ⬇ PDF
          </button>
        </div>
      </div>

      <div className="rb-builder-body container" style={{ position: 'relative', zIndex: 2, padding: '30px 24px' }}>
        {/* Left Wizard Form Panel */}
        <div className="rb-card-3d rb-wizard no-print" style={{ padding: '30px' }}>
          <div className="card-bg-light-glow"></div>
          <div className="rb-steps-nav" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '25px', position: 'relative', zIndex: 2 }}>
            {sections.map((s, i) => (
              <button
                key={s.key}
                className={`rb-step-pill-clean ${i === step ? "active" : ""}`}
                onClick={() => setStep(i)}
                style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '800', border: i === step ? '1.5px solid #4f46e5' : '1.5px solid #cbd5e1', background: i === step ? '#e0e7ff' : '#ffffff', color: i === step ? '#4f46e5' : '#475569', cursor: 'pointer' }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="rb-step-panel" style={{ position: 'relative', zIndex: 2 }}>
            {currentSection.key === "personal" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '20px' }}>
                  <h3>Personal Information</h3>
                  <p>Add your contact details and professional links</p>
                </div>
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group-custom">
                    <label>Full Name</label>
                    <input
                      value={data.personal.fullName}
                      onChange={(e) => setPersonal("fullName", e.target.value)}
                      placeholder="e.g., Aarav Sharma"
                    />
                  </div>
                  <div className="form-group-custom">
                    <label>Professional Headline</label>
                    <input
                      value={data.personal.headline}
                      onChange={(e) => setPersonal("headline", e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div className="form-group-custom">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={data.personal.email}
                      onChange={(e) => setPersonal("email", e.target.value)}
                      placeholder="aarav@example.com"
                    />
                  </div>
                  <div className="form-group-custom">
                    <label>Phone Number</label>
                    <input
                      value={data.personal.phone}
                      onChange={(e) => setPersonal("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="form-group-custom">
                    <label>Location</label>
                    <input
                      value={data.personal.location}
                      onChange={(e) => setPersonal("location", e.target.value)}
                      placeholder="New Delhi, India"
                    />
                  </div>
                  <div className="form-group-custom">
                    <label>LinkedIn Profile</label>
                    <input
                      value={data.personal.linkedin}
                      onChange={(e) => setPersonal("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div className="form-group-custom full-width" style={{ gridColumn: 'span 2' }}>
                    <label>Portfolio / Website</label>
                    <input
                      value={data.personal.website}
                      onChange={(e) => setPersonal("website", e.target.value)}
                      placeholder="https://portfolio.dev"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentSection.key === "summary" && (
              <div className="rb-form-stack">
                <div className="rb-form-row-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div className="card-top-heading" style={{ margin: 0 }}>
                    <h3>Professional Summary</h3>
                    <p style={{ margin: 0 }}>Briefly describe your career highlights and expertise</p>
                  </div>
                  <button
                    className="cv-action-btn secondary"
                    onClick={handleGenerateSummary}
                    disabled={generatingSummary}
                  >
                    {generatingSummary ? "Generating…" : "✨ AI Generate"}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={data.summary}
                  onChange={(e) =>
                    setData((d) => ({ ...d, summary: e.target.value }))
                  }
                  placeholder="Results-driven professional with over 5 years of experience building scalable applications..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                />
              </div>
            )}

            {currentSection.key === "experience" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '15px' }}>
                  <h3>Work Experience</h3>
                  <p>List your professional history in reverse chronological order</p>
                </div>
                {data.experience.map((exp, idx) => (
                  <div className="experience-entry-box" key={idx}>
                    <div className="entry-header">
                      <h4>Position #{idx + 1}</h4>
                      {data.experience.length > 1 && (
                        <button
                          className="remove-btn"
                          onClick={() => removeListItem("experience", idx)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group-custom">
                        <label>Job Title</label>
                        <input
                          value={exp.jobTitle}
                          onChange={(e) =>
                            setListItem("experience", idx, "jobTitle", e.target.value)
                          }
                          placeholder="e.g., Frontend Developer"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Company Name</label>
                        <input
                          value={exp.company}
                          onChange={(e) =>
                            setListItem("experience", idx, "company", e.target.value)
                          }
                          placeholder="e.g., Tech Corp"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Location</label>
                        <input
                          value={exp.location}
                          onChange={(e) =>
                            setListItem("experience", idx, "location", e.target.value)
                          }
                          placeholder="Remote / Bangalore"
                        />
                      </div>
                      <div className="form-group-custom" style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
                        <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) =>
                              setListItem("experience", idx, "current", e.target.checked)
                            }
                          />
                          <span>I currently work here</span>
                        </label>
                      </div>
                      <div className="form-group-custom">
                        <label>Start Date</label>
                        <input
                          value={exp.startDate}
                          onChange={(e) =>
                            setListItem("experience", idx, "startDate", e.target.value)
                          }
                          placeholder="Jan 2022"
                        />
                      </div>
                      {!exp.current && (
                        <div className="form-group-custom">
                          <label>End Date</label>
                          <input
                            value={exp.endDate}
                            onChange={(e) =>
                              setListItem("experience", idx, "endDate", e.target.value)
                            }
                            placeholder="Dec 2023"
                          />
                        </div>
                      )}
                    </div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#334155', marginTop: '14px', marginBottom: '6px' }}>
                      Key Responsibilities & Impact
                    </label>
                    {exp.bullets.map((b, bi) => (
                      <div className="rb-bullet-row" key={bi} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          value={b}
                          onChange={(e) => setBullet(idx, bi, e.target.value)}
                          placeholder="• Built high-performance web components..."
                          style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '13.5px', background: '#f8fafc', outline: 'none' }}
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            className="remove-btn"
                            onClick={() => removeBullet(idx, bi)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      className="cv-action-btn secondary"
                      style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => addBullet(idx)}
                    >
                      + Add Bullet Point
                    </button>
                  </div>
                ))}
                <button
                  className="add-more-btn"
                  onClick={() => addListItem("experience", emptyExperience)}
                >
                  + Add Another Position
                </button>
              </div>
            )}

            {currentSection.key === "education" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '15px' }}>
                  <h3>Education</h3>
                  <p>Add your academic background</p>
                </div>
                {data.education.map((edu, idx) => (
                  <div className="experience-entry-box" key={idx}>
                    <div className="entry-header">
                      <h4>Education #{idx + 1}</h4>
                      {data.education.length > 1 && (
                        <button
                          className="remove-btn"
                          onClick={() => removeListItem("education", idx)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group-custom">
                        <label>Degree / Qualification</label>
                        <input
                          value={edu.degree}
                          onChange={(e) =>
                            setListItem("education", idx, "degree", e.target.value)
                          }
                          placeholder="B.Tech in Computer Science"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Institution / University</label>
                        <input
                          value={edu.institution}
                          onChange={(e) =>
                            setListItem("education", idx, "institution", e.target.value)
                          }
                          placeholder="University Name"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Grade / CGPA</label>
                        <input
                          value={edu.grade}
                          onChange={(e) =>
                            setListItem("education", idx, "grade", e.target.value)
                          }
                          placeholder="8.9 CGPA"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="add-more-btn"
                  onClick={() => addListItem("education", emptyEducation)}
                >
                  + Add Another Degree
                </button>
              </div>
            )}

            {currentSection.key === "skills" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '15px' }}>
                  <h3>Key Skills</h3>
                  <p>Add technical and professional skills tailored to your role</p>
                </div>
                <div className="rb-tag-input-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                    placeholder="Type a skill (e.g. React, Python) and press Enter"
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                  />
                  <button className="cv-action-btn primary" onClick={addSkill}>
                    Add Skill
                  </button>
                </div>
                <div className="rb-chip-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {data.skills.map((s) => (
                    <span className="doc-skill-tag" key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: '1.5px solid #cbd5e1' }}>
                      {s} <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '800' }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentSection.key === "projects" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '15px' }}>
                  <h3>Key Projects</h3>
                  <p>Highlight significant side projects or enterprise deliverables</p>
                </div>
                {data.projects.map((pr, idx) => (
                  <div className="experience-entry-box" key={idx}>
                    <div className="entry-header">
                      <h4>Project #{idx + 1}</h4>
                      {data.projects.length > 1 && (
                        <button
                          className="remove-btn"
                          onClick={() => removeListItem("projects", idx)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group-custom">
                        <label>Project Name</label>
                        <input
                          value={pr.name}
                          onChange={(e) =>
                            setListItem("projects", idx, "name", e.target.value)
                          }
                          placeholder="e.g., E-Commerce Analytics Dashboard"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Tech Stack</label>
                        <input
                          value={pr.techStack}
                          onChange={(e) =>
                            setListItem(
                              "projects",
                              idx,
                              "techStack",
                              e.target.value,
                            )
                          }
                          placeholder="React, Node.js, PostgreSQL"
                        />
                      </div>
                    </div>
                    <div className="form-group-custom" style={{ marginTop: '12px' }}>
                      <label>Description & Impact</label>
                      <textarea
                        rows={2}
                        value={pr.description}
                        onChange={(e) =>
                          setListItem(
                            "projects",
                            idx,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="Built a real-time data streaming interface..."
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="add-more-btn"
                  onClick={() => addListItem("projects", emptyProject)}
                >
                  + Add Another Project
                </button>
              </div>
            )}

            {currentSection.key === "certifications" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '15px' }}>
                  <h3>Certifications</h3>
                  <p>Add professional credentials and verified licenses</p>
                </div>
                {data.certifications.map((c, idx) => (
                  <div className="experience-entry-box" key={idx}>
                    <div className="entry-header">
                      <h4>Certification #{idx + 1}</h4>
                      {data.certifications.length > 1 && (
                        <button
                          className="remove-btn"
                          onClick={() => removeListItem("certifications", idx)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group-custom">
                        <label>Certificate Name</label>
                        <input
                          value={c.name}
                          onChange={(e) =>
                            setListItem(
                              "certifications",
                              idx,
                              "name",
                              e.target.value,
                            )
                          }
                          placeholder="AWS Certified Developer"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Issuing Organization</label>
                        <input
                          value={c.issuer}
                          onChange={(e) =>
                            setListItem(
                              "certifications",
                              idx,
                              "issuer",
                              e.target.value,
                            )
                          }
                          placeholder="Amazon Web Services"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="add-more-btn"
                  onClick={() => addListItem("certifications", emptyCert)}
                >
                  + Add Certification
                </button>
              </div>
            )}

            {currentSection.key === "languages" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '15px' }}>
                  <h3>Languages</h3>
                  <p>Specify languages you speak and proficiency levels</p>
                </div>
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div className="form-group-custom">
                    <input
                      value={langName}
                      onChange={(e) => setLangName(e.target.value)}
                      placeholder="Language (e.g., Spanish)"
                    />
                  </div>
                  <div className="form-group-custom" style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={langLevel}
                      onChange={(e) => setLangLevel(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontWeight: '700' }}
                    >
                      <option>Native</option>
                      <option>Fluent</option>
                      <option>Professional</option>
                      <option>Intermediate</option>
                    </select>
                    <button className="cv-action-btn primary" onClick={addLanguage}>
                      Add
                    </button>
                  </div>
                </div>
                <div className="rb-chip-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {data.languages.map((l, i) => (
                    <span className="doc-skill-tag" key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: '1.5px solid #cbd5e1' }}>
                      {l.name} — {l.level}{" "}
                      <button onClick={() => removeLanguage(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '800' }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentSection.key === "achievements" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '15px' }}>
                  <h3>Awards & Achievements</h3>
                  <p>Highlight notable recognitions and awards received</p>
                </div>
                {data.achievements.map((a, idx) => (
                  <div className="rb-bullet-row" key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      value={a}
                      onChange={(e) =>
                        setData((d) => ({
                          ...d,
                          achievements: d.achievements.map((x, xi) =>
                            xi === idx ? e.target.value : x,
                          ),
                        }))
                      }
                      placeholder="Employee of the Year 2025"
                      style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '13.5px', background: '#f8fafc', outline: 'none' }}
                    />
                    {data.achievements.length > 1 && (
                      <button
                        className="remove-btn"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            achievements: d.achievements.filter(
                              (_, xi) => xi !== idx,
                            ),
                          }))
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="add-more-btn"
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      achievements: [...d.achievements, ""],
                    }))
                  }
                >
                  + Add Achievement
                </button>
              </div>
            )}

            {/* FINAL STEP: REVIEW & SECTION REORDERING */}
            {currentSection.key === "finish" && (
              <div className="rb-form-stack">
                <div className="card-top-heading" style={{ marginBottom: '15px' }}>
                  <h3>Review & Reorder Sections</h3>
                  <p>Customize the structure of your resume before downloading</p>
                </div>

                <div className="rb-section-manager-box" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                  <div className="rb-section-manager-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Layout Order</h4>
                    <button
                      className="cv-action-btn secondary"
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                      onClick={resetSections}
                    >
                      Reset Default
                    </button>
                  </div>
                  <div className="rb-manager-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sections
                      .filter((s) => s.key !== "finish")
                      .map((s, idx) => (
                        <div className="rb-manager-item" key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#334155' }}>
                            {idx + 1}. {s.label}
                          </span>
                          <div className="rb-manager-actions" style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: '2px 8px', fontSize: '11px' }}
                              onClick={() => moveSection(idx, "up")}
                              disabled={idx === 0}
                            >
                              ▲
                            </button>
                            <button
                              className="cv-action-btn secondary"
                              style={{ padding: '2px 8px', fontSize: '11px' }}
                              onClick={() => moveSection(idx, "down")}
                              disabled={idx === sections.length - 2}
                            >
                              ▼
                            </button>
                            <button
                              className="remove-btn"
                              onClick={() => removeSectionKey(s.key)}
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="rb-finish-actions" style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="cv-action-btn primary glow-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={handleDownload}
                  >
                    ⬇ Download PDF
                  </button>
                  <button
                    className="cv-action-btn secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={handleDownloadDocx}
                    disabled={downloadingDocx}
                  >
                    ⬇ Download Word (.docx)
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rb-wizard-nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1.5px solid #e2e8f0', paddingTop: '20px', position: 'relative', zIndex: 2 }}>
            <button
              className="cv-action-btn secondary"
              onClick={goPrev}
              disabled={step === 0}
            >
              ← Previous Section
            </button>
            <button
              className="cv-action-btn primary glow-btn"
              onClick={goNext}
              disabled={step === sections.length - 1}
            >
              Next Section →
            </button>
          </div>
          <div className="card-glow-bar"></div>
        </div>

        {/* Right Live Preview Pane */}
        <div className="rb-preview-pane no-print">
          <div className="rb-preview-sticky">
            <ResumePreview
              templateId={templateId}
              accentColor={accentColor}
              data={data}
            />
          </div>
        </div>
      </div>

      <style>{`
        .resume-builder-wrapper-light {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow-x: hidden;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .rb-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .rb-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatRbParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatRbParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .rb-card-3d {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border-radius: 22px;
          padding: 30px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          border: 1.5px solid #cbd5e1;
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1deg);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .cv-action-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        .cv-action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
        }

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .form-group-custom label {
          display: block;
          font-weight: 700;
          font-size: 13px;
          color: #334155;
          margin-bottom: 6px;
        }

        .form-group-custom input,
        .form-group-custom select,
        .form-group-custom textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          font-size: 14px;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group-custom input:focus,
        .form-group-custom select:focus,
        .form-group-custom textarea:focus {
          border-color: #6366f1;
          background: #ffffff;
        }

        .experience-entry-box {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 18px;
        }

        .entry-header h4 {
          font-size: 14.5px;
          color: #0f172a;
          font-weight: 800;
          margin: 0;
        }

        .remove-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 800;
          cursor: pointer;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .rb-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }
      `}</style>
    </div>
  );
}