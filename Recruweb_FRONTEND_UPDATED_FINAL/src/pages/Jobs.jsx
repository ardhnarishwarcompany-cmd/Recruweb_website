import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ScrollIndicator from "../components/ScrollIndicator";
import { api } from "../utils/api";

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allLocations, setAllLocations] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    jobType: searchParams.get("jobType") || "",
    experience: searchParams.get("experience") || "",
    department: searchParams.get("department") || "",
    company: searchParams.get("company") || "",
  });
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Sync filters whenever URL search params change
  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "",
      jobType: searchParams.get("jobType") || "",
      experience: searchParams.get("experience") || "",
      department: searchParams.get("department") || "",
      company: searchParams.get("company") || "",
    });
  }, [searchParams]);

  const limit = 12;

  useEffect(() => {
    api.jobs
      .getAll({ limit: 1000 })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setAllLocations(
            [
              ...new Set(res.data.map((j) => j.location).filter(Boolean)),
            ].sort(),
          );
          setAllDepartments(
            [
              ...new Set(res.data.map((j) => j.department).filter(Boolean)),
            ].sort(),
          );
        }
      })
      .catch(() => {});
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.experience) params.experience = filters.experience;
      if (filters.department) params.department = filters.department;

      const res = await api.jobs.getAll(params);
      if (res?.success) {
        let results = res.data || [];

        if (filters.company) {
          const companyLower = filters.company.toLowerCase();
          results = results.filter((j) =>
            j.company?.toLowerCase().includes(companyLower),
          );
        }

        if (sortBy === "salary") {
          results = [...results].sort(
            (a, b) => (b.salary?.max || 0) - (a.salary?.max || 0),
          );
        } else if (sortBy === "newest") {
          results = [...results].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
        }

        setJobs(results);
        setTotal(res.total ?? results.length);
        setTotalPages(res.totalPages ?? 1);
      } else {
        setJobs([]);
        setTotal(0);
        setTotalPages(1);
        setError(res?.message || "Failed to load jobs.");
      }
    } catch {
      setJobs([]);
      setTotal(0);
      setTotalPages(1);
      setError(
        "Couldn't reach the server. Please check your connection and try again.",
      );
    }
    setLoading(false);
  }, [page, filters, sortBy]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "",
      jobType: "",
      experience: "",
      department: "",
      company: "",
    });
    setSortBy("featured");
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
    if (!salary || !salary.min) return "Competitive";
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

  return (
    <div className="jobs-page-wrapper-light">
      {/* Live Floating Particles Background */}
      <div className="jobs-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="jobs-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hero Header Section (Light Theme) */}
      <section className="jobs-hero-section-light">
        <div className="container">
          <div className="jobs-hero-header">
            <div className="jobs-badge">
              <span className="jobs-badge-dot"></span>
              <span>Careers At Recruweb</span>
            </div>
            <h1 className="jobs-hero-title">
              Find Your <span className="gradient-text">Dream Job</span> Today
            </h1>
            <p className="jobs-hero-subtitle">
              Explore {total > 0 ? total : "hundreds of"} verified openings
              across top departments & hiring companies.
            </p>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Main Jobs Explorer Section */}
      <section className="jobs-main-section">
        <div className="container">
          {/* Quick Nav Cards */}
          <div className="quick-extra-grid">
            <Link to="/jobs" className="quick-extra-card">
              <div className="extra-icon-box">📋</div>
              <div>
                <h4>Browse All Jobs</h4>
                <p>View all open positions</p>
              </div>
            </Link>
            <Link to="/post-job" className="quick-extra-card highlight">
              <div className="extra-icon-box highlight-icon">✨</div>
              <div>
                <h4>Post a Job</h4>
                <p>Find your next talent</p>
              </div>
            </Link>
            <Link to="/companies" className="quick-extra-card">
              <div className="extra-icon-box">🏢</div>
              <div>
                <h4>Companies</h4>
                <p>Explore hiring partners</p>
              </div>
            </Link>
            <Link to="/schedule-interview" className="quick-extra-card">
              <div className="extra-icon-box">📅</div>
              <div>
                <h4>Schedule Interview</h4>
                <p>Book your slot</p>
              </div>
            </Link>
          </div>

          {/* Search & Action Bar */}
          <div className="jobs-search-bar-card">
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                name="search"
                placeholder="Search by job title, company, or skills..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="search-bar-actions">
              <button
                className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>⚙️ Filters</span>
              </button>
              <select
                className="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured First</option>
                <option value="salary">Highest Salary</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Quick Links Horizontal Ribbon */}
          <div className="quick-links-ribbon">
            <span className="quick-label">⚡ Popular:</span>
            <div className="quick-buttons">
              <Link to="/jobs?jobType=full-time" className="quick-btn">
                Full Time
              </Link>
              <Link to="/jobs?jobType=remote" className="quick-btn">
                Remote
              </Link>
              <Link to="/jobs?jobType=internship" className="quick-btn">
                Internship
              </Link>
              <Link to="/jobs?experience=fresher" className="quick-btn">
                Freshers
              </Link>
              <Link to="/jobs?department=Engineering" className="quick-btn">
                Engineering
              </Link>
              <Link to="/jobs?department=Human+Resources" className="quick-btn">
                HR Jobs
              </Link>
            </div>
          </div>

          {/* Main Layout Grid (Filter Sidebar + Results Grid) */}
          <div className="jobs-content-grid">
            {/* Sidebar Filters */}
            <aside
              className={`jobs-filter-sidebar ${showFilters ? "mobile-show" : ""}`}
            >
              <div className="sidebar-header">
                <h3>Filter Jobs</h3>
                <button className="reset-btn" onClick={clearFilters}>
                  Clear All
                </button>
              </div>

              <div className="filter-group">
                <label>Location</label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                >
                  <option value="">All Locations</option>
                  {allLocations.map((loc, i) => (
                    <option key={i} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Job Type</label>
                <select
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Experience</label>
                <select
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                >
                  <option value="">All Levels</option>
                  <option value="fresher">Fresher</option>
                  <option value="1-2 years">1-2 Years</option>
                  <option value="3-5 years">3-5 Years</option>
                  <option value="5-10 years">5-10 Years</option>
                  <option value="10+ years">10+ Years</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Department</label>
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                >
                  <option value="">All Departments</option>
                  {allDepartments.map((dept, i) => (
                    <option key={i} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </aside>

            {/* Results Grid Column */}
            <main className="jobs-results-column">
              <div className="results-status-bar">
                <h2>
                  <span>{total}</span> Open Opportunities
                </h2>
                {filters.company && (
                  <span className="filter-badge">
                    Company: {filters.company}
                    <button
                      onClick={() => setFilters({ ...filters, company: "" })}
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>

              {loading ? (
                <div className="empty-jobs-card">
                  <span className="empty-icon spin">⌛</span>
                  <h3>Loading Jobs…</h3>
                  <p>Fetching the latest openings from the server.</p>
                </div>
              ) : error ? (
                <div className="empty-jobs-card">
                  <span className="empty-icon">⚠️</span>
                  <h3>Couldn't Load Jobs</h3>
                  <p>{error}</p>
                  <button onClick={fetchJobs} className="btn-primary-action">
                    Try Again
                  </button>
                </div>
              ) : jobs.length === 0 ? (
                <div className="empty-jobs-card">
                  <span className="empty-icon">🔍</span>
                  <h3>No Jobs Matched</h3>
                  <p>
                    Try adjusting your search criteria or clearing active
                    filters.
                  </p>
                  <button onClick={clearFilters} className="btn-primary-action">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="job-cards-grid">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className={`redesigned-job-card ${job.featured ? "is-featured" : ""}`}
                    >
                      {job.featured && (
                        <span className="featured-badge">Featured</span>
                      )}

                      <div className="card-top-row">
                        <div>
                          <h3 className="job-card-title">{job.title}</h3>
                          <span className="company-tag">🏢 {job.company}</span>
                        </div>
                        <span
                          className="type-pill"
                          style={{
                            background: `${getJobTypeColor(job.jobType)}15`,
                            color: getJobTypeColor(job.jobType),
                            borderColor: `${getJobTypeColor(job.jobType)}40`,
                          }}
                        >
                          {job.jobType?.replace("-", " ")}
                        </span>
                      </div>

                      <div className="card-meta-list">
                        <span>📍 {job.location}</span>
                        <span>🎓 {job.experience}</span>
                        <span>💰 {formatSalary(job.salary)}</span>
                      </div>

                      <p className="card-description">
                        {(job.description || "").substring(0, 100)}...
                      </p>

                      <div className="card-skills-row">
                        {(job.skills || []).slice(0, 3).map((skill, i) => (
                          <span key={i} className="skill-chip">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="card-bottom-row">
                        <span className="openings-pill">
                          {job.openings || 1} opening
                          {job.openings > 1 ? "s" : ""}
                        </span>
                        <div className="card-actions">
                          <Link to={`/jobs/${job.id}`} className="btn-outline">
                            Details
                          </Link>
                          <Link
                            to={`/jobs/${job.id}#apply`}
                            className="btn-solid"
                          >
                            Apply
                          </Link>
                        </div>
                      </div>
                      <div className="card-glow-bar"></div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && totalPages > 1 && (
                <div className="jobs-pagination">
                  <button
                    className="page-btn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </button>
                  <span className="page-status">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Upgraded 3D Pro CTA Section with Live Particles */}
      <section className="about-cta-section-pro">
        <div className="about-cta-bg-pro">
          <div className="about-cta-gradient-pro"></div>
          {/* Live Floating Particles */}
          <div className="about-cta-particles-container">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="about-cta-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${8 + Math.random() * 6}s`,
                }}
              ></div>
            ))}
          </div>
          <div className="about-cta-shapes-pro">
            <div className="about-cta-shape-pro shape-1-pro"></div>
            <div className="about-cta-shape-pro shape-2-pro"></div>
          </div>
        </div>

        <div className="container">
          <div className="about-cta-wrapper-pro">
            <div className="about-cta-inner-card">
              <span className="about-cta-badge-pill">🚀 Ready For Growth</span>
              <h2>Can't find the right opportunity?</h2>
              <p>
                Submit your updated CV/Resume and our recruitment team will reach
                out to you.
              </p>
              <div className="about-cta-buttons-pro">
                <Link to="/contact" className="btn-about-cta-primary">
                  <span>Submit Your Resume</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .jobs-page-wrapper-light {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Live Particles Background */
        .jobs-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .jobs-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatJobsParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatJobsParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Hero Header (Light Theme) */
        .jobs-hero-section-light {
          position: relative;
          padding: 92px 0 82px;
          background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                      #f8fafc;
          color: #0f172a;
          text-align: center;
          overflow: hidden;
          z-index: 1;
        }

        .jobs-hero-header {
          text-align: center;
          max-width: 750px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .jobs-badge {
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

        .jobs-badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .jobs-hero-title {
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

        .jobs-hero-subtitle {
          font-size: 16.5px;
          margin-bottom: 26px;
          color: #64748b;
          line-height: 1.6;
        }

        /* Quick Extra Grid */
        .quick-extra-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 24px auto 30px;
          position: relative;
          z-index: 10;
        }

        .quick-extra-card {
          background: #ffffff;
          padding: 18px 20px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.03);
          transform: perspective(1000px) rotateX(2deg);
        }

        .quick-extra-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          border-color: #6366f1;
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
        }

        .quick-extra-card.highlight {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          border-color: #ddd6fe;
        }

        .extra-icon-box {
          font-size: 22px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 14px;
          transition: transform 0.3s ease;
        }

        .quick-extra-card:hover .extra-icon-box {
          transform: scale(1.1) rotate(5deg);
        }

        .highlight-icon {
          background: #ede9fe;
        }

        .quick-extra-card h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }

        .quick-extra-card p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        /* Search Bar Box */
        .jobs-search-bar-card {
          background: #ffffff;
          padding: 14px 20px;
          border-radius: 18px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .search-icon {
          font-size: 18px;
        }

        .search-input-group input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 15px;
          color: #0f172a;
          background: transparent;
        }

        .search-bar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-toggle-btn {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          padding: 9px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-toggle-btn.active, .filter-toggle-btn:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .sort-dropdown {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          padding: 9px 16px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 13px;
          color: #0f172a;
          outline: none;
        }

        /* Quick Ribbon */
        .quick-links-ribbon {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .quick-label {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
        }

        .quick-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .quick-btn {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 600;
          color: #4f46e5;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .quick-btn:hover {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.25);
        }

        /* Main Content Grid */
        .jobs-content-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 28px;
          align-items: start;
          position: relative;
          z-index: 1;
        }

        /* Sidebar Filters */
        .jobs-filter-sidebar {
          background: #ffffff;
          padding: 24px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
          position: sticky;
          top: 24px;
        }

        @media (max-width: 1024px) {
          .jobs-filter-sidebar {
            display: none;
          }
          .jobs-filter-sidebar.mobile-show {
            display: block;
            position: static;
            margin-bottom: 24px;
          }
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-header h3 {
          font-size: 16px;
          font-weight: 800;
          margin: 0;
        }

        .reset-btn {
          background: none;
          border: none;
          color: #4f46e5;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }

        .filter-group {
          margin-bottom: 16px;
        }

        .filter-group label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
        }

        .filter-group select {
          width: 100%;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          outline: none;
          font-size: 13px;
          background: #f8fafc;
          transition: border-color 0.2s;
        }

        .filter-group select:focus {
          border-color: #6366f1;
        }

        /* Results Column */
        .results-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .results-status-bar h2 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
        }

        .results-status-bar h2 span {
          color: #4f46e5;
        }

        .filter-badge {
          background: #e0e7ff;
          color: #3730a3;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 700;
        }

        .filter-badge button {
          background: none;
          border: none;
          color: #3730a3;
          margin-left: 6px;
          cursor: pointer;
        }

        /* Job Cards Grid with 3D Tilt & Glow Bar */
        .job-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .redesigned-job-card {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          padding: 24px;
          border-radius: 24px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1deg);
        }

        .redesigned-job-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-8px);
          box-shadow: 0 22px 50px rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .redesigned-job-card.is-featured {
          border-left: 4px solid #8b5cf6;
        }

        .featured-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          font-size: 9.5px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 10px;
          text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
        }

        .card-top-row {
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .job-card-title {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .company-tag {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 600;
        }

        .type-pill {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid;
          white-space: nowrap;
        }

        .card-meta-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12.5px;
          color: #475569;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .card-description {
          font-size: 13.5px;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }

        .card-skills-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .skill-chip {
          background: #f1f5f9;
          color: #475569;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 8px;
        }

        .card-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }

        .openings-pill {
          font-size: 11.5px;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .btn-outline {
          padding: 7px 14px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .btn-solid {
          padding: 7px 14px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          transition: transform 0.2s;
        }

        .btn-solid:hover {
          transform: translateY(-2px);
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .redesigned-job-card:hover .card-glow-bar {
          transform: scaleX(1);
        }

        /* Empty State */
        .empty-jobs-card {
          background: white;
          padding: 60px 20px;
          border-radius: 24px;
          text-align: center;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
        }

        .empty-icon {
          font-size: 42px;
          display: block;
          margin-bottom: 14px;
        }

        .spin {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-primary-action {
          margin-top: 16px;
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Pagination */
        .jobs-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 30px;
        }

        .page-btn {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 9px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #6366f1;
          color: #4f46e5;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-status {
          font-size: 13.5px;
          font-weight: 700;
          color: #475569;
        }

        /* --- Upgraded 3D Pro CTA Section with Live Particles --- */
        .about-cta-section-pro {
          position: relative;
          padding: 100px 0;
          overflow: hidden;
          z-index: 1;
        }

        .about-cta-bg-pro {
          position: absolute;
          inset: 0;
        }

        .about-cta-gradient-pro {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #311042 100%);
        }

        .about-cta-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .about-cta-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #c084fc;
          border-radius: 50%;
          opacity: 0.6;
          animation: floatCtaParticle linear infinite;
          box-shadow: 0 0 12px #c084fc;
        }

        @keyframes floatCtaParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-120px) scale(1.2); opacity: 0; }
        }

        .about-cta-shapes-pro {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .about-cta-shape-pro {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.35;
        }

        .shape-1-pro {
          width: 350px;
          height: 350px;
          background: #a855f7;
          top: -100px;
          right: -50px;
        }

        .shape-2-pro {
          width: 300px;
          height: 300px;
          background: #6366f1;
          bottom: -100px;
          left: 50px;
        }

        .about-cta-wrapper-pro {
          position: relative;
          z-index: 2;
        }

        .about-cta-inner-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          border-radius: 36px;
          padding: 60px 40px;
          text-align: center;
          color: white;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
          max-width: 900px;
          margin: 0 auto;
          transform: perspective(1000px) rotateX(2deg);
          transition: transform 0.4s ease;
        }

        .about-cta-inner-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          border-color: rgba(192, 132, 252, 0.4);
        }

        .about-cta-badge-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 18px;
          background: rgba(192, 132, 252, 0.15);
          border: 1px solid rgba(192, 132, 252, 0.3);
          border-radius: 30px;
          font-weight: 700;
          font-size: 13.5px;
          color: #d8b4fe;
          margin-bottom: 22px;
        }

        .about-cta-inner-card h2 {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 16px;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .about-cta-inner-card p {
          font-size: 16.5px;
          color: #cbd5e1;
          line-height: 1.8;
          margin-bottom: 35px;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
        }

        .about-cta-buttons-pro {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .btn-about-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          background: #ffffff;
          color: #4f46e5;
          border-radius: 40px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .btn-about-cta-primary:hover {
          transform: translateY(-3px);
          background: #f8fafc;
          box-shadow: 0 15px 35px rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .job-cards-grid {
            grid-template-columns: 1fr;
          }
          .jobs-search-bar-card {
            flex-direction: column;
            align-items: stretch;
          }
          .quick-extra-grid {
            grid-template-columns: 1fr;
            margin-top: 0;
          }
          .jobs-hero-title {
            font-size: 32px;
          }
          .about-cta-inner-card {
            padding: 40px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Jobs;