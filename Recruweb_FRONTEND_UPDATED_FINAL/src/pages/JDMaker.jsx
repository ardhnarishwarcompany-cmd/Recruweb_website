import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Sparkles, Copy, Download, FileText, RefreshCw } from 'lucide-react';
import ScrollIndicator from '../components/ScrollIndicator';

const JDMaker = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    location: '',
    employmentType: '',
    experience: '',
    salary: '',
    keyResponsibilities: '',
    qualifications: '',
    skills: '',
    benefits: '',
    companyDescription: ''
  });

  const [generatedJD, setGeneratedJD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const departments = [
    'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 
    'Operations', 'Customer Service', 'Design', 'Admin', 'Other'
  ];

  const employmentTypes = [
    'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
  ];

  const experienceLevels = [
    'Fresher', '0-1 Years', '1-3 Years', '3-5 Years', '5-7 Years', '7-10 Years', '10+ Years'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateJD = () => {
    if (!formData.jobTitle) {
      alert('Please enter a Job Title');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const jd = `
📋 JOB DESCRIPTION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 Position: ${formData.jobTitle || '[Job Title]'}
📂 Department: ${formData.department || 'Not Specified'}
📍 Location: ${formData.location || 'Not Specified'}
💼 Employment Type: ${formData.employmentType || 'Full-time'}
⏰ Experience: ${formData.experience || 'Not Specified'}
💰 Salary: ${formData.salary || 'Competitive'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 ABOUT THE ROLE

${formData.keyResponsibilities || `• Lead and manage team activities\n• Collaborate with cross-functional teams\n• Drive key projects and initiatives\n• Ensure timely delivery of objectives\n• Report progress to stakeholders`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ QUALIFICATIONS & REQUIREMENTS

${formData.qualifications || `• Bachelor's degree in relevant field\n• Proven work experience\n• Strong communication skills\n• Problem-solving abilities\n• Team management experience`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SKILLS REQUIRED

${formData.skills || `• Communication Skills\n• Leadership\n• Problem Solving\n• Time Management\n• Technical Proficiency`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 BENEFITS & PERKS

${formData.benefits || `• Competitive salary package\n• Health insurance coverage\n• Professional development opportunities\n• Flexible working hours\n• Friendly work environment`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 ABOUT ${formData.companyDescription ? formData.companyDescription.toUpperCase() : 'OUR COMPANY'}

${formData.companyDescription ? formData.companyDescription : 'We are a leading organization committed to innovation and excellence. Join our dynamic team and contribute to our growth story.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 HOW TO APPLY

Interested candidates can apply through our website or send their updated resume to info@recruweb.com

Reference Code: JD-${Date.now().toString(36).toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `;
      setGeneratedJD(jd);
      setIsGenerating(false);
    }, 1200);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJD);
    alert('Job Description copied to clipboard!');
  };

  const downloadJD = () => {
    if (!generatedJD) {
      alert('Please generate the Job Description first.');
      return;
    }
    const blob = new Blob([generatedJD], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.jobTitle || 'Job-Description'}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadJDPdf = async () => {
    if (!generatedJD) {
      alert('Please generate the Job Description first.');
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const safeText = (value = '') => String(value)
        .normalize('NFKD')
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
        .replace(/[\u200B-\u200D\uFE0E\uFE0F]/g, '')
        .replace(/^[\s•·*-]+/gm, '• ')
        .replace(/\r/g, '');

      const addFooter = () => {
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Recruweb | ${new Date().toLocaleDateString()}`,
          margin,
          pageHeight - 9
        );
        doc.setTextColor(15, 23, 42);
      };

      const ensureSpace = (height) => {
        if (y + height > pageHeight - 18) {
          addFooter();
          doc.addPage();
          y = 20;
        }
      };

      const addWrapped = (text, fontSize = 10.5, lineHeight = 5.2) => {
        const clean = safeText(text).trim();
        if (!clean) return;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(51, 65, 85);
        const lines = doc.splitTextToSize(clean, contentWidth);
        lines.forEach((line) => {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += 1.5;
      };

      const addSection = (title, content) => {
        ensureSpace(14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12.5);
        doc.setTextColor(79, 70, 229);
        doc.text(safeText(title), margin, y);
        y += 7;
        addWrapped(content, 10.5, 5.2);
        y += 2;
      };

      // Header
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text('JOB DESCRIPTION', margin, y);
      y += 9;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229);
      doc.text(safeText(formData.jobTitle || 'Job Position'), margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      const meta = [
        formData.department && `Department: ${formData.department}`,
        formData.location && `Location: ${formData.location}`,
        formData.employmentType && `Employment: ${formData.employmentType}`,
        formData.experience && `Experience: ${formData.experience}`,
        formData.salary && `Salary: ${formData.salary}`
      ].filter(Boolean).join('  |  ');
      if (meta) {
        doc.text(safeText(meta), margin, y);
        y += 8;
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      addSection('ABOUT THE ROLE', formData.keyResponsibilities ||
        'Lead and manage team activities. Collaborate with cross-functional teams. Drive key projects and initiatives. Ensure timely delivery of objectives. Report progress to stakeholders.');

      addSection('QUALIFICATIONS & REQUIREMENTS', formData.qualifications ||
        "Bachelor's degree in relevant field. Proven work experience. Strong communication skills. Problem-solving abilities. Team management experience.");

      addSection('SKILLS REQUIRED', formData.skills ||
        'Communication Skills. Leadership. Problem Solving. Time Management. Technical Proficiency.');

      addSection('BENEFITS & PERKS', formData.benefits ||
        'Competitive salary package. Health insurance coverage. Professional development opportunities. Flexible working hours. Friendly work environment.');

      addSection(
        `ABOUT ${safeText(formData.companyDescription ? formData.companyDescription.toUpperCase() : 'OUR COMPANY')}`,
        formData.companyDescription ||
          'We are a leading organization committed to innovation and excellence. Join our dynamic team and contribute to our growth story.'
      );

      addSection(
        'HOW TO APPLY',
        'Interested candidates can apply through our website or send their updated resume to info@recruweb.com.'
      );

      addFooter();

      const filename = `${(formData.jobTitle || 'Job-Description').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'Job-Description'}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('JD PDF generation failed:', error);
      alert('Unable to generate the PDF right now. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      department: '',
      location: '',
      employmentType: '',
      experience: '',
      salary: '',
      keyResponsibilities: '',
      qualifications: '',
      skills: '',
      benefits: '',
      companyDescription: ''
    });
    setGeneratedJD('');
  };

  return (
    <div className="jdmaker-page-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="jd-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="jd-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hero Header Section */}
      <section className="jd-hero-section-light">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="jd-badge">
            <span className="jd-badge-dot"></span>
            <span>AI Powered Tools</span>
          </div>
          <h1 className="jd-hero-title">
            Job Description <span className="gradient-text">Maker</span>
          </h1>
          <p className="jd-hero-subtitle">
            Create professional job descriptions in seconds. Fill in the details below and generate a polished JD for your organization.
          </p>
        </div>
        <ScrollIndicator />
      </section>

      {/* Main Builder Section */}
      <section style={{ padding: '60px 0 80px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px', alignItems: 'start' }} className="jd-responsive-grid">
            
            {/* Form Card */}
            <div className="jd-card-3d">
              <div className="card-bg-light-glow"></div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '24px', position: 'relative', zIndex: 2 }}>Enter Job Details</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div className="form-group-custom">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="form-group-custom">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleChange}>
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative', zIndex: 2, marginTop: '16px' }}>
                <div className="form-group-custom">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Noida, UP"
                  />
                </div>
                <div className="form-group-custom">
                  <label>Employment Type</label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
                    <option value="">Select Type</option>
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative', zIndex: 2, marginTop: '16px' }}>
                <div className="form-group-custom">
                  <label>Experience Required</label>
                  <select name="experience" value={formData.experience} onChange={handleChange}>
                    <option value="">Select Experience</option>
                    {experienceLevels.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-custom">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., ₹8-12 LPA"
                  />
                </div>
              </div>

              <div className="form-group-custom" style={{ marginTop: '16px', position: 'relative', zIndex: 2 }}>
                <label>Key Responsibilities</label>
                <textarea
                  name="keyResponsibilities"
                  value={formData.keyResponsibilities}
                  onChange={handleChange}
                  placeholder="Enter each responsibility on a new line..."
                  rows="4"
                />
                <span className="form-hint">Enter each point on a new line</span>
              </div>

              <div className="form-group-custom" style={{ marginTop: '16px', position: 'relative', zIndex: 2 }}>
                <label>Qualifications & Requirements</label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="Enter each qualification on a new line..."
                  rows="4"
                />
                <span className="form-hint">Enter each point on a new line</span>
              </div>

              <div className="form-group-custom" style={{ marginTop: '16px', position: 'relative', zIndex: 2 }}>
                <label>Required Skills</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Enter each skill on a new line..."
                  rows="3"
                />
                <span className="form-hint">Enter each skill on a new line</span>
              </div>

              <div className="form-group-custom" style={{ marginTop: '16px', position: 'relative', zIndex: 2 }}>
                <label>Benefits & Perks</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Enter each benefit on a new line..."
                  rows="3"
                />
                <span className="form-hint">Enter each benefit on a new line</span>
              </div>

              <div className="form-group-custom" style={{ marginTop: '16px', position: 'relative', zIndex: 2 }}>
                <label>About Your Company</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  placeholder="Tell candidates about your company culture and values..."
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', position: 'relative', zIndex: 2 }}>
                <button className="jd-action-btn primary" onClick={generateJD} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <span className="spinner"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Generate JD
                    </>
                  )}
                </button>
                <button className="jd-action-btn secondary" onClick={resetForm}>
                  <RefreshCw size={15} /> Reset
                </button>
              </div>
              <div className="card-glow-bar"></div>
            </div>

            {/* Preview Card */}
            <div className="jd-card-3d" style={{ position: 'sticky', top: '24px' }}>
              <div className="card-bg-light-glow"></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Job Description Preview</h3>
                {generatedJD && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-action-btn" onClick={copyToClipboard} title="Copy">
                      <Copy size={16} />
                    </button>
                    <button className="icon-action-btn" onClick={downloadJD} title="Download TXT">
                      <Download size={16} />
                    </button>
                    <button className="icon-action-btn pdf-action-btn" onClick={downloadJDPdf} title="Download PDF" aria-label="Download Job Description as PDF">
                      <FileText size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1.5px solid #e2e8f0', minHeight: '480px', maxHeight: '600px', overflowY: 'auto', position: 'relative', zIndex: 2 }}>
                {generatedJD ? (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: '1.6' }}>{generatedJD}</pre>
                ) : (
                  <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
                    <Sparkles size={48} style={{ opacity: 0.4, marginBottom: '14px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Fill in the job details and click "Generate JD" to create a professional job description</p>
                  </div>
                )}
              </div>
              {generatedJD && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', position: 'relative', zIndex: 2 }}>
                  <button
                    className="jd-action-btn pdf-download-btn"
                    onClick={downloadJDPdf}
                    title="Download Job Description as PDF"
                  >
                    <FileText size={16} /> Download as PDF
                  </button>
                </div>
              )}
              <div className="card-glow-bar"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Templates Section */}
      <section style={{ padding: '60px 0 90px', background: '#f1f5f9', borderTop: '1.5px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ display: 'inline-block', padding: '5px 16px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '30px', fontSize: '12px', fontWeight: '800', marginBottom: '12px' }}>Templates</span>
            <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>Quick Templates</h2>
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>Use these pre-built templates for common job roles</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Software Developer', dept: 'Engineering', icon: '💻', data: { jobTitle: 'Software Developer', department: 'Engineering', employmentType: 'Full-time', experience: '2-4 Years', keyResponsibilities: '• Design and implement new features\n• Write clean, maintainable code\n• Collaborate with cross-functional teams\n• Debug and fix issues\n• Participate in code reviews', qualifications: '• B.Tech/B.E. in Computer Science\n• 2+ years of experience\n• Proficiency in JavaScript/Python\n• Knowledge of databases\n• Strong problem-solving skills', skills: '• JavaScript/Python\n• React/Angular\n• SQL/MongoDB\n• Git\n• Agile Methodology', benefits: '• Competitive salary\n• Health insurance\n• Flexible work hours\n• Learning opportunities\n• Team outings' } },
              { title: 'Sales Manager', dept: 'Sales', icon: '📈', data: { jobTitle: 'Sales Manager', department: 'Sales', employmentType: 'Full-time', experience: '3-5 Years', keyResponsibilities: '• Lead sales team to achieve targets\n• Develop sales strategies\n• Build client relationships\n• Analyze market trends\n• Prepare sales reports', qualifications: '• MBA in Sales/Marketing\n• 3+ years of sales experience\n• Proven track record\n• Excellent communication\n• Leadership skills', skills: '• Sales Strategy\n• Client Relations\n• Negotiation\n• CRM Tools\n• Presentation', benefits: '• Attractive incentives\n• Travel allowances\n• Performance bonuses\n• Training programs\n• Career growth' } },
              { title: 'HR Executive', dept: 'Human Resources', icon: '👔', data: { jobTitle: 'HR Executive', department: 'Human Resources', employmentType: 'Full-time', experience: '1-3 Years', keyResponsibilities: '• Manage recruitment process\n• Handle employee onboarding\n• Maintain HR records\n• Coordinate training programs\n• Assist in payroll processing', qualifications: '• MBA in HR\n• 1-2 years of experience\n• Knowledge of labor laws\n• Good interpersonal skills\n• Proficiency in MS Office', skills: '• Recruitment\n• Payroll\n• Employee Relations\n• MS Excel\n• HRIS Systems', benefits: '• Competitive package\n• Professional development\n• Work-life balance\n• Friendly environment\n• Growth opportunities' } },
              { title: 'Marketing Manager', dept: 'Marketing', icon: '📣', data: { jobTitle: 'Marketing Manager', department: 'Marketing', employmentType: 'Full-time', experience: '3-5 Years', keyResponsibilities: '• Develop marketing strategies\n• Manage digital campaigns\n• Brand management\n• Market research\n• Budget planning', qualifications: '• MBA in Marketing\n• 3+ years experience\n• Digital marketing knowledge\n• Creative mindset\n• Analytical skills', skills: '• Digital Marketing\n• SEO/SEM\n• Social Media\n• Content Strategy\n• Analytics', benefits: '• Creative freedom\n• Performance incentives\n• Industry exposure\n• Skill development\n• Team activities' } }
            ].map((tmpl, idx) => (
              <div 
                key={idx} 
                className="template-card-3d"
                onClick={() => setFormData(prev => ({ ...prev, ...tmpl.data }))}
              >
                <div className="card-bg-light-glow"></div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{tmpl.icon}</div>
                <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', position: 'relative', zIndex: 2 }}>{tmpl.title}</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '600', position: 'relative', zIndex: 2 }}>{tmpl.dept}</p>
                <div className="card-glow-bar"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .jdmaker-page-wrapper-light {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Particles Background */
        .jd-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .jd-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatJdParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatJdParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Hero */
        .jd-hero-section-light {
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

        .jd-badge {
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

        .jd-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .jd-hero-title {
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

        .jd-hero-subtitle {
          font-size: 16.5px;
          color: #64748b;
          line-height: 1.6;
          max-width: 650px;
          margin: 0 auto;
        }

        /* 3D Cards */
        .jd-card-3d, .template-card-3d {
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

        .jd-card-3d:hover, .template-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .template-card-3d {
          cursor: pointer;
          padding: 24px;
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

        .form-group-custom label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
        }

        .form-group-custom input,
        .form-group-custom select,
        .form-group-custom textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          outline: none;
          font-size: 14px;
          background: #f8fafc;
          color: #0f172a;
          transition: border-color 0.2s;
        }

        .form-group-custom input:focus,
        .form-group-custom select:focus,
        .form-group-custom textarea:focus {
          border-color: #6366f1;
          background: #ffffff;
        }

        .form-hint {
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 4px;
          display: block;
          font-weight: 600;
        }

        .jd-action-btn {
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

        .jd-action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        .jd-action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
        }

        .jd-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .jd-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .icon-action-btn {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-action-btn:hover {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .pdf-action-btn {
          background: #eef2ff;
          color: #4338ca;
          border-color: #c7d2fe;
        }

        .pdf-action-btn:hover {
          background: #4338ca;
          color: #fff;
          border-color: #4338ca;
        }

        .pdf-download-btn {
          padding: 10px 16px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff;
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.2);
        }

        .pdf-download-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 9px 20px rgba(79, 70, 229, 0.3);
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

        .jd-card-3d:hover .card-glow-bar,
        .template-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        @media (max-width: 1024px) {
          .jd-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JDMaker;