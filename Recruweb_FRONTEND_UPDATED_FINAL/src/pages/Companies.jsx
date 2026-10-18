import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import ScrollIndicator from "../components/ScrollIndicator";
import { api } from "../utils/api";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allIndustries, setAllIndustries] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [totalActiveJobs, setTotalActiveJobs] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    size: "",
    location: "",
  });
  const [sortBy, setSortBy] = useState("jobs");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Counter Animation States
  const [countersActive, setCountersActive] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountersActive(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const Counter = ({ end, suffix = "+" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!countersActive) return;

      let start = 0;
      const duration = 2000;
      const stepTime = 16;
      const increment = end / (duration / stepTime);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, stepTime);

      return () => clearInterval(timer);
    }, [countersActive, end]);

    return (
      <span>
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  const limit = 12;

  useEffect(() => {
    api.companies
      .getIndustries()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setAllIndustries(res.data.filter(Boolean));
        }
      })
      .catch(() => {});

    api.companies
      .getAll({ limit: 1000 })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setAllLocations(
            [
              ...new Set(
                res.data
                  .map((c) => c.location?.split(",")[1]?.trim() || c.location)
                  .filter(Boolean),
              ),
            ].sort(),
          );
          setTotalActiveJobs(
            res.data.reduce((acc, c) => acc + (c.activeJobs || 0), 0),
          );
        }
      })
      .catch(() => {});
  }, []);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.industry) params.industry = filters.industry;
      if (filters.size) params.size = filters.size;
      if (filters.location) params.location = filters.location;

      const res = await api.companies.getAll(params);
      if (res?.success) {
        let results = res.data || [];

        if (sortBy === "jobs" || sortBy === "featured") {
          results = [...results].sort(
            (a, b) => (b.activeJobs || 0) - (a.activeJobs || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
        } else if (sortBy === "name") {
          results = [...results].sort((a, b) => b.name.localeCompare(a.name));
        }

        setCompanies(results);
        setTotal(res.total ?? results.length);
        setTotalPages(res.totalPages ?? 1);
      } else {
        setCompanies([]);
        setTotal(0);
        setTotalPages(1);
        setError(res?.message || "Failed to load companies.");
      }
    } catch {
      setCompanies([]);
      setTotal(0);
      setTotalPages(1);
      setError(
        "Couldn't reach the server. Please check your connection and try again.",
      );
    }
    setLoading(false);
  }, [page, filters, sortBy]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ search: "", industry: "", size: "", location: "" });
    setSortBy("jobs");
  };

  const getCompanyInitials = (name) => {
    return (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getCompanyColor = (name) => {
    const colors = [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#3b82f6",
      "#ef4444",
      "#14b8a6",
      "#f97316",
      "#06b6d4",
    ];
    const index = (name || "").charCodeAt(0) % colors.length;
    return colors[index] || colors[0];
  };

  return (
    <div className="companies-page-wrapper-light">
      {/* Live Particles Background */}
      <div className="companies-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="companies-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hero Header Section with Light Theme */}
      <section className="companies-hero-section-light">
        <div className="container">
          <div className="companies-hero-header">
            <div className="companies-badge">
              <span className="badge-dot"></span>
              <span>Our Partner Employers</span>
            </div>
            <h1 className="companies-hero-title">
              Top Hiring <span className="gradient-text">Companies</span>
            </h1>
            <p className="companies-hero-subtitle">
              Discover top organizations actively hiring talent across India.
              Build your career with market leaders.
            </p>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Main Content Section */}
      <section className="companies-main-section">
        <div className="container">
          {/* Top Search & Controls Bar */}
          <div className="companies-search-card">
            <div className="search-input-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                name="search"
                placeholder="Search by company name, industry, or keyword..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div className="search-controls-group">
              <button
                className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>⚙️ Filters</span>
              </button>

              <div className="view-mode-toggle">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  ☈ Grid
                </button>
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  ☰ List
                </button>
              </div>

              <select
                className="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="jobs">Most Jobs (Descending)</option>
                <option value="featured">Featured First</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name Z-A</option>
              </select>
            </div>
          </div>

          {/* Grid Layout: Sidebar Filters + Results */}
          <div className="companies-content-layout">
            {/* Sidebar Filters */}
            <aside
              className={`companies-filter-sidebar ${showFilters ? "mobile-show" : ""}`}
            >
              <div className="sidebar-top">
                <h3>Filter Companies</h3>
                <button className="clear-btn" onClick={clearFilters}>
                  Reset All
                </button>
              </div>

              <div className="filter-group">
                <label>Industry</label>
                <select
                  name="industry"
                  value={filters.industry}
                  onChange={handleFilterChange}
                >
                  <option value="">All Industries</option>
                  {allIndustries.map((ind, i) => (
                    <option key={i} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Company Size</label>
                <select
                  name="size"
                  value={filters.size}
                  onChange={handleFilterChange}
                >
                  <option value="">All Sizes</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
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
            </aside>

            {/* Results Column */}
            <main className="companies-results-column">
              <div className="results-header-info">
                <h2>
                  <span>{total}</span> Organizations Found
                </h2>
                <p>Explore verified companies and view active job openings</p>
              </div>

              {loading ? (
                <div className="empty-state-box">
                  <span className="empty-icon spin">⌛</span>
                  <h3>Loading Companies…</h3>
                  <p>Fetching hiring partners from the server.</p>
                </div>
              ) : error ? (
                <div className="empty-state-box">
                  <span className="empty-icon">⚠️</span>
                  <h3>Couldn't Load Companies</h3>
                  <p>{error}</p>
                  <button onClick={fetchCompanies} className="btn-reset">
                    Try Again
                  </button>
                </div>
              ) : companies.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">🏢</span>
                  <h3>No Companies Matched</h3>
                  <p>
                    Try clearing your active filters or modifying search
                    keywords.
                  </p>
                  <button onClick={clearFilters} className="btn-reset">
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className={`companies-grid-wrapper ${viewMode}`}>
                  {companies.map((company) => (
                    <div
                      key={company.id || company._id}
                      className={`company-glass-card ${company.featured ? "is-featured" : ""} ${viewMode}`}
                    >
                      {company.featured && (
                        <span className="featured-tag">Featured</span>
                      )}

                      <div className="card-bg-light-glow"></div>

                      <div className="card-header-box">
                        <div
                          className="company-avatar-box"
                          style={{ background: getCompanyColor(company.name) }}
                        >
                          <span>{getCompanyInitials(company.name)}</span>
                        </div>
                        <div className="header-text-info">
                          <div className="company-title-row">
                            <h3>{company.name}</h3>
                            {company.isVerified && (
                              <span
                                className="verified-check"
                                title="Verified Company"
                              >
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <span className="industry-text">
                            {company.industry}
                          </span>
                        </div>
                      </div>

                      <div className="company-meta-pills">
                        <span>📍 {company.location}</span>
                        <span>👥 {company.size}</span>
                        {company.founded && <span>📅 Est. {company.founded}</span>}
                      </div>

                      <p className="company-desc">
                        {(company.description || "").substring(0, 110)}...
                      </p>

                      <div className="specialties-flex">
                        {(company.specialties || []).slice(0, 3).map((spec, i) => (
                          <span key={i} className="spec-chip">
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="card-footer-action">
                        <div className="jobs-count-badge">
                          <span className="count-num">
                            {company.activeJobs || 0}
                          </span>
                          <span className="count-lbl">Openings</span>
                        </div>
                        <div className="action-buttons">
                          {company.website && (
                            <a
                              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-link-out"
                            >
                              Website
                            </a>
                          )}
                          <Link
                            to={`/jobs?company=${encodeURIComponent(company.name)}`}
                            className="btn-view-jobs"
                          >
                            View Jobs
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

      {/* Stats Counter Bar with 0-to-N Number Animations */}
      <section className="stats-banner-section-light" ref={statsRef}>
        <div className="container">
          <div className="stats-banner-grid-light">
            <div className="stat-banner-item-light">
              <span className="stat-icon-box">👥</span>
              <span className="stat-num">
                <Counter end={total} suffix="+" />
              </span>
              <span className="stat-lbl">Hiring Partners</span>
            </div>
            <div className="stat-banner-item-light">
              <span className="stat-icon-box">💼</span>
              <span className="stat-num">
                <Counter end={totalActiveJobs} suffix="+" />
              </span>
              <span className="stat-lbl">Active Jobs</span>
            </div>
            <div className="stat-banner-item-light">
              <span className="stat-icon-box">🏭</span>
              <span className="stat-num">
                <Counter end={allIndustries.length} suffix="+" />
              </span>
              <span className="stat-lbl">Industries</span>
            </div>
            <div className="stat-banner-item-light">
              <span className="stat-icon-box">🌍</span>
              <span className="stat-num">
                <Counter end={allLocations.length} suffix="+" />
              </span>
              <span className="stat-lbl">Cities Covered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upgraded 3D Pro CTA Section with Live Particles */}
      <section className="about-cta-section-pro">
        <div className="about-cta-bg-pro">
          <div className="about-cta-gradient-pro"></div>
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
              <h2>Looking to Hire Top Talent?</h2>
              <p>
                Partner with Recruweb to post your job openings and recruit qualified candidates.
              </p>
              <div className="about-cta-buttons-pro">
                <Link to="/contact" className="btn-about-cta-primary">
                  <span>Partner With Us</span>
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
        .companies-page-wrapper-light {
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

        /* Live Particles Background */
        .companies-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .companies-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatCompaniesParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatCompaniesParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Hero Styling (Light Theme) */
        .companies-hero-section-light {
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

        .companies-hero-header {
          max-width: 700px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .companies-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 7px 18px;
          border-radius: 50px;
          font-size: 12.5px;
          font-weight: 800;
          color: #4f46e5;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
        }

        .badge-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
        }

        .companies-hero-title {
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

        .companies-hero-subtitle {
          font-size: 16.5px;
          color: #64748b;
          line-height: 1.6;
        }

        /* Search & Control Card */
        .companies-search-card {
          background: #ffffff;
          padding: 14px 20px;
          border-radius: 18px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 30px 0;
          position: relative;
          z-index: 1;
        }

        .search-input-box {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .search-icon {
          font-size: 18px;
        }

        .search-input-box input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 15px;
          color: #0f172a;
          background: transparent;
        }

        .search-controls-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-toggle-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 9px 16px;
          border-radius: 12px;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
        }

        .view-mode-toggle {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
        }

        .view-btn {
          border: none;
          background: none;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
        }

        .view-btn.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        .sort-dropdown {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 9px 14px;
          border-radius: 12px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
        }

        /* Layout Grid */
        .companies-content-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 28px;
          align-items: start;
          position: relative;
          z-index: 1;
        }

        /* Sidebar Filter */
        .companies-filter-sidebar {
          background: #ffffff;
          padding: 22px;
          border-radius: 18px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.02);
        }

        .sidebar-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-top h3 {
          font-size: 16px;
          font-weight: 800;
          margin: 0;
        }

        .clear-btn {
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
          padding: 9px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          outline: none;
          font-size: 13.5px;
          background: #f8fafc;
        }

        /* Results Header */
        .results-header-info {
          margin-bottom: 18px;
        }

        .results-header-info h2 {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 4px;
        }

        .results-header-info h2 span {
          color: #4f46e5;
        }

        .results-header-info p {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
        }

        /* Companies Cards Grid/List Wrapper with 3D Tilt */
        .companies-grid-wrapper.grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .companies-grid-wrapper.list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .company-glass-card {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          padding: 24px;
          border-radius: 22px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(2deg);
        }

        .company-glass-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-10px);
          box-shadow: 0 25px 60px rgba(99, 102, 241, 0.18);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .company-glass-card.is-featured {
          border-left: 4px solid #8b5cf6;
        }

        .featured-tag {
          position: absolute;
          top: 14px;
          right: 14px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          font-size: 9.5px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .card-header-box {
          display: flex;
          gap: 14px;
          margin-bottom: 14px;
          position: relative;
          z-index: 2;
        }

        .company-avatar-box {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 18px;
          flex-shrink: 0;
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
          transition: transform 0.3s ease;
        }

        .company-glass-card:hover .company-avatar-box {
          transform: scale(1.1) rotate(5deg);
        }

        .header-text-info {
          flex: 1;
        }

        .company-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .company-title-row h3 {
          font-size: 17.5px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .verified-check {
          font-size: 10.5px;
          color: #10b981;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
        }

        .industry-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .company-meta-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          color: #475569;
          font-weight: 600;
          margin-bottom: 10px;
          position: relative;
          z-index: 2;
        }

        .company-desc {
          font-size: 13.5px;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 14px;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        .specialties-flex {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }

        .spec-chip {
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 8px;
        }

        .card-footer-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
          position: relative;
          z-index: 2;
        }

        .jobs-count-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #e0e7ff;
          padding: 5px 12px;
          border-radius: 12px;
        }

        .count-num {
          font-weight: 800;
          color: #3730a3;
          font-size: 13.5px;
        }

        .count-lbl {
          font-size: 11.5px;
          color: #4338ca;
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
        }

        .btn-link-out {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-link-out:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .btn-view-jobs {
          padding: 8px 14px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          transition: transform 0.2s;
        }

        .btn-view-jobs:hover {
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

        .company-glass-card:hover .card-glow-bar {
          transform: scaleX(1);
        }

        /* Empty State */
        .empty-state-box {
          background: white;
          padding: 50px;
          border-radius: 18px;
          text-align: center;
          border: 1.5px solid #e2e8f0;
        }

        .empty-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 14px;
        }

        .jobs-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 24px;
        }

        .page-btn {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 9px 18px;
          border-radius: 10px;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-status {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }

        .btn-reset {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 9px 20px;
          border-radius: 10px;
          font-weight: 700;
          margin-top: 14px;
          cursor: pointer;
        }

        /* Stats Banner - Light Theme */
        .stats-banner-section-light {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 60px 0;
          margin-top: 60px;
          border-top: 1.5px solid #e2e8f0;
          border-bottom: 1.5px solid #e2e8f0;
          position: relative;
          z-index: 2;
        }

        .stats-banner-grid-light {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .stat-banner-item-light {
          text-align: center;
          background: #ffffff;
          padding: 28px 20px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1deg);
        }

        .stat-banner-item-light:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-10px) scale(1.03);
          border-color: #6366f1;
          box-shadow: 0 20px 45px rgba(99, 102, 241, 0.18);
        }

        .stat-icon-box {
          font-size: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          background: #ede9fe;
          border-radius: 16px;
          margin-bottom: 14px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
          transition: transform 0.3s ease;
        }

        .stat-banner-item-light:hover .stat-icon-box {
          transform: scale(1.15) rotate(6deg);
        }

        .stat-banner-item-light .stat-num {
          font-size: 34px;
          font-weight: 800;
          color: #0f172a;
          display: block;
          margin-bottom: 4px;
          transition: color 0.3s ease;
        }

        .stat-banner-item-light:hover .stat-num {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-banner-item-light .stat-lbl {
          font-size: 14px;
          color: #64748b;
          font-weight: 700;
        }

        /* --- Upgraded 3D Pro CTA Section with Live Particles --- */
        .about-cta-section-pro {
          position: relative;
          padding: 100px 0;
          overflow: hidden;
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
          border-radius: 32px;
          padding: 50px 36px;
          text-align: center;
          color: white;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
          max-width: 850px;
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
          padding: 6px 16px;
          background: rgba(192, 132, 252, 0.15);
          border: 1px solid rgba(192, 132, 252, 0.3);
          border-radius: 30px;
          font-weight: 700;
          font-size: 13px;
          color: #d8b4fe;
          margin-bottom: 18px;
        }

        .about-cta-inner-card h2 {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 14px;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .about-cta-inner-card p {
          font-size: 15.5px;
          color: #cbd5e1;
          line-height: 1.7;
          margin-bottom: 28px;
          max-width: 600px;
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
          padding: 14px 32px;
          background: #ffffff;
          color: #4f46e5;
          border-radius: 35px;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .btn-about-cta-primary:hover {
          transform: translateY(-3px);
          background: #f8fafc;
          box-shadow: 0 15px 35px rgba(255, 255, 255, 0.2);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .companies-content-layout {
            grid-template-columns: 1fr;
          }
          .companies-filter-sidebar {
            display: none;
            position: static;
          }
          .companies-filter-sidebar.mobile-show {
            display: block;
          }
          .stats-banner-grid-light {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .companies-grid-wrapper.grid {
            grid-template-columns: 1fr;
          }
          .companies-search-card {
            flex-direction: column;
            align-items: stretch;
          }
          .companies-hero-title {
            font-size: 32px;
          }
          .about-cta-inner-card {
            padding: 35px 20px;
          }
          .stats-banner-grid-light {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Companies;