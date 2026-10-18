import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddJob, setShowAddJob] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  const initialFormState = {
    title: "",
    company: "",
    location: "",
    jobType: "full-time",
    experience: "",
    department: "",
    openings: 1,
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "INR",
    description: "",
    requirements: "",
    responsibilities: "",
    skills: "",
    qualifications: "",
    benefits: "",
    isActive: true,
    featured: false,
  };

  const [jobForm, setJobForm] = useState(initialFormState);

  const load = () => {
    setLoading(true);
    api.jobs.getAll({ limit: 100 }).then((res) => {
      if (res?.success) setJobs(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleJobFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateModal = () => {
    setEditingJobId(null);
    setJobForm(initialFormState);
    setShowAddJob(true);
  };

  const openEditModal = (job) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      jobType: job.jobType || "full-time",
      experience: job.experience || "",
      department: job.department || "",
      openings: job.openings || 1,
      salaryMin: job.salary?.min || "",
      salaryMax: job.salary?.max || "",
      salaryCurrency: job.salary?.currency || "INR",
      description: job.description || "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : job.requirements || "",
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities.join("\n")
        : job.responsibilities || "",
      skills: Array.isArray(job.skills)
        ? job.skills.join(", ")
        : job.skills || "",
      qualifications: Array.isArray(job.qualifications)
        ? job.qualifications.join("\n")
        : job.qualifications || "",
      benefits: Array.isArray(job.benefits)
        ? job.benefits.join("\n")
        : job.benefits || "",
      isActive: job.isActive ?? true,
      featured: job.featured ?? false,
    });
    setShowAddJob(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();

    if (!jobForm.title.trim()) {
      alert("Job title is required");
      return;
    }

    if (!jobForm.company.trim()) {
      alert("Company name is required");
      return;
    }

    if (!jobForm.location.trim()) {
      alert("Location is required");
      return;
    }

    try {
      setSavingJob(true);

      const payload = {
        title: jobForm.title.trim(),
        company: jobForm.company.trim(),
        location: jobForm.location.trim(),
        jobType: jobForm.jobType,
        experience: jobForm.experience,
        department: jobForm.department,
        openings: Number(jobForm.openings) || 1,

        salary: {
          min: Number(jobForm.salaryMin) || 0,
          max: Number(jobForm.salaryMax) || 0,
          currency: jobForm.salaryCurrency || "INR",
        },

        description: jobForm.description,

        requirements: jobForm.requirements
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

        responsibilities: jobForm.responsibilities
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

        skills: jobForm.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        qualifications: jobForm.qualifications
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

        benefits: jobForm.benefits
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

        isActive: Boolean(jobForm.isActive),
        featured: Boolean(jobForm.featured),
      };

      let res;
      if (editingJobId) {
        res = await api.jobs.update(editingJobId, payload);
      } else {
        res = await api.jobs.create(payload);
      }

      if (!res?.success) {
        throw new Error(
          res?.message ||
            (editingJobId ? "Failed to update job" : "Failed to create job"),
        );
      }

      alert(
        editingJobId
          ? "Job updated successfully!"
          : "Job posted successfully and is LIVE.",
      );

      setShowAddJob(false);
      setEditingJobId(null);
      setJobForm(initialFormState);
      load();
    } catch (error) {
      console.error("Save job error:", error);
      alert(error?.message || "Operation failed");
    } finally {
      setSavingJob(false);
    }
  };

  const toggleActive = async (job) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, isActive: !j.isActive } : j)),
    );
    await api.jobs.update(job.id, { isActive: !job.isActive });
  };

  const toggleFeatured = async (job) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, featured: !j.featured } : j)),
    );
    await api.jobs.update(job.id, { featured: !job.featured });
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this job posting? This will also remove its applications.",
      )
    )
      return;
    await api.jobs.delete(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && job.isActive) ||
      (statusFilter === "inactive" && !job.isActive) ||
      (statusFilter === "featured" && job.featured);

    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      (job.title && job.title.toLowerCase().includes(searchLower)) ||
      (job.company && job.company.toLowerCase().includes(searchLower)) ||
      (job.location && job.location.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="light-jobs-container">
      {/* Live Floating Particles Background */}
      <div className="cand-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="cand-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Marquee Banner */}
      <div className="job-marquee-banner">
        <div className="job-marquee-track">
          <span>✨ Recruweb Enterprise Jobs Management &amp; Postings Inbox</span>
          <span>•</span>
          <span>💼 Active, Standard &amp; Featured Job Postings Across Platform</span>
          <span>•</span>
          <span>⭐ Real-time Vacancy Updates &amp; Instant Publishing</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Jobs Management{" "}
              <span className="gradient-text">— Postings Inbox</span>
            </h1>
            <p className="cand-subtitle">
              All active, standard, &amp; featured job postings across the platform ({jobs.length} Total)
            </p>
          </div>
          <button className="cv-action-btn primary glow-btn" onClick={openCreateModal}>
            <span>+ Add New Job ✨</span>
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Add / Edit Job Modal */}
      {showAddJob && (
        <div className="modal-overlay-light" onClick={() => setShowAddJob(false)}>
          <div
            className="modal-card-light animate-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "850px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>{editingJobId ? "Edit Job Posting" : "Add New Job"}</h2>
                <p className="drawer-subtext">
                  {editingJobId
                    ? "Update existing details."
                    : "Create a live job posting instantly."}
                </p>
              </div>

              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setShowAddJob(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="drawer-scroll-body">
              <div className="job-form-grid">
                <div className="input-group-3d">
                  <label>Job Title *</label>
                  <input
                    name="title"
                    value={jobForm.title}
                    onChange={handleJobFormChange}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                    className="cand-input"
                  />
                </div>

                <div className="input-group-3d">
                  <label>Company *</label>
                  <input
                    name="company"
                    value={jobForm.company}
                    onChange={handleJobFormChange}
                    placeholder="Company name"
                    required
                    className="cand-input"
                  />
                </div>

                <div className="input-group-3d">
                  <label>Location *</label>
                  <input
                    name="location"
                    value={jobForm.location}
                    onChange={handleJobFormChange}
                    placeholder="e.g. Bengaluru / Remote"
                    required
                    className="cand-input"
                  />
                </div>

                <div className="input-group-3d">
                  <label>Job Type</label>
                  <select
                    name="jobType"
                    value={jobForm.jobType}
                    onChange={handleJobFormChange}
                    className="cand-input"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="input-group-3d">
                  <label>Experience</label>
                  <input
                    name="experience"
                    value={jobForm.experience}
                    onChange={handleJobFormChange}
                    placeholder="e.g. 2-4 years"
                    className="cand-input"
                  />
                </div>

                <div className="input-group-3d">
                  <label>Department</label>
                  <input
                    name="department"
                    value={jobForm.department}
                    onChange={handleJobFormChange}
                    placeholder="e.g. Engineering"
                    className="cand-input"
                  />
                </div>

                <div className="input-group-3d">
                  <label>Openings</label>
                  <input
                    type="number"
                    min="1"
                    name="openings"
                    value={jobForm.openings}
                    onChange={handleJobFormChange}
                    className="cand-input"
                  />
                </div>

                <div className="input-group-3d">
                  <label>Currency</label>
                  <select
                    name="salaryCurrency"
                    value={jobForm.salaryCurrency}
                    onChange={handleJobFormChange}
                    className="cand-input"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div className="input-group-3d">
                  <label>Minimum Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={jobForm.salaryMin}
                    onChange={handleJobFormChange}
                    placeholder="500000"
                    className="cand-input"
                  />
                </div>

                <div className="input-group-3d">
                  <label>Maximum Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={jobForm.salaryMax}
                    onChange={handleJobFormChange}
                    placeholder="1200000"
                    className="cand-input"
                  />
                </div>

                <div className="input-group-3d" style={{ gridColumn: "1 / -1" }}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={jobForm.description}
                    onChange={handleJobFormChange}
                    placeholder="Write complete job summary..."
                    rows="4"
                    className="cand-input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div className="input-group-3d">
                  <label>Requirements</label>
                  <textarea
                    name="requirements"
                    value={jobForm.requirements}
                    onChange={handleJobFormChange}
                    placeholder="One requirement per line"
                    rows="4"
                    className="cand-input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div className="input-group-3d">
                  <label>Responsibilities</label>
                  <textarea
                    name="responsibilities"
                    value={jobForm.responsibilities}
                    onChange={handleJobFormChange}
                    placeholder="One responsibility per line"
                    rows="4"
                    className="cand-input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div className="input-group-3d">
                  <label>Skills</label>
                  <textarea
                    name="skills"
                    value={jobForm.skills}
                    onChange={handleJobFormChange}
                    placeholder="React, Node.js, TypeScript"
                    rows="3"
                    className="cand-input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div className="input-group-3d">
                  <label>Qualifications</label>
                  <textarea
                    name="qualifications"
                    value={jobForm.qualifications}
                    onChange={handleJobFormChange}
                    placeholder="B.Tech / MCA or equivalent"
                    rows="3"
                    className="cand-input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div className="input-group-3d" style={{ gridColumn: "1 / -1" }}>
                  <label>Benefits</label>
                  <textarea
                    name="benefits"
                    value={jobForm.benefits}
                    onChange={handleJobFormChange}
                    placeholder="Health Insurance&#10;Flexible Work Hours&#10;Provident Fund"
                    rows="3"
                    className="cand-input"
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              <div className="job-form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={jobForm.featured}
                    onChange={handleJobFormChange}
                  />
                  ⭐ Make Featured Listing
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={jobForm.isActive}
                    onChange={handleJobFormChange}
                  />
                  🟢 Set Status as Active
                </label>
              </div>

              <div className="job-form-actions">
                <button
                  type="button"
                  className="cv-action-btn secondary"
                  onClick={() => setShowAddJob(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cv-action-btn primary glow-btn"
                  disabled={savingJob}
                >
                  {savingJob
                    ? "Saving..."
                    : editingJobId
                      ? "Save Changes ✨"
                      : "🚀 Post Job Live ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toolbar & Filter Bar */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="card-bg-light-glow"></div>
        <div className="search-input-wrap" style={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", minWidth: "280px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="job-search-input"
            placeholder="Search by job title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-wrap" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "0 16px", borderRadius: "12px" }}>
          <span className="filter-icon">📌</span>
          <select
            className="job-select-dark"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Postings</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Fetching job postings...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="cand-empty-state">
              💼 No job postings found matching your criteria.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Employment Type</th>
                    <th>Openings</th>
                    <th>Active Status</th>
                    <th>Featured Tag</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="table-row-hover">
                      <td>
                        <div className="job-title-cell">
                          <strong>{job.title}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="company-text">
                          🏢 {job.company || "—"}
                        </span>
                      </td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>📍 {job.location || "—"}</td>
                      <td>
                        <span className="jobtype-pill">
                          {job.jobType || "Full-time"}
                        </span>
                      </td>
                      <td>
                        <span className="openings-pill">{job.openings || 1}</span>
                      </td>
                      <td>
                        <button
                          className={`btn-toggle-badge ${
                            job.isActive ? "active-state" : "inactive-state"
                          }`}
                          onClick={() => toggleActive(job)}
                        >
                          {job.isActive ? "🟢 Active" : "🔴 Inactive"}
                        </button>
                      </td>
                      <td>
                        <button
                          className={`btn-toggle-badge ${
                            job.featured ? "featured-state" : "standard-state"
                          }`}
                          onClick={() => toggleFeatured(job)}
                        >
                          {job.featured ? "⭐ Featured" : "Standard"}
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="cv-action-btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => openEditModal(job)}
                          >
                            Edit
                          </button>
                          <button
                            className="cv-action-btn"
                            style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                            onClick={() => handleDelete(job.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-jobs-container {
          position: relative;
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 3vw 80px;
          color: #0f172a;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        /* Live Floating Particles Background */
        .cand-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .cand-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          border-radius: 50%;
          opacity: 0.4;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 8px rgba(2, 132, 199, 0.4);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        /* Marquee Ribbon */
        .job-marquee-banner {
          background: linear-gradient(90deg, #0284c7, #6366f1);
          color: #ffffff;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.2);
          margin-bottom: 24px;
        }

        .job-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .job-marquee-track span {
          margin: 0 20px;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .cand-header-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px 32px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-header-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #0284c7, #6366f1);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .cand-header-3d:hover .card-glow-bar,
        .cand-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        .cand-title {
          font-size: 30px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .cv-action-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
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

        /* Modal styling */
        .modal-overlay-light {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-card-light {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
          width: 100%;
        }

        .animate-modal {
          animation: modalAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .drawer-header-3d {
          padding: 24px;
          border-bottom: 1.5px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #f8fafc;
        }

        .drawer-header-3d h2 {
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .drawer-subtext {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          font-weight: 700;
        }

        .close-drawer-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 28px;
          cursor: pointer;
          font-weight: 900;
        }
        .close-drawer-btn:hover {
          color: #0f172a;
        }

        .drawer-scroll-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: #ffffff;
        }

        .job-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .input-group-3d {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group-3d label {
          font-size: 12.5px;
          font-weight: 800;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cand-input {
          width: 100%;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
        }

        .cand-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
        }

        .job-form-options {
          padding: 16px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #334155;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: #0284c7;
          cursor: pointer;
        }

        .job-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        .job-search-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
        }

        .job-select-dark {
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          padding: 10px 0;
        }

        .cand-card-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .cand-table-wrap {
          overflow-x: auto;
        }

        .cand-light-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .cand-light-table th {
          padding: 14px 16px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1.5px solid #cbd5e1;
          letter-spacing: 0.5px;
          background: #f8fafc;
        }

        .cand-light-table td {
          padding: 16px;
          font-size: 13.5px;
          color: #334155;
          font-weight: 700;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }

        .table-row-hover:hover {
          background: #f8fafc;
        }

        .job-title-cell strong {
          color: #0f172a;
          font-size: 14.5px;
          font-weight: 900;
        }

        .company-text {
          font-weight: 800;
          color: #334155;
        }

        .jobtype-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 4px 11px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
        }

        .openings-pill {
          background: #f3e8ff;
          color: #9333ea;
          font-size: 12px;
          font-weight: 900;
          padding: 4px 11px;
          border-radius: 12px;
          border: 1.5px solid #e9d5ff;
        }

        .btn-toggle-badge {
          border: 1.5px solid;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-toggle-badge.active-state {
          background: #ecfdf5;
          color: #059669;
          border-color: #a7f3d0;
        }

        .btn-toggle-badge.inactive-state {
          background: #f1f5f9;
          color: #64748b;
          border-color: #cbd5e1;
        }

        .btn-toggle-badge.featured-state {
          background: #f3e8ff;
          color: #9333ea;
          border-color: #e9d5ff;
        }

        .btn-toggle-badge.standard-state {
          background: #f8fafc;
          color: #64748b;
          border-color: #cbd5e1;
        }

        .action-buttons-group {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .cand-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #0284c7;
          font-weight: 900;
        }

        .cand-loader {
          width: 22px;
          height: 22px;
          border: 3px solid #0284c7;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .cand-empty-state {
          text-align: center;
          padding: 60px;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 700px) {
          .job-form-grid {
            grid-template-columns: 1fr;
          }
          .job-form-options {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminJobs;