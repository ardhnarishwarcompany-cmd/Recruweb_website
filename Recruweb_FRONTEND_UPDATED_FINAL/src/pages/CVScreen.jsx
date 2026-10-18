import { useState, useRef, useEffect } from 'react';
import ScrollIndicator from '../components/ScrollIndicator';
import { API_URL } from '../utils/api';

const CVScreen = () => {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [multiMode, setMultiMode] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: "Hi! I'm your AI screening assistant. I can help you understand candidate profiles, compare candidates, or suggest improvements to job requirements. How can I help?" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [analysisError, setAnalysisError] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    requiredSkills: '',
    experience: '',
    qualifications: '',
    salaryRange: '',
    location: '',
    urgency: 'normal'
  });

  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type === 'application/pdf' || 
        file.name.endsWith('.doc') || 
        file.name.endsWith('.docx') ||
        file.type === 'text/plain') {
      setUploadedFile(file);
      if (multiMode) {
        setCandidates(prev => [...prev, {
          id: Date.now(),
          file,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          status: 'pending'
        }]);
      }
    } else {
      alert('Please upload a PDF, DOC, DOCX, or TXT file');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Never render null/undefined scores. The backend is resume-grounded;
  // this client-side guard only normalizes older API responses so the UI
  // always shows real numeric percentages.
  const normalizeScore = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback;
  };

  const normalizeAnalysisResult = (data) => {
    if (!data || data.error) return data;

    const matchScore = normalizeScore(
      data.matchScore ?? data.overallScore ?? data.score,
      0
    );

    const experienceYears = normalizeScore(
      data?.experience?.total ?? data.experienceYears,
      0
    );

    const foundSkills = Array.isArray(data?.keywords?.found)
      ? data.keywords.found.length
      : Array.isArray(data?.skillScores)
        ? data.skillScores.filter((item) => item?.found).length
        : 0;

    const requiredSkills = Array.isArray(data?.skillScores)
      ? data.skillScores.length
      : 0;

    const atsScore = normalizeScore(
      data.atsScore ?? data.ats ?? data.atsScoreEstimate ?? data.atsCompatibility,
      45 +
        Math.round(matchScore * 0.35) +
        Math.min(12, experienceYears * 2) +
        Math.min(10, requiredSkills ? (foundSkills / requiredSkills) * 10 : 0)
    );

    const cultureFit = normalizeScore(
      data.cultureFit ?? data.cultureFitEstimate ?? data.cultureScore,
      40 + Math.min(30, foundSkills * 5)
    );

    const growthPotential = normalizeScore(
      data.growthPotential ?? data.growthPotentialEstimate ?? data.growthScore,
      35 +
        Math.round(matchScore * 0.30) +
        Math.min(20, experienceYears * 3)
    );

    const overallScore = normalizeScore(data.overallScore ?? matchScore, matchScore);

    const recommendation =
      data.recommendation?.text
        ? data.recommendation
        : overallScore >= 75
          ? { text: 'Strongly Recommended', color: '#10b981', action: 'Proceed to Interview' }
          : overallScore >= 55
            ? { text: 'Consider for Interview', color: '#f59e0b', action: 'Review Further' }
            : { text: 'Not Recommended', color: '#ef4444', action: 'Archive' };

    return {
      ...data,
      overallScore,
      matchScore,
      atsScore,
      cultureFit,
      growthPotential,
      recommendation,
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      summary: data.summary || `Resume-grounded screening matched ${foundSkills}/${requiredSkills} required skills.`
    };
  };

  const analyzeCV = async () => {
    if (!uploadedFile && candidates.length === 0) {
      alert('Please upload at least one CV/Resume');
      return;
    }
    if (!formData.jobTitle) {
      alert('Please enter the Job Title');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisError(null);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => (prev >= 92 ? 92 : prev + Math.random() * 10 + 3));
    }, 350);

    try {
      const form = new FormData();
      form.append('jobTitle', formData.jobTitle);
      form.append('department', formData.department);
      form.append('requiredSkills', formData.requiredSkills);
      form.append('experience', formData.experience);
      form.append('qualifications', formData.qualifications);

      if (multiMode && candidates.length > 0) {
        candidates.forEach((c) => form.append('resumes', c.file));
      } else {
        form.append('resumes', uploadedFile);
      }

      const res = await fetch(`${API_URL}/cv-screen/analyze`, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (!json.success) {
        setAnalysisError(json.message || 'Analysis failed. Please try again.');
        setIsAnalyzing(false);
        return;
      }

      if (json.data.multi) {
        setResults({
          ...json.data,
          candidates: (json.data.candidates || []).map(normalizeAnalysisResult),
          topCandidate: normalizeAnalysisResult(json.data.topCandidate),
        });
      } else if (json.data.error) {
        setAnalysisError(json.data.error);
        setIsAnalyzing(false);
        return;
      } else {
        const normalized = normalizeAnalysisResult(json.data);
        setResults({
          ...normalized,
          candidateName:
            normalized.candidateName ||
            uploadedFile?.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') ||
            'Unknown',
        });
      }

      setIsAnalyzing(false);
      setStep(3);
    } catch (err) {
      clearInterval(progressInterval);
      setAnalysisError('Could not reach the analysis server. Please check your connection and try again.');
      setIsAnalyzing(false);
    }
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMessage = { sender: 'user', text: aiInput };
    setAiMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      let response = "I can help you with:\n\n";
      response += "• Explaining candidate scores\n";
      response += "• Comparing multiple candidates\n";
      response += "• Suggestions for job requirements\n";
      response += "• Understanding ATS compatibility\n";

      if (aiInput.toLowerCase().includes('score') || aiInput.toLowerCase().includes('match')) {
        response = `The match score indicates how well the candidate's profile aligns with your job requirements. A score of 75%+ is considered strong. `;
        if (results) {
          response += `Your current candidate has a ${results.matchScore}% match score, which is ${results.matchScore >= 75 ? 'good' : 'moderate'} for this role.`;
        }
      } else if (aiInput.toLowerCase().includes('ats')) {
        response = "ATS compatibility measures how well the resume is formatted for automated screening systems. ";
        if (results) {
          response += `This candidate scores ${results.atsScore}% on ATS compatibility.`;
        }
      }

      setAiMessages(prev => [...prev, { sender: 'ai', text: response }]);
    }, 500);

    setAiInput('');
  };

  const resetAnalysis = () => {
    setStep(1);
    setResults(null);
    setUploadedFile(null);
    setCandidates([]);
    setAnalysisProgress(0);
    setFormData({
      jobTitle: '',
      department: '',
      requiredSkills: '',
      experience: '',
      qualifications: '',
      salaryRange: '',
      location: '',
      urgency: 'normal'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="cv-screen-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="cv-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="cv-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      <section className="cv-hero-section-light">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cv-badge">
            <span className="cv-badge-dot"></span>
            <span>AI-Powered Screening</span>
          </div>
          <h1 className="cv-hero-title">
            Smart CV <span className="gradient-text">Evaluation</span>
          </h1>
          <p className="cv-hero-subtitle">
            Advanced AI analyzes resumes, matches requirements, and ranks top-tier talent in seconds.
          </p>
        </div>
        <ScrollIndicator />
      </section>

      <section className="cv-main-content" style={{ position: 'relative', zIndex: 1, padding: '50px 0 80px' }}>
        <div className="container">
          {/* Step Indicator Progress Bar */}
          <div className="cv-steps-bar">
            <div className={`cv-step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-circle"><span>1</span></div>
              <span className="step-label">Upload CV</span>
            </div>
            <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
            <div className={`cv-step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-circle"><span>2</span></div>
              <span className="step-label">Job Criteria</span>
            </div>
            <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
            <div className={`cv-step-item ${step >= 3 ? 'active' : ''}`}>
              <div className="step-circle"><span>3</span></div>
              <span className="step-label">AI Insights</span>
            </div>
          </div>

          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="cv-upload-layout">
              <div className="cv-card-3d">
                <div className="card-bg-light-glow"></div>
                <div className="upload-mode-toggle" style={{ position: 'relative', zIndex: 2 }}>
                  <button 
                    className={`mode-btn ${!multiMode ? 'active' : ''}`}
                    onClick={() => setMultiMode(false)}
                  >
                    Single Candidate
                  </button>
                  <button 
                    className={`mode-btn ${multiMode ? 'active' : ''}`}
                    onClick={() => setMultiMode(true)}
                  >
                    Batch Mode ({candidates.length})
                  </button>
                </div>

                <div className="card-top-heading" style={{ position: 'relative', zIndex: 2 }}>
                  <h3>{multiMode ? 'Upload Multiple Resumes' : 'Upload Candidate Resume'}</h3>
                  <p>Accepts PDF, DOC, DOCX, or TXT (Max 5MB)</p>
                </div>

                <div 
                  className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${uploadedFile || candidates.length > 0 ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: 'relative', zIndex: 2 }}
                >
                  <input 
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />

                  {!multiMode && uploadedFile ? (
                    <div className="file-preview-pill">
                      <span className="file-icon">📄</span>
                      <div className="file-details">
                        <span className="file-name">{uploadedFile.name}</span>
                        <span className="file-size">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button className="remove-pill-btn" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}>✕</button>
                    </div>
                  ) : multiMode ? (
                    <div className="multi-upload-container">
                      {candidates.length > 0 ? (
                        <div className="candidate-chips-grid">
                          {candidates.map((c, idx) => (
                            <div key={c.id} className="candidate-chip">
                              <span className="chip-num">{idx + 1}</span>
                              <span className="chip-name">{c.name}</span>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                setCandidates(prev => prev.filter(x => x.id !== c.id));
                              }}>✕</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="dropzone-prompt">
                          <div className="cloud-icon">☁️</div>
                          <p>Drag & drop resumes here, or <span>browse files</span></p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="dropzone-prompt">
                      <div className="cloud-icon">☁️</div>
                      <p>Drag & drop your resume here, or <span>browse files</span></p>
                    </div>
                  )}
                </div>

                <div className="step-actions" style={{ position: 'relative', zIndex: 2 }}>
                  <button 
                    className="cv-action-btn primary glow-btn" 
                    onClick={() => (uploadedFile || candidates.length > 0) && setStep(2)}
                    disabled={multiMode ? candidates.length === 0 : !uploadedFile}
                  >
                    {multiMode ? `Proceed with ${candidates.length} Resumes` : 'Continue to Criteria'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
                <div className="card-glow-bar"></div>
              </div>

              {/* Features Side Card */}
              <div className="cv-tips-card-3d">
                <div className="card-bg-light-glow"></div>
                <h3 style={{ position: 'relative', zIndex: 2 }}>AI Screening Capabilities</h3>
                <div className="feature-list-mini" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="feat-row"><span>🎯</span> Skills & Keyword Matching</div>
                  <div className="feat-row"><span>📊</span> Experience & Relevance Scoring</div>
                  <div className="feat-row"><span>🤖</span> ATS Optimization Check</div>
                  <div className="feat-row"><span>⚡</span> Culture & Growth Potential</div>
                </div>
                <div className="card-glow-bar"></div>
              </div>
            </div>
          )}

          {/* STEP 2: Job Requirements */}
          {step === 2 && (
            <div className="cv-upload-layout single-col">
              <div className="cv-card-3d">
                <div className="card-bg-light-glow"></div>
                <div className="card-top-heading" style={{ position: 'relative', zIndex: 2 }}>
                  <h3>Define Job Requirements</h3>
                  <p>Provide benchmarks for the AI engine to score candidates accurately</p>
                </div>

                <div className="form-grid" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="form-group-custom">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="e.g., Full Stack Engineer"
                      required
                    />
                  </div>
                  <div className="form-group-custom">
                    <label>Department</label>
                    <select name="department" value={formData.department} onChange={handleChange}>
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering & Tech</option>
                      <option value="Marketing">Marketing & Sales</option>
                      <option value="Operations">Operations</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div className="form-group-custom full-width" style={{ gridColumn: 'span 2' }}>
                    <label>Required Skills (comma-separated)</label>
                    <textarea
                      name="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={handleChange}
                      placeholder="React, Node.js, TypeScript, PostgreSQL, AWS"
                      rows="2"
                    />
                  </div>
                  <div className="form-group-custom">
                    <label>Experience Required</label>
                    <select name="experience" value={formData.experience} onChange={handleChange}>
                      <option value="">Select Experience</option>
                      <option value="0">Fresher (0 years)</option>
                      <option value="1">1+ Years</option>
                      <option value="3">3+ Years</option>
                      <option value="5">5+ Years</option>
                      <option value="8">8+ Years</option>
                    </select>
                  </div>
                  <div className="form-group-custom">
                    <label>Location Preference</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Remote / Bangalore"
                    />
                  </div>
                </div>

                {analysisError && (
                  <div className="error-banner" style={{ position: 'relative', zIndex: 2, marginTop: '16px' }}>⚠️ {analysisError}</div>
                )}

                <div className="step-actions between" style={{ position: 'relative', zIndex: 2, marginTop: '24px' }}>
                  <button className="cv-action-btn secondary" onClick={() => setStep(1)}>Back</button>
                  <button 
                    className="cv-action-btn primary glow-btn" 
                    onClick={analyzeCV}
                    disabled={isAnalyzing || !formData.jobTitle}
                  >
                    {isAnalyzing ? 'Analyzing Candidates...' : 'Run AI Analysis ✨'}
                  </button>
                </div>
                <div className="card-glow-bar"></div>
              </div>
            </div>
          )}

          {/* STEP 3: Analysis Results */}
          {step === 3 && results && !results.multi && (
            <div className="cv-results-wrapper">
              <div className="results-top-bar">
                <div className="candidate-profile-meta">
                  <div className="avatar-circle">
                    {results.candidateName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2>{results.candidateName}</h2>
                    <p>AI Evaluated Profile</p>
                  </div>
                </div>
                <button className="cv-action-btn secondary" onClick={() => setAiChatOpen(true)}>
                  🤖 Open AI Assistant
                </button>
              </div>

              {/* Main Score Banner */}
              <div className="score-hero-card-3d">
                <div className="card-bg-light-glow"></div>
                <div className="score-circle-wrap" style={{ position: 'relative', zIndex: 2 }}>
                  <svg viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#e2e8f0" strokeWidth="12"/>
                    <circle 
                      cx="100" cy="100" r="90" fill="none" 
                      stroke={getScoreColor(results.overallScore)}
                      strokeWidth="12"
                      strokeDasharray={`${results.overallScore * 5.65} 565`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="score-inner-text">
                    <span className="big-num" style={{ color: getScoreColor(results.overallScore) }}>
                      {results.overallScore}%
                    </span>
                    <span className="small-lbl">Overall Match</span>
                  </div>
                </div>
                <div className="score-hero-info" style={{ position: 'relative', zIndex: 2 }}>
                  <span className="status-pill" style={{ background: results.recommendation.color }}>
                    {results.recommendation.text}
                  </span>
                  <p>{results.summary}</p>
                </div>
                <div className="card-glow-bar"></div>
              </div>

              {/* Metrics Grid */}
              <div className="metrics-cards-grid">
                {[
                  { label: 'Match Score', val: `${normalizeScore(results.matchScore)}%`, desc: 'Requirements Alignment', score: normalizeScore(results.matchScore) },
                  { label: 'ATS Score', val: `${normalizeScore(results.atsScore)}%`, desc: 'Parser Compatibility', score: normalizeScore(results.atsScore) },
                  { label: 'Culture Fit', val: `${normalizeScore(results.cultureFit)}%`, desc: 'Soft Skills & Tone', score: normalizeScore(results.cultureFit) },
                  { label: 'Growth Potential', val: `${normalizeScore(results.growthPotential)}%`, desc: 'Trajectory Rating', score: normalizeScore(results.growthPotential) }
                ].map((m, idx) => (
                  <div key={idx} className="metric-box-3d">
                    <div className="card-bg-light-glow"></div>
                    <h4 style={{ position: 'relative', zIndex: 2 }}>{m.label}</h4>
                    <div className="metric-val" style={{ color: getScoreColor(m.score), position: 'relative', zIndex: 2 }}>{m.val}</div>
                    <p style={{ position: 'relative', zIndex: 2 }}>{m.desc}</p>
                    <div className="card-glow-bar"></div>
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="sw-grid">
                <div className="sw-box-3d strength">
                  <div className="card-bg-light-glow"></div>
                  <h4 style={{ position: 'relative', zIndex: 2 }}>✨ Key Strengths</h4>
                  <ul style={{ position: 'relative', zIndex: 2 }}>{results.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  <div className="card-glow-bar"></div>
                </div>
                <div className="sw-box-3d weakness">
                  <div className="card-bg-light-glow"></div>
                  <h4 style={{ position: 'relative', zIndex: 2 }}>⚠️ Improvement Areas</h4>
                  <ul style={{ position: 'relative', zIndex: 2 }}>{results.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}</ul>
                  <div className="card-glow-bar"></div>
                </div>
              </div>

              <div className="action-footer">
                <button className="cv-action-btn secondary" onClick={resetAnalysis}>Screen Another CV</button>
                <button className="cv-action-btn primary glow-btn">{results.recommendation.action}</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Assistant Drawer/Modal */}
      {aiChatOpen && (
        <div className="ai-modal-backdrop" onClick={() => setAiChatOpen(false)}>
          <div className="ai-chat-box" onClick={(e) => e.stopPropagation()}>
            <div className="chat-box-header">
              <div className="bot-icon">🤖</div>
              <div className="bot-info">
                <h4>Recruiter AI Assistant</h4>
                <span>Online & Ready</span>
              </div>
              <button className="close-btn" onClick={() => setAiChatOpen(false)}>✕</button>
            </div>
            <div className="chat-messages-area">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender}`}>
                  <div className="bubble-text">{msg.text}</div>
                </div>
              ))}
            </div>
            <form className="chat-input-row" onSubmit={handleAISubmit}>
              <input 
                type="text" 
                value={aiInput} 
                onChange={(e) => setAiInput(e.target.value)} 
                placeholder="Ask about candidate compatibility..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .cv-screen-wrapper-light {
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
        .cv-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .cv-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatCvParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatCvParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Hero */
        .cv-hero-section-light {
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

        .cv-badge {
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

        .cv-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .cv-hero-title {
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

        .cv-hero-subtitle {
          font-size: 16.5px;
          color: #64748b;
          line-height: 1.6;
          max-width: 650px;
          margin: 0 auto;
        }

        /* Steps Bar */
        .cv-steps-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 35px auto;
          background: #ffffff;
          padding: 16px 30px;
          border-radius: 50px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          border: 1.5px solid #cbd5e1;
          max-width: 650px;
          position: relative;
          z-index: 10;
        }

        .cv-step-item {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.5;
          transition: 0.3s;
        }

        .cv-step-item.active {
          opacity: 1;
        }

        .step-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
        }

        .cv-step-item.active .step-circle {
          background: #4f46e5;
          color: white;
          box-shadow: 0 0 12px rgba(79, 70, 229, 0.4);
        }

        .step-label {
          font-weight: 800;
          font-size: 13.5px;
          color: #0f172a;
        }

        .step-line {
          flex: 1;
          height: 2px;
          background: #cbd5e1;
          margin: 0 16px;
        }

        .step-line.active {
          background: #4f46e5;
        }

        /* Layout & 3D Cards */
        .cv-upload-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 28px;
          max-width: 1050px;
          margin: 0 auto;
        }

        .cv-upload-layout.single-col {
          grid-template-columns: 1fr;
          max-width: 800px;
        }

        .cv-card-3d, .cv-tips-card-3d, .score-hero-card-3d, .metric-box-3d, .sw-box-3d {
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

        .cv-card-3d:hover, .cv-tips-card-3d:hover, .score-hero-card-3d:hover, .metric-box-3d:hover, .sw-box-3d:hover {
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

        .upload-mode-toggle {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 5px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .mode-btn {
          flex: 1;
          padding: 9px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13.5px;
          color: #64748b;
          cursor: pointer;
          transition: 0.2s;
        }

        .mode-btn.active {
          background: white;
          color: #4f46e5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .card-top-heading h3 {
          font-size: 19px;
          color: #0f172a;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .card-top-heading p {
          color: #475569;
          font-size: 13.5px;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .upload-dropzone {
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
          padding: 36px 20px;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: 0.2s;
        }

        .upload-dropzone:hover, .upload-dropzone.drag-active {
          border-color: #4f46e5;
          background: #f5f3ff;
        }

        .cloud-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }

        .dropzone-prompt p {
          color: #334155;
          font-size: 13.5px;
          font-weight: 700;
          margin: 0;
        }

        .dropzone-prompt span {
          color: #4f46e5;
        }

        .file-preview-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border: 1.5px solid #cbd5e1;
        }

        .file-details {
          text-align: left;
        }

        .file-name {
          display: block;
          font-weight: 800;
          font-size: 13px;
          color: #0f172a;
        }

        .file-size {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 600;
        }

        .remove-pill-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-weight: 800;
        }

        .candidate-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .candidate-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1.5px solid #cbd5e1;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .chip-num {
          background: #4f46e5;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .cv-tips-card-3d h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e40af;
          font-size: 15.5px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .cv-tips-card-3d ul {
          padding-left: 18px;
          color: #1e3a8a;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 0;
        }

        .feature-list-mini {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feat-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: #1e3a8a;
          font-weight: 700;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
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

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
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

        .add-more-btn {
          width: 100%;
          border: 2px dashed #cbd5e1;
          background: transparent;
          color: #475569;
          padding: 12px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          transition: 0.2s;
          margin-bottom: 10px;
        }

        .add-more-btn:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f5f3ff;
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

        .step-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .step-actions.between {
          justify-content: space-between;
        }

        /* Results Screen */
        .cv-results-wrapper {
          max-width: 900px;
          margin: 0 auto;
        }

        .results-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 20px 30px;
          border-radius: 18px;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          border: 1.5px solid #cbd5e1;
        }

        .candidate-profile-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .avatar-circle {
          width: 50px;
          height: 50px;
          background: #4f46e5;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
        }

        .candidate-profile-meta h2 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px;
        }

        .candidate-profile-meta p {
          font-size: 12.5px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .score-circle-wrap {
          position: relative;
          width: 150px;
          height: 150px;
          flex-shrink: 0;
        }

        .score-circle-wrap svg {
          width: 100%;
          height: 100%;
        }

        .score-inner-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .big-num {
          font-size: 32px;
          font-weight: 800;
          display: block;
        }

        .small-lbl {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 700;
        }

        .score-hero-info p {
          color: #334155;
          font-size: 14.5px;
          line-height: 1.6;
          margin-top: 12px;
          font-weight: 600;
        }

        .status-pill {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 20px;
          color: white;
          font-weight: 800;
          font-size: 12.5px;
        }

        .metrics-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-box-3d h4 {
          font-size: 12.5px;
          color: #64748b;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .metric-val {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 2px;
        }

        .metric-box-3d p {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
          font-weight: 700;
        }

        .sw-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .sw-box-3d h4 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .sw-box-3d.strength h4 { color: #059669; }
        .sw-box-3d.weakness h4 { color: #dc2626; }

        .sw-box-3d ul {
          padding-left: 18px;
          margin: 0;
          font-size: 13px;
          color: #334155;
          font-weight: 700;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .action-footer {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        /* AI Chat Drawer Styling */
        .ai-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 20px;
          z-index: 1000;
        }

        .ai-chat-box {
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          overflow: hidden;
          border: 1.5px solid #cbd5e1;
        }

        .chat-box-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bot-icon {
          font-size: 22px;
        }

        .bot-info h4 {
          font-size: 14px;
          margin: 0;
          font-weight: 800;
        }

        .bot-info span {
          font-size: 11px;
          opacity: 0.8;
          font-weight: 600;
        }

        .close-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-weight: 800;
        }

        .chat-messages-area {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f8fafc;
        }

        .chat-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 600;
        }

        .chat-bubble.ai {
          background: white;
          color: #0f172a;
          align-self: flex-start;
          border: 1.5px solid #e2e8f0;
        }

        .chat-bubble.user {
          background: #4f46e5;
          color: white;
          align-self: flex-end;
        }

        .chat-input-row {
          padding: 12px;
          border-top: 1.5px solid #e2e8f0;
          display: flex;
          gap: 8px;
          background: white;
        }

        .chat-input-row input {
          flex: 1;
          padding: 8px 12px;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
        }

        .chat-input-row button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
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

        .cv-card-3d:hover .card-glow-bar,
        .cv-tips-card-3d:hover .card-glow-bar,
        .score-hero-card-3d:hover .card-glow-bar,
        .metric-box-3d:hover .card-glow-bar,
        .sw-box-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        @media(max-width: 768px) {
          .cv-upload-layout {
            grid-template-columns: 1fr;
          }
          .metrics-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .score-hero-card-3d {
            flex-direction: column;
            text-align: center;
          }
          .sw-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CVScreen;