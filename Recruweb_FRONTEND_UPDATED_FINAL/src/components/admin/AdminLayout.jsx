import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { api, getToken } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import recruwebLogo from "../../assets/recruweb-logo.png";

// Grouped Navigation Items for Better Organization
const navGroups = [
  {
    title: "Core",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/admin/ats", label: "Candidate Pipeline (ATS)", icon: "🎯" },
      { to: "/admin/hiring-tracker", label: "Live Hiring Tracker", icon: "📍" },
      { to: "/admin/candidates", label: "Applied Candidates", icon: "👥" },
      { to: "/admin/joining-forms", label: "New Joiners", icon: "📋" },
    ],
  },
  {
    title: "Operations & CRM",
    items: [
      { to: "/admin/client-inquiries", label: "Client Inquiries", icon: "💬" },
      { to: "/admin/crm/clients", label: "Clients (CRM)", icon: "🤝" },
      { to: "/admin/crm/companies", label: "Companies (CRM)", icon: "🏢" },
      { to: "/admin/leads", label: "Leads Dashboard", icon: "📈" },
      { to: "/admin/contacts", label: "Contact Messages", icon: "✉️" },
      { to: "/admin/jobs", label: "Jobs Management", icon: "💼" },
      { to: "/admin/tasks", label: "Tasks & Reminders", icon: "⏳" },
      { to: "/admin/interview-tasks", label: "Interview Projects", icon: "🧩" },
      {
        to: "/admin/recruiter-workspace",
        label: "Recruiter Workspace",
        icon: "🖥️",
      },
      {
        to: "/admin/candidate-submissions",
        label: "Client Submissions",
        icon: "📄",
      },
      {
        to: "/admin/employee-verification",
        label: "Employee Verification",
        icon: "🪪",
      },
      {
        to: "/admin/hr-partners",
        label: "HR Partners",
        icon: "🤝",
      },
      {
        to: "/admin/kyc",
        label: "KYC Review",
        icon: "📑",
      },
      {
        to: "/admin/support-tickets",
        label: "Support Tickets",
        icon: "🎫",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/admin/invoices", label: "Invoices", icon: "🧾" },
      { to: "/admin/finance", label: "Finance Dashboard", icon: "💰" },
      
    ],
  },
  {
    title: "AI & Productivity",
    items: [
      { to: "/admin/automation", label: "Automation", icon: "⚡" },
      { to: "/admin/resource-center", label: "Resource Center", icon: "📚" },
      { to: "/admin/proposals", label: "Proposal Studio", icon: "📑" },
      { to: "/admin/sops", label: "SOP & Policy Center", icon: "📘" },
      { to: "/admin/sop-inbox", label: "SOP Approval Inbox", icon: "📨" },
      { to: "/admin/client-chat", label: "Client Chat", icon: "💭" },
      { to: "/admin/candidate-chat", label: "Candidate Chat", icon: "💬" },
      { to: "/admin/hr-support-chat", label: "HR Support Chat", icon: "🛟" },
    ],
  },
];

