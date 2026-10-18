import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getDashboardPath } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      if (window.innerWidth > 1024 && isMenuOpen) {
        closeMenu();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    if (isMenuOpen && window.innerWidth <= 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      closeMenu();
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    closeMenu();
    navigate("/");
  };

  const handleDashboardClick = () => {
    const path = getDashboardPath();
    navigate(path);
    setUserDropdownOpen(false);
    closeMenu();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Jobs", path: "/jobs", hasMegaDropdown: true },
    { name: "AI Universe", path: "/ai-career" },
    { name: "Services", path: "/services", hasMegaDropdown: true },
    { name: "Pricing", path: "/pricing" },
    { name: "Companies", path: "/companies" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "SOP Center", path: "/sops" },
    { name: "Contact", path: "/contact" },
  ];

  const jobTypeFilters = [
    {
      name: "Full Time",
      path: "/jobs?jobType=full-time",
      icon: "💼",
      count: "50+",
    },
    {
      name: "Part Time",
      path: "/jobs?jobType=part-time",
      icon: "⏰",
      count: "20+",
    },
    { name: "Remote", path: "/jobs?jobType=remote", icon: "🏠", count: "30+" },
    {
      name: "Internship",
      path: "/jobs?jobType=internship",
      icon: "🎓",
      count: "15+",
    },
    {
      name: "Contract",
      path: "/jobs?jobType=contract",
      icon: "📄",
      count: "10+",
    },
  ];

  const quickLinks = [
    {
      name: "Browse All Jobs",
      path: "/jobs",
      icon: "📋",
      desc: "View all open positions",
    },
    {
      name: "Find Jobs",
      path: "/jobs",
      icon: "🔍",
      desc: "Search and apply for jobs",
    },
    {
      name: "Post a Job",
      path: "/post-job",
      icon: "✨",
      desc: "Find your next hire",
    },
    {
      name: "Companies",
      path: "/companies",
      icon: "🏢",
      desc: "Explore hiring companies",
    },
    {
      name: "Schedule Interview",
      path: "/schedule-interview",
      icon: "📅",
      desc: "Book your slot",
    },
  ];

  const servicesFilters = [
    {
      name: "Industry Manpower",
      path: "/industry",
      icon: "🏭",
      desc: "Manufacturing & industrial workforce",
    },
    {
      name: "Facility Management",
      path: "/contact?service=facility",
      icon: "🏢",
      desc: "Complete facility solutions",
    },
    {
      name: "HR Outsourcing",
      path: "/contact?service=hro",
      icon: "👥",
      desc: "Full HR management",
    },
    {
      name: "Only Recruitment",
      path: "/contact?service=recruitment",
      icon: "🔍",
      desc: "Dedicated hiring support",
    },
    {
      name: "Hospitality Staffing",
      path: "/contact?service=hospitality",
      icon: "🏨",
      desc: "Hotel & restaurant staff",
    },
    {
      name: "Remote Workforce Service",
      path: "/services#remote-workforce",
      icon: "🌐",
      desc: "Indian & global remote talent",
    },
  ];

  const servicesDropdownItems = [
    { title: "Specialized Services", items: servicesFilters },
    {
      title: "Quick Actions",
      items: [
        {
          name: "SOP & Policy Center",
          path: "/sops",
          icon: "📘",
          desc: "View company operating procedures",
        },
        {
          name: "JD Maker",
          path: "/jd-maker",
          icon: "📝",
          desc: "Create job descriptions",
        },
        {
          name: "Resume Builder (AI)",
          path: "/resume-builder",
          icon: "📄",
          desc: "AI resume builder with templates & ATS score",
        },
        {
          name: "CV Screening",
          path: "/cv-screen",
          icon: "🤖",
          desc: "AI-powered resume screening",
        },
        {
          name: "Resume Checker",
          path: "/resume-checker",
          icon: "🔍",
          desc: "Free ATS score check — no login required",
        },
        {
          name: "Cover Letter Builder (AI)",
          path: "/cover-letter-builder",
          icon: "✉️",
          desc: "AI-written cover letter tailored to the job",
        },
        {
          name: "Proposal Studio",
          path: "/proposal",
          icon: "📑",
          desc: "Create & download client proposals",
        },
        {
          name: "Request Quote",
          path: "/contact?service=industry",
          icon: "💬",
          desc: "Get custom pricing",
        },
      ],
    },
  ];

  // Helper to check if a link is active
  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`pro-nav-bar ${isScrolled ? "scrolled" : ""}`}>
        <div className="pro-nav-container">
          {/* Logo */}
          <Link to="/" className="pro-nav-logo" onClick={closeMenu}>
            <div className="logo-badge-ring">
              <img
                src="/images/RW_LOGO_Black_page-0001-removebg-preview.png"
                alt="Recruweb Logo"
                className="logo-image"
              />
            </div>
          </Link>

          {/* Search Bar */}
          
          {/* Desktop Links Menu */}
          <ul className="pro-nav-menu">
            {navLinks.map((link) => {
              const active = isActiveLink(link.path);
              return (
                <li
                  key={link.path}
                  className="pro-nav-item"
                  onMouseEnter={() =>
                    link.hasMegaDropdown && setActiveDropdown(link.name)
                  }
                  onMouseLeave={() =>
                    link.hasMegaDropdown && setActiveDropdown(null)
                  }
                >
                  <Link
                    to={link.path}
                    className={`pro-nav-link ${active ? "active-tab" : ""}`}
                  >
                    {link.name}
                    {link.hasMegaDropdown && (
                      <svg
                        className="chevron-icon"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </Link>

                  {/* Jobs Mega Dropdown */}
                  {link.hasMegaDropdown &&
                    link.name === "Jobs" &&
                    activeDropdown === "Jobs" && (
                      <div className="pro-mega-menu">
                        <div className="pro-mega-grid">
                          <div className="pro-mega-col">
                            <span className="pro-mega-header">
                              Job Categories
                            </span>
                            {jobTypeFilters.map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                className="pro-mega-item"
                                onClick={closeMenu}
                              >
                                <span className="item-icon">{item.icon}</span>
                                <div className="item-info">
                                  <span className="item-title">{item.name}</span>
                                </div>
                                <span className="item-count-tag">
                                  {item.count}
                                </span>
                              </Link>
                            ))}
                          </div>

                          <div className="pro-mega-col">
                            <span className="pro-mega-header">
                              Explore Opportunities
                            </span>
                            {quickLinks.map((item) => (
                              <Link
                                key={item.name}
                                to={item.path}
                                className="pro-mega-item"
                                onClick={closeMenu}
                              >
                                <span className="item-icon">{item.icon}</span>
                                <div className="item-info">
                                  <span className="item-title">{item.name}</span>
                                  <span className="item-desc">{item.desc}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Services Mega Dropdown */}
                  {link.hasMegaDropdown &&
                    link.name === "Services" &&
                    activeDropdown === "Services" && (
                      <div className="pro-mega-menu">
                        <div className="pro-mega-grid">
                          {servicesDropdownItems.map((section, idx) => (
                            <div key={idx} className="pro-mega-col">
                              <span className="pro-mega-header">
                                {section.title}
                              </span>
                              {section.items.map((item) => (
                                <Link
                                  key={item.name}
                                  to={item.path}
                                  className="pro-mega-item"
                                  onClick={closeMenu}
                                >
                                  <span className="item-icon">{item.icon}</span>
                                  <div className="item-info">
                                    <span className="item-title">
                                      {item.name}
                                    </span>
                                    {item.desc && (
                                      <span className="item-desc">
                                        {item.desc}
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </li>
              );
            })}
          </ul>

          {/* Auth Action Buttons */}
          <div className="pro-nav-actions">
            {user ? (
              <div className="pro-user-container">
                <button
                  className="pro-user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="user-avatar-badge">
                    {user.name?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name-label">
                    {user.name || user.email}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="pro-user-popover">
                    <div className="popover-user-info">
                      <p className="popover-user-name">
                        {user.name || user.email}
                      </p>
                      <p className="popover-user-role">{user.role}</p>
                    </div>
                    <button
                      className="popover-menu-btn"
                      onClick={handleDashboardClick}
                    >
                      📊 Dashboard
                    </button>
                    <button
                      className="popover-menu-btn danger"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="pro-auth-group">
                <Link to="/login" className="pro-btn-login">
                  Login
                </Link>
                <Link to="/register" className="pro-btn-register">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button
            className={`pro-hamburger-btn ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMenuOpen && (
        <div className="pro-drawer-backdrop" onClick={closeMenu}>
          <div
            className="pro-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <img
                src="/images/RW_LOGO_Black_page-0001-removebg-preview.png"
                alt="Recruweb Logo"
                className="drawer-logo"
              />
              <button className="drawer-close-btn" onClick={closeMenu}>
                ✕
              </button>
            </div>

            <form className="drawer-search-box" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            <ul className="drawer-nav-list">
              {navLinks.map((link) => {
                const active = isActiveLink(link.path);
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={closeMenu}
                      className={active ? "drawer-link-active" : ""}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="drawer-auth-buttons">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="drawer-btn-outline"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="drawer-btn-solid"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button
                  className="drawer-btn-solid"
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX for Active Highlights & Floating Glassmorphism */}
      <style>{`
        .pro-nav-bar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pro-nav-bar::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #38bdf8, #67e8f9, #6366f1);
          background-size: 300% 100%;
          opacity: 0;
          transition: opacity 0.35s ease;
          animation: navGradientFlow 6s linear infinite;
        }

        .pro-nav-bar.scrolled::before {
          opacity: 0.9;
        }

        @keyframes navGradientFlow {
          0% { background-position: 0% 0; }
          100% { background-position: 300% 0; }
        }

        .pro-nav-bar.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
          border-bottom-color: rgba(203, 213, 225, 0.6);
        }

        .pro-nav-container {
          max-width: 1380px;
          margin: 0 auto;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .logo-image {
          height: 40px;
          width: auto;
          object-fit: contain;
          display: block;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            filter 0.35s ease;
        }

        .pro-nav-logo {
          border-radius: 14px;
          padding: 2px;
          transition: background 0.3s ease;
        }

        .pro-nav-logo:hover {
          background: radial-gradient(
            circle at 50% 50%,
            rgba(99, 102, 241, 0.1),
            transparent 70%
          );
        }

        .pro-nav-logo:hover .logo-image {
          transform: scale(1.08) rotate(-2deg);
          filter: drop-shadow(0 4px 14px rgba(99, 102, 241, 0.35));
        }

        /* Search Box */
        .pro-nav-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          padding: 8px 18px;
          border-radius: 40px;
          width: 250px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pro-nav-search:hover {
          border-color: #c7d2fe;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.1);
        }

        .pro-nav-search:focus-within {
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
          width: 280px;
        }

        .pro-nav-search svg {
          transition: transform 0.25s ease, stroke 0.25s ease;
        }

        .pro-nav-search:hover svg,
        .pro-nav-search:focus-within svg {
          transform: scale(1.12) rotate(-8deg);
          stroke: #4f46e5;
        }

        .pro-nav-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 13.5px;
          font-weight: 500;
          color: #0f172a;
          width: 100%;
        }

        .pro-nav-search input::placeholder {
          color: #94a3b8;
        }

        /* Nav Links */
        .pro-nav-menu {
          display: flex;
          align-items: center;
          gap: 24px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .pro-nav-item {
          position: relative;
        }

        .pro-nav-link {
          text-decoration: none;
          color: #334155;
          font-weight: 600;
          font-size: 14.5px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 4px;
          position: relative;
          transition: color 0.25s ease, transform 0.25s ease;
        }

        .pro-nav-link:hover {
          color: #4f46e5;
          transform: translateY(-1px);
        }

        /* Pretty animated underline that grows in from the center on hover */
        .pro-nav-link::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          right: 50%;
          height: 2.5px;
          border-radius: 2px;
          background: linear-gradient(90deg, #6366f1, #38bdf8);
          transition: left 0.28s cubic-bezier(0.16, 1, 0.3, 1),
            right 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pro-nav-link:hover::before {
          left: 4px;
          right: 4px;
        }

        /* Active Tab Highlight Indicator */
        .pro-nav-link.active-tab {
          color: #4f46e5;
          font-weight: 700;
        }

        .pro-nav-link.active-tab::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 4px;
          right: 4px;
          height: 2.5px;
          background: linear-gradient(90deg, #6366f1, #4f46e5);
          border-radius: 2px;
        }

        .pro-nav-link.active-tab::before {
          display: none;
        }

        .chevron-icon {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .pro-nav-item:hover .chevron-icon {
          transform: rotate(180deg) scale(1.1);
        }

        /* Mega Dropdown Popup */
        .pro-mega-menu {
          position: absolute;
          top: 100%;
          left: -15px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          border-radius: 20px;
          padding: 22px;
          min-width: 500px;
          z-index: 1050;
          animation: megaSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes megaSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pro-mega-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .pro-mega-header {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          display: block;
          margin-bottom: 12px;
        }

        .pro-mega-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          text-decoration: none;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          transition: background 0.25s ease, transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .pro-mega-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10%;
          bottom: 10%;
          width: 3px;
          border-radius: 3px;
          background: linear-gradient(180deg, #6366f1, #38bdf8);
          transform: scaleY(0);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pro-mega-item:hover {
          background: linear-gradient(90deg, #eef2ff, #f8fafc);
          transform: translateX(4px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.08);
        }

        .pro-mega-item:hover::before {
          transform: scaleY(1);
        }

        .item-icon {
          font-size: 18px;
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .pro-mega-item:hover .item-icon {
          transform: scale(1.22) rotate(-6deg);
        }

        .item-title {
          display: block;
          color: #0f172a;
          font-size: 13.5px;
          font-weight: 600;
        }

        .item-desc {
          display: block;
          color: #64748b;
          font-size: 11.5px;
        }

        .item-count-tag {
          margin-left: auto;
          background: #e0e7ff;
          color: #4338ca;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }

        /* Buttons Styling */
        .pro-auth-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pro-btn-login {
          text-decoration: none;
          color: #0f172a;
          font-weight: 700;
          font-size: 14px;
          padding: 9px 22px;
          border-radius: 30px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pro-btn-login:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f8fafc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .pro-btn-register {
          text-decoration: none;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          padding: 10px 24px;
          border-radius: 30px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          background-size: 200% 200%;
          background-position: 0% 50%;
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1),
            background-position 0.5s ease;
        }

        .pro-btn-register:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 10px 26px rgba(79, 70, 229, 0.42);
          background-position: 100% 50%;
        }

        /* User Profile Button */
        .pro-user-container {
          position: relative;
        }

        .pro-user-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          padding: 5px 16px 5px 6px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pro-user-btn:hover {
          border-color: #6366f1;
          background: #ffffff;
        }

        .user-avatar-badge {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .user-name-label {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
        }

        .pro-user-popover {
          position: absolute;
          top: 115%;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
          width: 190px;
          padding: 10px;
          z-index: 1050;
        }

        .popover-user-info {
          padding: 8px 10px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 6px;
        }

        .popover-user-name {
          margin: 0;
          font-weight: 700;
          font-size: 13px;
          color: #0f172a;
        }

        .popover-user-role {
          margin: 0;
          font-size: 11px;
          color: #64748b;
          text-transform: capitalize;
        }

        .popover-menu-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 9px 12px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.15s;
        }

        .popover-menu-btn:hover {
          background: #f8fafc;
        }

        .popover-menu-btn.danger {
          color: #ef4444;
        }

        /* Hamburger Button */
        .pro-hamburger-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .pro-hamburger-btn span {
          width: 24px;
          height: 2.5px;
          background: #0f172a;
          border-radius: 2px;
          transition: all 0.3s;
        }

        @media (max-width: 1024px) {
          .pro-nav-menu, .pro-nav-search {
            display: none;
          }

          .pro-hamburger-btn {
            display: flex;
          }
        }

        /* Mobile Drawer */
        .pro-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
        }

        .pro-drawer-content {
          width: 310px;
          background: #ffffff;
          height: 100%;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: -10px 0 30px rgba(0,0,0,0.15);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .drawer-logo {
          height: 36px;
        }

        .drawer-close-btn {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 16px;
          cursor: pointer;
        }

        .drawer-search-box {
          display: flex;
          gap: 8px;
        }

        .drawer-search-box input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
        }

        .drawer-search-box button {
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0 14px;
          font-weight: 600;
        }

        .drawer-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .drawer-nav-list a {
          text-decoration: none;
          color: #0f172a;
          font-weight: 600;
          font-size: 16px;
          display: block;
          padding: 4px 0;
        }

        .drawer-nav-list a.drawer-link-active {
          color: #4f46e5;
          font-weight: 700;
          border-left: 3px solid #4f46e5;
          padding-left: 10px;
        }

        .drawer-auth-buttons {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .drawer-btn-outline {
          text-align: center;
          padding: 12px;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          text-decoration: none;
          color: #0f172a;
          font-weight: 700;
        }

        .drawer-btn-solid {
          text-align: center;
          padding: 12px;
          background: #4f46e5;
          color: white;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          border: none;
        }
      `}</style>
    </>
  );
};

export default Navbar;