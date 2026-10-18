import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";
import useAuth from "../hooks/useAuth";
import { api } from "../utils/api";
import ScrollIndicator from "../components/ScrollIndicator";
import "./styles/resumeBuilder.css";
import "./styles/resumeChecker.css";

export default function CoverLetterBuilder() {
  const { isAuthenticated } = useAuth();

  const [myResumes, setMyResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [fullName, setFullName] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateSummary, setCandidateSummary] = useState("");
  const [topSkills, setTopSkills] = useState("");
  const [keyAchievement, setKeyAchievement] = useState("");
  const [tone, setTone] = useState("professional");

  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState("");
  const [generateError, setGenerateError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      api.resumes.getAll().then((res) => {
        if (res?.success) setMyResumes(res.data);
      });
    }
  }, [isAuthenticated]);

  const applyResume = async (id) => {
    setSelectedResumeId(id);
    if (!id) return;
    const res = await api.resumes.getById(id);
    if (!res?.success) return;
    const r = res.data;
    const d = r.data || {};
    setFullName(d.personal?.fullName || "");
    setCandidateSummary(d.summary || "");
    setTopSkills(
      Array.isArray(d.skills) ? d.skills.slice(0, 6).join(", ") : "",
    );
    if (r.targetJobTitle) setTargetJobTitle(r.targetJobTitle);
    toast.success("Pulled details from your saved resume");
  };

  const handleGenerate = async () => {
    if (!targetJobTitle.trim())
      return toast.error("Please enter the target job title.");

    setGenerating(true);
    setGenerateError("");
    setLetter("");
    toast.loading("Generating your AI cover letter...", { id: "genLetter" });

    try {
      const res = await api.coverLetter.generate({
        fullName,
        targetJobTitle,
        companyName,
        jobDescription,
        candidateSummary,
        topSkills: topSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        keyAchievement,
        tone,
      });

      setGenerating(false);
      toast.dismiss("genLetter");

      if (res?.success && res.data?.letter) {
        setLetter(res.data.letter);
        toast.success("Cover letter generated successfully! 🎉");
      } else {
        throw new Error(res?.message || "Server response failed");
      }
    } catch (err) {
      setGenerating(false);
      toast.dismiss("genLetter");
      setGenerateError(
        err?.message ||
          "Could not reach the AI server. Please check your connection and try again.",
      );
      toast.error("Cover letter generation failed. Please try again.");
    }
  };

  const handleDownloadDocx = async () => {
    if (!letter) return;
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: letter
            .split(/\n+/)
            .filter(Boolean)
            .map(
              (para) =>
                new Paragraph({
                  spacing: { after: 200 },
                  children: [new TextRun({ text: para, size: 22 })],
                }),
            ),
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(companyName || "cover_letter").replace(/[^a-z0-9-_]+/gi, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as Word document (.docx)");
  };

  const handleDownloadPdf = () => {
    if (!letter?.trim()) return;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const bottomMargin = 18;
    let y = 20;

    // jsPDF's built-in Helvetica font is reliable for normal Latin text.
    // Normalize common smart punctuation so the downloaded PDF renders cleanly.
    const safeText = (value) =>
      String(value ?? "")
        .replace(/[•·]/g, "-")
        .replace(/[–—]/g, "-")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\u00a0/g, " ");

    const ensureSpace = (height = 8) => {
      if (y + height > pageHeight - bottomMargin) {
        doc.addPage();
        y = 20;
      }
    };

    const addParagraph = (text) => {
      const value = safeText(text).trim();
      if (!value) {
        y += 5;
        return;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);

      const lines = doc.splitTextToSize(value, contentWidth);
      const lineHeight = 5.8;
      const requiredHeight = lines.length * lineHeight + 5;

      ensureSpace(requiredHeight);
      doc.text(lines, margin, y);
      y += requiredHeight;
    };

    // Professional document header.
    if (fullName.trim()) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text(safeText(fullName), margin, y);
      y += 7;
    }

    const roleLine = [targetJobTitle.trim(), companyName.trim()]
      .filter(Boolean)
      .join(" | ");

    if (roleLine) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229);
      doc.text(safeText(roleLine), margin, y);
      y += 6;
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(new Date().toLocaleDateString(), margin, y);
    y += 10;

    // Preserve the editable cover-letter text, including paragraph breaks.
    letter
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .forEach(addParagraph);

    doc.setProperties({
      title: `${targetJobTitle || "Cover Letter"} - ${fullName || "Recruweb"}`,
      subject: "AI generated cover letter",
      author: "Recruweb",
      creator: "Recruweb Cover Letter Builder",
    });

    const safeFilePart = (value, fallback) =>
      String(value || fallback)
        .trim()
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80) || fallback;

    const filename = `${safeFilePart(fullName, "Candidate")}_${safeFilePart(
      targetJobTitle,
      "Cover_Letter",
    )}_Cover_Letter.pdf`;

    doc.save(filename);
    toast.success("Downloaded as PDF successfully!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="cover-letter-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="cl-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="cl-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      <section className="cl-hero-section-light">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cl-badge">
            <span className="cl-badge-dot"></span>
            <span>AI Generator</span>
          </div>
          <h1 className="cl-hero-title">
            AI Cover Letter <span className="gradient-text">Builder</span>
          </h1>
          <p className="cl-hero-subtitle">
            Write a tailored cover letter in seconds, grounded in your real experience and the exact job you're applying for.
          </p>
        </div>
        <ScrollIndicator />
      </section>

      <section className="section" style={{ paddingTop: '30px', position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
        <div className="container">
          <div className="cl-body-grid">
            
            {/* Left Column: Form Inputs & Generator */}
            <div className="cl-card-3d cl-form-col">
              <div className="card-bg-light-glow"></div>
              
              {!isAuthenticated && (
                <div className="cl-guest-banner" style={{ position: 'relative', zIndex: 2 }}>
                  <Link to="/candidate/login">Log in</Link> or{" "}
                  <Link to="/candidate/register">create a free account</Link> to save your cover letters.
                </div>
              )}

              {isAuthenticated && myResumes.length > 0 && (
                <div className="form-group-custom" style={{ marginBottom: '18px', position: 'relative', zIndex: 2 }}>
                  <label>
                    Use details from a saved resume <span className="rb-muted">(optional)</span>
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => applyResume(e.target.value)}
                  >
                    <option value="">— Fill manually —</option>
                    {myResumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-grid-2" style={{ position: 'relative', zIndex: 2 }}>
                <div className="form-group-custom">
                  <label>Your Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Aarav Sharma"
                  />
                </div>
                <div className="form-group-custom">
                  <label>Target Job Title</label>
                  <input
                    value={targetJobTitle}
                    onChange={(e) => setTargetJobTitle(e.target.value)}
                    placeholder="e.g., Senior Product Manager"
                  />
                </div>
                <div className="form-group-custom">
                  <label>Company Name</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corp"
                  />
                </div>
                <div className="form-group-custom">
                  <label>Tone of Voice</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="concise">Concise</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>

              <div className="form-stack-vertical" style={{ marginTop: '16px', position: 'relative', zIndex: 2 }}>
                <div className="form-group-custom">
                  <label>
                    Job Description <span className="rb-muted">(optional — helps tailor keywords)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description here..."
                  />
                </div>
                <div className="form-group-custom">
                  <label>Your Summary / Background</label>
                  <textarea
                    rows={3}
                    value={candidateSummary}
                    onChange={(e) => setCandidateSummary(e.target.value)}
                    placeholder="A short summary of your professional background and strengths."
                  />
                </div>
                <div className="form-group-custom">
                  <label>Top Skills <span className="rb-muted">(comma separated)</span></label>
                  <input
                    value={topSkills}
                    onChange={(e) => setTopSkills(e.target.value)}
                    placeholder="Product Strategy, Roadmapping, SQL"
                  />
                </div>
                <div className="form-group-custom">
                  <label>Key Achievement</label>
                  <input
                    value={keyAchievement}
                    onChange={(e) => setKeyAchievement(e.target.value)}
                    placeholder="e.g., Led a redesign that increased activation by 34%"
                  />
                </div>
              </div>

              <button
                className="cv-action-btn primary glow-btn"
                onClick={handleGenerate}
                disabled={generating}
                style={{ width: '100%', marginTop: '20px', justifyContent: 'center', position: 'relative', zIndex: 2 }}
              >
                {generating ? "Writing your cover letter…" : "✨ Generate AI Cover Letter"}
              </button>

              {generateError && (
                <div className="error-banner" style={{ position: 'relative', zIndex: 2, marginTop: '16px' }}>
                  ⚠️ {generateError}
                </div>
              )}

              {letter && (
                <div className="cl-result-card-3d" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="card-bg-light-glow"></div>
                  <div className="cl-result-header" style={{ position: 'relative', zIndex: 2 }}>
                    <h3>Your Custom Cover Letter</h3>
                    <span className="editable-tag">Editable</span>
                  </div>
                  <textarea
                    rows={14}
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    className="cl-letter-textarea"
                    style={{ position: 'relative', zIndex: 2 }}
                  />
                  <div className="cl-result-actions" style={{ position: 'relative', zIndex: 2 }}>
                    <button className="cv-action-btn secondary" onClick={copyToClipboard}>
                      📋 Copy Text
                    </button>
                    <button className="cv-action-btn primary glow-btn" onClick={handleDownloadDocx}>
                      ⬇ Download as Word (.docx)
                    </button>
                    <button
                      className="cv-action-btn secondary"
                      onClick={handleDownloadPdf}
                      title="Download your current cover letter as a PDF"
                    >
                      📄 Download as PDF
                    </button>
                  </div>
                  <div className="card-glow-bar"></div>
                </div>
              )}
              <div className="card-glow-bar"></div>
            </div>

            {/* Right Column: Tips & Sidebar */}
            <aside className="cl-side-card-3d">
              <div className="card-bg-light-glow"></div>
              <h3 style={{ position: 'relative', zIndex: 2 }}>Tips for a Strong Cover Letter</h3>
              <ul className="cl-checklist" style={{ position: 'relative', zIndex: 2 }}>
                <li>
                  <strong>Be Specific</strong> — Name the company and role directly instead of using generic openings.
                </li>
                <li>
                  <strong>Lead with Impact</strong> — Feature your strongest, most relevant metric-driven achievement early.
                </li>
                <li>
                  <strong>Mirror Keywords</strong> — Integrate 2-3 precise technical keywords from the target job description.
                </li>
                <li>
                  <strong>Keep It Concise</strong> — Aim for 3 to 4 impactful paragraphs. One page is standard.
                </li>
              </ul>

              <div className="cl-sidebar-footer" style={{ position: 'relative', zIndex: 2 }}>
                <p className="rb-muted" style={{ fontSize: '13px', fontWeight: '600' }}>
                  Need an optimized resume too?{" "}
                  <Link to="/resume-builder" className="highlight-link">Try the Resume Builder</Link>.
                </p>
              </div>
              <div className="card-glow-bar"></div>
            </aside>

          </div>
        </div>
      </section>

      <style>{`
        .cover-letter-wrapper-light {
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

        /* Particles Background */
        .cl-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .cl-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatClParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatClParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Hero */
        .cl-hero-section-light {
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

        .cl-badge {
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

        .cl-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .cl-hero-title {
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

        .cl-hero-subtitle {
          font-size: 16.5px;
          color: #64748b;
          line-height: 1.6;
          max-width: 650px;
          margin: 0 auto;
        }

        .cl-body-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 28px;
          max-width: 1050px;
          margin: 0 auto;
        }

        .cl-card-3d, .cl-side-card-3d, .cl-result-card-3d {
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

        .cl-card-3d:hover, .cl-side-card-3d:hover, .cl-result-card-3d:hover {
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

        .cl-guest-banner {
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          color: #1e40af;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .cl-guest-banner a {
          color: #4f46e5;
          font-weight: 800;
          text-decoration: underline;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-stack-vertical {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group-custom label {
          display: block;
          font-weight: 700;
          font-size: 13px;
          color: #334155;
          margin-bottom: 6px;
        }

        .form-group-custom input, .form-group-custom select, .form-group-custom textarea {
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

        .form-group-custom input:focus, .form-group-custom select:focus, .form-group-custom textarea:focus {
          border-color: #6366f1;
          background: #ffffff;
        }

        .cv-action-btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
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

        .error-banner {
          padding: 10px 14px;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-radius: 10px;
          color: #991b1b;
          font-size: 13px;
          font-weight: 700;
        }

        .cl-result-card-3d {
          margin-top: 24px;
          padding: 24px;
        }

        .cl-result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .cl-result-header h3 {
          font-size: 16px;
          color: #0f172a;
          font-weight: 800;
          margin: 0;
        }

        .editable-tag {
          font-size: 11px;
          background: #e0e7ff;
          color: #4338ca;
          padding: 3px 10px;
          border-radius: 10px;
          font-weight: 800;
        }

        .cl-letter-textarea {
          width: 100%;
          font-family: inherit;
          font-size: 13.5px;
          line-height: 1.6;
          padding: 14px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          background: white;
          color: #1e293b;
          resize: vertical;
          outline: none;
        }

        .cl-result-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
        }

        .cl-side-card-3d h3 {
          font-size: 17px;
          color: #1e40af;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .cl-checklist {
          list-style: none;
          padding: 0;
          margin: 0 0 20px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cl-checklist li {
          font-size: 13px;
          color: #1e3a8a;
          line-height: 1.5;
          font-weight: 600;
        }

        .cl-checklist strong {
          color: #1e40af;
          font-weight: 800;
        }

        .cl-sidebar-footer {
          border-top: 1.5px solid #bfdbfe;
          padding-top: 14px;
        }

        .highlight-link {
          color: #4f46e5;
          font-weight: 800;
          text-decoration: underline;
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

        .cl-card-3d:hover .card-glow-bar,
        .cl-side-card-3d:hover .card-glow-bar,
        .cl-result-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        @media(max-width: 768px) {
          .cl-body-grid {
            grid-template-columns: 1fr;
          }
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}