const superAdminNavItems = [
  { to: "/admin/ceo-dashboard", label: "CEO Dashboard", icon: "👑" },
  { to: "/admin/users", label: "User Management", icon: "👤" },
  { to: "/admin/branches", label: "Branch Management", icon: "🏛️" },
  { to: "/admin/settings", label: "System Settings", icon: "⚙️" },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: "📜" },
  { to: "/admin/backups", label: "Backup System", icon: "💾" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const token = getToken();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    authLogout();
    navigate("/login");
  };

  const isSuperAdminArea =
    !loadingUser &&
    user &&
    (user.role === "superadmin" || user.roles?.includes("superadmin"));

  return (
    <div className="modern-admin-shell hybrid-admin-layout">
      {/* Live Floating Particles Background for Main Content */}
      <div className="layout-particles-container">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="layout-particle"
            style={{
              left: `${(i * 8.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Deep Dark Rich Sidebar */}
      <aside className={`modern-admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Ambient Glow Orbs */}
        <div className="sb-orb sb-orb-1"></div>
        <div className="sb-orb sb-orb-2"></div>

        {/* Brand Header with Recruweb Logo */}
        <div className="admin-brand-header">
          <div className="admin-brand-logo-wrap">
            <img
              src={recruwebLogo}
              alt="Recruweb Logo"
              className="admin-brand-logo"
            />
          </div>
          <div className="admin-brand-text">
            <span>Recruweb</span>
            <span className="badge-admin">Admin</span>
          </div>
        </div>

        {/* Grouped Sidebar Navigation */}
        <nav className="admin-nav-container">
          {navGroups.map((group, idx) => (
            <div key={idx} className="nav-group-section">
              <div className="nav-group-title">
                <span className="title-line"></span>
                {group.title}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `admin-gl-link${isActive ? " active" : ""}`
                  }
                >
                  <span className="active-bar"></span>
                  <span className="link-icon-wrap">
                    <span className="link-icon">{item.icon}</span>
                  </span>
                  <span className="link-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}

          {isSuperAdminArea && (
            <div className="nav-group-section super-admin-group">
              <div className="nav-group-title super-admin-title">
                <span className="title-line super"></span>
                Super Admin
              </div>
              {superAdminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `admin-gl-link super-link${isActive ? " active" : ""}`
                  }
                >
                  <span className="active-bar"></span>
                  <span className="link-icon-wrap super-icon-wrap">
                    <span className="link-icon">{item.icon}</span>
                  </span>
                  <span className="link-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* User Badge & Logout Section */}
        <div className="admin-sidebar-footer">
          {user && (
            <div className="admin-profile-badge">
              <div className="profile-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                <span className="avatar-status-dot"></span>
              </div>
              <div className="profile-info">
                <div className="profile-name">{user.name || "Admin User"}</div>
                <div className="profile-role">
                  {(user.role || user.roles?.[0] || "User").replace(/_/g, " ")}
                </div>
              </div>
            </div>
          )}

          <button className="admin-gl-logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="modern-admin-main">
        {/* Mobile Header Bar */}
        <div className="mobile-top-bar">
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="mobile-brand-title">Recruweb Admin</div>
        </div>

        <div className="main-content-scroll">
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* Embedded Hybrid CSS */}
      <style>{`
        .modern-admin-shell.hybrid-admin-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: #f8fafc;
          color: #0f172a;
          font-family: var(--font-body);
          overflow: hidden;
          position: relative;
        }

        /* Floating Particles Background for Main Content */
        .layout-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .layout-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.4;
          animation: floatLayoutParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }

        @keyframes floatLayoutParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Deep Rich Dark Sidebar */
        .modern-admin-sidebar {
          position: relative;
          width: 284px;
          min-width: 284px;
          height: 100%;
          background: #05070c;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 15px 0 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: left 0.3s ease;
          overflow: hidden;
        }

        .sb-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          opacity: 0.45;
          z-index: 0;
        }

        .sb-orb-1 {
          width: 260px;
          height: 260px;
          top: -80px;
          left: -90px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%);
        }

        .sb-orb-2 {
          width: 240px;
          height: 240px;
          bottom: -60px;
          right: -100px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
        }

        .admin-brand-header {
          position: relative;
          z-index: 1;
          padding: 24px 20px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent);
        }

        .admin-brand-logo-wrap {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.18));
          border: 1px solid rgba(255, 255, 255, 0.12);
          flex-shrink: 0;
        }

        .admin-brand-logo {
          height: 28px;
          width: auto;
          object-fit: contain;
        }

        .admin-brand-text {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.5px;
        }

        .badge-admin {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 8px;
          letter-spacing: 0.5px;
        }

        .admin-nav-container {
          position: relative;
          z-index: 1;
          flex: 1;
          min-height: 0;
          min-width: 0;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-gutter: stable;
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .admin-nav-container::-webkit-scrollbar {
          width: 5px;
        }
        .admin-nav-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-nav-container::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #a855f7);
          border-radius: 10px;
        }

        .nav-group-section {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .nav-group-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 1.4px;
          padding: 0 10px 8px;
        }

        .title-line {
          width: 12px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          flex-shrink: 0;
        }

        .title-line.super {
          background: linear-gradient(90deg, #c084fc, #ec4899);
        }

        .nav-group-title.super-admin-title {
          color: #c084fc;
        }

        .admin-gl-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 14px 9px 12px;
          margin: 1px 0;
          border-radius: 12px;
          color: #94a3b8;
          font-size: 13.3px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.22s ease;
          border: 1px solid transparent;
          overflow: hidden;
        }

        .active-bar {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 3px;
          height: 60%;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, #818cf8, #c084fc);
          transition: transform 0.25s ease;
        }

        .admin-gl-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(2px);
        }

        .admin-gl-link.active {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(168, 85, 247, 0.25));
          border-color: rgba(129, 140, 248, 0.45);
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.25);
        }

        .admin-gl-link.active .active-bar {
          transform: translateY(-50%) scaleY(1);
        }

        .link-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
          transition: all 0.22s ease;
        }

        .admin-gl-link.active .link-icon-wrap {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .link-icon {
          font-size: 14.5px;
          flex-shrink: 0;
          line-height: 1;
        }

        .link-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-sidebar-footer {
          position: relative;
          z-index: 1;
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(5, 7, 12, 0.9);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .admin-profile-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 14px;
        }

        .profile-avatar {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #ffffff;
          font-weight: 800;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-status-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #34d399;
          border: 2px solid #05070c;
        }

        .profile-info {
          overflow: hidden;
        }

        .profile-name {
          font-size: 13.5px;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-role {
          font-size: 11px;
          color: #c084fc;
          font-weight: 700;
          text-transform: capitalize;
        }

        .admin-gl-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-gl-logout-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          color: #ffffff;
          border-color: rgba(239, 68, 68, 0.5);
          transform: translateY(-1px);
        }

        /* Main Content Viewport */
        .modern-admin-main {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: transparent;
        }

        .main-content-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-gutter: stable;
          padding: 32px 3vw;
        }

        .main-content-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .main-content-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .mobile-top-bar {
          display: none;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          background: #ffffff;
          border-bottom: 1.5px solid #cbd5e1;
        }

        .mobile-menu-toggle {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          font-size: 20px;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .mobile-brand-title {
          font-weight: 900;
          font-size: 16px;
          color: #0f172a;
        }

        .sidebar-backdrop {
          display: none;
        }

        @media (max-width: 1024px) {
          .mobile-top-bar {
            display: flex;
          }

          .modern-admin-sidebar {
            position: fixed;
            top: 0;
            left: -300px;
            bottom: 0;
            box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
          }

          .modern-admin-sidebar.open {
            left: 0;
          }

          .sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            z-index: 90;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;