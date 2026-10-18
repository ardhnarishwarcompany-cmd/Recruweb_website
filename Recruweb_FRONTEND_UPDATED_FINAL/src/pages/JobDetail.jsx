import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ScrollIndicator from "../components/ScrollIndicator";
import { api } from "../utils/api";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [applicationForm, setApplicationForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experience: "",
    currentCompany: "",
    currentPosition: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchJob = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.jobs.getById(id);
      if (res?.success && res.data) {
        setJob(res.data);
      } else {
        setJob(null);
      }
    } catch {
      setJob(null);
      setLoadError(
        "Couldn't reach the server. Please check your connection and try again.",
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJob();
    window.scrollTo(0, 0);
  }, [id]);

  const handleInputChange = (e) => {
    setApplicationForm({ ...applicationForm, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    setResumeError("");
    if (!file) {
      setResumeFile(null);
      return;
    }
    const allowedExt = [".pdf", ".doc", ".docx"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExt.includes(ext)) {
      setResumeError("Only PDF, DOC or DOCX files are allowed.");
      setResumeFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("Resume file must be under 5MB.");
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await api.jobs.apply(id, applicationForm, resumeFile);
      if (response.success) {
        setSuccessMessage(
          response.message ||
            "Application submitted successfully! We will contact you soon.",
        );
        setApplicationForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          experience: "",
          currentCompany: "",
          currentPosition: "",
          coverLetter: "",
        });
        setResumeFile(null);
      } else {
        setErrorMessage(
          response.message || "Failed to submit application. Please try again.",
        );
      }
    } catch (error) {
      setErrorMessage(
        "Could not reach the server. Please check your connection and try submitting your application again.",
      );
    }
    setIsSubmitting(false);
  };

  const getJobTypeColor = (type) => {
    const colors = {
      "full-time": "#10b981",
      "part-time": "#3b82f6",
      contract: "#f59e0b",
      internship: "#8b5cf6",
      remote: "#ec4899",
    };
    return colors[type] || "#6b7280";
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.min) return "Salary not specified";
    const formatNum = (num) => {
      if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num;
    };
    if (salary.max) {
      return `${formatNum(salary.min)} - ${formatNum(salary.max)} ${salary.currency || "INR"}`;
    }
    return `${formatNum(salary.min)}+ ${salary.currency || "INR"}`;
  };

  if (loading) {
    return (
      <div className="job-detail-wrapper-light">
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
        <section className="jd-hero-section-light" style={{ minHeight: "60vh", display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="loading-state" style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 16px auto', width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ fontWeight: '700', color: '#64748b' }}>Loading job details...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-wrapper-light">
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
        <section className="jd-hero-section-light" style={{ minHeight: "60vh", display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div className="jd-badge" style={{ marginBottom: '16px' }}>
              <span className="jd-badge-dot"></span>
              <span>{loadError ? "Connection Error" : "404"}</span>
            </div>
            <h1 className="jd-hero-title" style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              {loadError ? "Couldn't Load This Job" : "Job Not Found"}
            </h1>
            <p className="jd-hero-subtitle" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
              {loadError || "This job may have been removed or is no longer available."}
            </p>
            {loadError ? (
              <button
                onClick={fetchJob}
                className="cv-action-btn primary glow-btn"
                style={{ justifyContent: 'center' }}
              >
                Try Again
              </button>
            ) : (
              <Link
                to="/jobs"
                className="cv-action-btn primary glow-btn"
                style={{ justifyContent: 'center', textDecoration: 'none' }}
              >
                Browse All Jobs
              </Link>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="job-detail-wrapper-light">
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

      <section className="jd-hero-section-light" style={{ padding: '100px 0 50px' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/jobs" className="back-link" style={{ display: 'inline-block', marginBottom: '16px', fontWeight: '800', color: '#4f46e5', textDecoration: 'none', fontSize: '13.5px' }}>
            ← Back to Jobs
          </Link>
          <div
            className="section-header"
            style={{ textAlign: "left", alignItems: "flex-start" }}
          >
            <div className="jd-badge" style={{ marginBottom: '12px' }}>
              <span className="jd-badge-dot"></span>
              <span>{job.department || 'General'}</span>
            </div>
            <h1 className="jd-hero-title" style={{ fontSize: '38px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', textAlign: 'left' }}>{job.title}</h1>
            <div
              className="job-detail-meta"
              style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#475569', fontWeight: '700' }}
            >
              <span>
                <strong>Company:</strong> <span style={{ color: '#0f172a' }}>{job.company}</span>
              </span>
              <span>
                <strong>Location:</strong> <span style={{ color: '#0f172a' }}>{job.location}</span>
              </span>
              <span>
                <strong>Job Type:</strong>{" "}
                <span
                  style={{
                    color: getJobTypeColor(job.jobType),
                    textTransform: "capitalize",
                    fontWeight: '800'
                  }}
                >
                  {job.jobType.replace("-", " ")}
                </span>
              </span>
              <span>
                <strong>Experience:</strong> <span style={{ color: '#0f172a' }}>{job.experience}</span>
              </span>
              <span>
                <strong>Salary:</strong> <span style={{ color: '#059669', fontWeight: '800' }}>{formatSalary(job.salary)}</span>
              </span>
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      <section className="section" style={{ paddingTop: "20px", position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
        <div className="container">
          <div className="job-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
            
            {/* Left Content Column */}
            <div className="job-detail-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className="jd-card-3d">
                <div className="card-bg-light-glow"></div>
                <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', position: 'relative', zIndex: 2 }}>Job Description</h2>
                <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: '1.7', margin: 0, position: 'relative', zIndex: 2, fontWeight: '600' }}>{job.description}</p>
                <div className="card-glow-bar"></div>
              </div>

              {job.requirements?.length > 0 && (
                <div className="jd-card-3d">
                  <div className="card-bg-light-glow"></div>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', position: 'relative', zIndex: 2 }}>Requirements</h2>
                  <ul className="detail-list" style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569', fontSize: '14px', fontWeight: '600', position: 'relative', zIndex: 2 }}>
                    {(job.requirements || []).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                  <div className="card-glow-bar"></div>
                </div>
              )}

              {job.responsibilities?.length > 0 && (
                <div className="jd-card-3d">
                  <div className="card-bg-light-glow"></div>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', position: 'relative', zIndex: 2 }}>Responsibilities</h2>
                  <ul className="detail-list" style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569', fontSize: '14px', fontWeight: '600', position: 'relative', zIndex: 2 }}>
                    {(job.responsibilities || []).map((res, i) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                  <div className="card-glow-bar"></div>
                </div>
              )}

              {job.qualifications?.length > 0 && (
                <div className="jd-card-3d">
                  <div className="card-bg-light-glow"></div>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', position: 'relative', zIndex: 2 }}>Qualifications</h2>
                  <ul className="detail-list" style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569', fontSize: '14px', fontWeight: '600', position: 'relative', zIndex: 2 }}>
                    {(job.qualifications || []).map((qual, i) => (
                      <li key={i}>{qual}</li>
                    ))}
                  </ul>
                  <div className="card-glow-bar"></div>
                </div>
              )}

              {job.benefits?.length > 0 && (
                <div className="jd-card-3d">
                  <div className="card-bg-light-glow"></div>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', position: 'relative', zIndex: 2 }}>Benefits</h2>
                  <div className="benefits-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', position: 'relative', zIndex: 2 }}>
                    {(job.benefits || []).map((benefit, i) => (
                      <span key={i} className="benefit-item" style={{ background: '#ecfdf5', color: '#065f46', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid #a7f3d0' }}>
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                  <div className="card-glow-bar"></div>
                </div>
              )}

              {job.skills?.length > 0 && (
                <div className="jd-card-3d">
                  <div className="card-bg-light-glow"></div>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', position: 'relative', zIndex: 2 }}>Required Skills</h2>
                  <div className="skills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', position: 'relative', zIndex: 2 }}>
                    {(job.skills || []).map((skill, i) => (
                      <span key={i} className="skill-tag" style={{ background: '#f1f5f9', color: '#334155', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', border: '1.5px solid #cbd5e1' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="card-glow-bar"></div>
                </div>
              )}
            </div>

            {/* Right Sidebar Column: Application Form */}
            <div className="job-detail-sidebar" id="apply" style={{ position: 'sticky', top: '24px' }}>
              <div className="jd-card-3d apply-card">
                <div className="card-bg-light-glow"></div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', position: 'relative', zIndex: 2 }}>Apply for this Position</h3>
                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 2 }}>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group-custom">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={applicationForm.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="form-group-custom">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={applicationForm.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '14px' }}>
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={applicationForm.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '14px' }}>
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={applicationForm.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '14px' }}>
                    <label>Years of Experience</label>
                    <input
                      type="text"
                      name="experience"
                      value={applicationForm.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 years"
                    />
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '14px' }}>
                    <label>Current Company</label>
                    <input
                      type="text"
                      name="currentCompany"
                      value={applicationForm.currentCompany}
                      onChange={handleInputChange}
                      placeholder="Previous employer"
                    />
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '14px' }}>
                    <label>Current Position</label>
                    <input
                      type="text"
                      name="currentPosition"
                      value={applicationForm.currentPosition}
                      onChange={handleInputChange}
                      placeholder="Your current role"
                    />
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '14px' }}>
                    <label>Cover Letter</label>
                    <textarea
                      name="coverLetter"
                      value={applicationForm.coverLetter}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Tell us why you're a great fit..."
                    ></textarea>
                  </div>
                  <div className="form-group-custom" style={{ marginBottom: '20px' }}>
                    <label>Resume (PDF/DOC/DOCX, max 5MB)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      style={{ padding: '8px', background: '#ffffff' }}
                    />
                    {resumeFile && (
                      <div
                        style={{
                          fontSize: "12.5px",
                          color: "#10b981",
                          marginTop: "6px",
                          fontWeight: "700",
                        }}
                      >
                        Selected: {resumeFile.name}
                      </div>
                    )}
                    {resumeError && (
                      <div
                        style={{
                          fontSize: "12.5px",
                          color: "#ef4444",
                          marginTop: "6px",
                          fontWeight: "700",
                        }}
                      >
                        {resumeError}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "#64748b",
                        marginTop: "6px",
                        fontWeight: "600",
                      }}
                    >
                      Uploading a resume lets our team run automatic resume screening on your application.
                    </div>
                  </div>

                  {successMessage && (
                    <div className="form-success" style={{ padding: '12px', background: '#ecfdf5', color: '#065f46', border: '1.5px solid #a7f3d0', borderRadius: '10px', fontWeight: '700', marginBottom: '14px', fontSize: '13px' }}>{successMessage}</div>
                  )}
                  {errorMessage && (
                    <div className="form-error" style={{ padding: '12px', background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fecaca', borderRadius: '10px', fontWeight: '700', marginBottom: '14px', fontSize: '13px' }}>{errorMessage}</div>
                  )}

                  <button
                    type="submit"
                    className="cv-action-btn primary glow-btn"
                    style={{ width: "100%", justifyContent: 'center' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application ✨"}
                  </button>
                </form>
                <div className="card-glow-bar"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        .job-detail-wrapper-light {
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
          animation: floatJobDetailParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatJobDetailParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .jd-hero-section-light {
          position: relative;
          background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                      #f8fafc;
          color: #0f172a;
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
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
        }

        .jd-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .jd-card-3d {
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

        .jd-card-3d:hover {
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

        .form-group-custom label {
          display: block;
          font-weight: 700;
          font-size: 13px;
          color: #334155;
          margin-bottom: 6px;
        }

        .form-group-custom input,
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
        .form-group-custom textarea:focus {
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

        .jd-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        @media (max-width: 1024px) {
          .job-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JobDetail;