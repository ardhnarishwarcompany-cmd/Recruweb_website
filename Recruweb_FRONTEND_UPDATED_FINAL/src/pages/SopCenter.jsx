import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api, getToken } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ScrollIndicator from "../components/ScrollIndicator";

const ROLES = [
  ["admin", "Admin"],
  ["superadmin", "Super Admin"],
  ["hr", "HR"],
  ["hr_manager", "HR Manager"],
  ["recruiter", "Recruiter"],
  ["recruitment_manager", "Recruitment Manager"],
  ["finance_manager", "Finance Manager"],
  ["client", "Client"],
  ["candidate", "Candidate"],
  ["developer", "Developer"],
  ["hr_partner", "HR Partner"],
];

const renderInline = (text) => {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
};

export function SopDocument({ content }) {
  const lines = String(content || "").replace(/\r/g, "").split("\n");
  return (
    <article className="sop-document" style={{ color: "#334155", lineHeight: "1.7", fontSize: "15px" }}>
      {lines.map((line, index) => {
        const t = line.trim();
        if (!t) return <div className="sop-spacer" key={index} style={{ height: "12px" }} />;
        if (t === "---") return <hr key={index} style={{ border: "0", borderTop: "1.5px solid #cbd5e1", margin: "20px 0" }} />;
        if (t.startsWith("### ")) return <h3 key={index} style={{ color: "#0f172a", fontWeight: "800", fontSize: "18px", margin: "16px 0 8px" }}>{renderInline(t.slice(4))}</h3>;
        if (t.startsWith("## ")) return <h2 key={index} style={{ color: "#0f172a", fontWeight: "800", fontSize: "21px", margin: "20px 0 10px" }}>{renderInline(t.slice(3))}</h2>;
        if (t.startsWith("# ")) return <h1 key={index} style={{ color: "#0f172a", fontWeight: "800", fontSize: "26px", margin: "24px 0 12px" }}>{renderInline(t.slice(2))}</h1>;
        if (t.startsWith("* ")) return <li key={index} style={{ margin: "6px 0", fontWeight: "600" }}>{renderInline(t.slice(2))}</li>;
        if (/^\d+\.\s/.test(t)) return <h2 key={index} style={{ color: "#0f172a", fontWeight: "800", fontSize: "19px", margin: "18px 0 8px" }}>{renderInline(t)}</h2>;
        return <p key={index} style={{ margin: "0 0 12px", fontWeight: "600" }}>{renderInline(t)}</p>;
      })}
    </article>
  );
}

function StatusPill({ status }) {
  const label = status === "pending_approval" ? "Pending Approval" : status;
  return <span className={`sop-status sop-status-${status}`}>{label.replaceAll("_", " ")}</span>;
}

function getPortalBase(pathname) {
  if (pathname.startsWith("/admin")) return "/admin";
  if (pathname.startsWith("/candidate")) return "/candidate";
  if (pathname.startsWith("/client")) return "/client";
  if (pathname.startsWith("/hr-partner")) return "/hr-partner";
  return "";
}

function gmailComposeUrl({ to = "", subject = "", body = "" }) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function SopCenter() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const portalBase = getPortalBase(location.pathname);

  const [sops, setSops] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [email, setEmail] = useState(null);
  const [inboxItem, setInboxItem] = useState(null);
  const [adminApprovalRequested, setAdminApprovalRequested] = useState(false);
  const [adminApprovalEmails, setAdminApprovalEmails] = useState([]);
  const [actionBusy, setActionBusy] = useState(false);

  const userRole = (user?.role || user?.roles?.[0] || "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(userRole);

  const [form, setForm] = useState({
    title: "", department: "", summary: "", version: "1.0",
    effectiveDate: "", content: "", targetRoles: ROLES.map(([v]) => v),
    publishNow: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = token ? await api.sops.getAll() : await api.sops.getPublic();
      if (res?.success) setSops(res.data || []);

      if (!id) {
        setSelected(null);
        setInboxItem(null);
        return;
      }

      const detail = token ? await api.sops.getById(id) : null;
      if (detail?.success) {
        setSelected(detail.data);
      } else {
        const found = (res?.data || []).find((x) => String(x.id) === String(id));
        setSelected(found || null);
      }

      if (token) {
        const inbox = await api.sops.inbox();
        const mine = (inbox?.success ? inbox.data : []).find(
          (item) => String(item.sopId) === String(id)
        );
        setInboxItem(mine || null);

        if (!isAdmin) {
          const requestStatus = await api.sops.requestApprovalStatus(id);
          setAdminApprovalRequested(
            !!(requestStatus?.success && requestStatus.data?.requested)
          );
        } else {
          setAdminApprovalRequested(false);
        }
      } else {
        setInboxItem(null);
        setAdminApprovalRequested(false);
      }
    } catch (error) {
      console.error("SOP load failed:", error);
      setInboxItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const counts = useMemo(() => ({
    published: sops.filter((s) => s.status === "published").length,
    pending: sops.filter((s) => s.status === "pending_approval").length,
    drafts: sops.filter((s) => s.status === "draft").length,
  }), [sops]);

  const openGmailDirect = (sop) => {
    const address = window.prompt("Recipient Gmail / email address:");
    if (!address) return;
    const mail = {
      to: address.trim(),
      subject: `Action Required: ${sop.title} v${sop.version}`,
      body: `Hello Team Member,\n\nA new Recruweb SOP is ready for your review.\n\nSOP: ${sop.title}\nDepartment: ${sop.department || "Company Policy"}\nVersion: ${sop.version}\n\nPlease open the SOP here:\n${window.location.origin}/#${portalBase || ""}/sops/${sop.id}\n\nRegards,\nRecruweb Resources Pvt. Ltd.`
    };
    window.open(gmailComposeUrl(mail), "_blank", "noopener,noreferrer");
  };

  const openEmailPreview = async (sop) => {
    const address = window.prompt("Recipient email address:");
    if (!address) return;
    const res = await api.sops.emailPreview(sop.id, {
      email: address.trim(),
      name: "Team Member",
    });
    if (res?.success) setEmail(res.data);
    else window.alert(res?.message || "Could not generate email.");
  };

  const requestAdminApproval = async () => {
    if (!selected || actionBusy || isAdmin) return;

    setActionBusy(true);
    try {
      const res = await api.sops.requestApproval(selected.id);
      if (!res?.success) {
        window.alert(res?.message || "Unable to send approval request to Admin.");
        return;
      }

      setAdminApprovalRequested(true);
      setAdminApprovalEmails(res.data?.adminEmails || []);

      const emails = res.data?.adminEmails || [];
      if (emails.length) {
        const openGmail = window.confirm(
          `${res.message || "Approval request sent."}\n\nOpen Gmail with the ready-made SOP approval template?`
        );
        if (openGmail) {
          const to = encodeURIComponent(emails.join(","));
          const approvalEmail = res.data?.approvalEmail || {
            subject: `SOP Approval Request: ${selected.title} v${selected.version}`,
            body: `Dear Sir/Madam,\n\nI have read and understood the ${selected.title} shared by Recruweb Resources Pvt. Ltd.\n\n${userRole === "candidate" ? "Candidate Name" : "Name"}: ${user?.name || "User"}\nAgreement: I Agree\nDate: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
          };

          window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodeURIComponent(approvalEmail.subject)}&body=${encodeURIComponent(approvalEmail.body)}`,
            "_blank",
            "noopener,noreferrer"
          );
        }
      } else {
        window.alert(res.message || "Approval request sent to Admin.");
      }
    } catch (error) {
      console.error("SOP admin approval request failed:", error);
      window.alert("Unable to send the SOP approval request.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleApproval = async (action) => {
    if (!selected || actionBusy) return;

    const note = action === "reject"
      ? window.prompt("Reason for rejection (optional):")
      : "";

    if (action === "reject" && note === null) return;

    setActionBusy(true);
    try {
      let res;

      if (inboxItem && ["pending", "later"].includes(inboxItem.status)) {
        res = await api.sops.inboxAction(inboxItem.id, action, note || "");
      } else if (isAdmin && action !== "later") {
        res = await api.sops.approve(selected.id, action, note || "");
      } else {
        window.alert("This SOP is not assigned to your approval inbox.");
        return;
      }

      if (!res?.success) {
        window.alert(res?.message || `Unable to ${action} SOP.`);
        return;
      }

      await load();
      window.alert(
        action === "approve"
          ? "SOP approved successfully."
          : action === "later"
            ? "SOP saved for later."
            : "SOP rejected."
      );
    } catch (error) {
      console.error("SOP approval failed:", error);
      window.alert("Unable to update the SOP approval status.");
    } finally {
      setActionBusy(false);
    }
  };

  const createSop = async (e) => {
    e.preventDefault();
    const res = await api.sops.create(form);
    if (!res?.success) {
      return window.alert(res?.message || "Unable to create SOP.");
    }

    setShowNew(false);
    setForm({
      title: "", department: "", summary: "", version: "1.0",
      effectiveDate: "", content: "", targetRoles: ROLES.map(([v]) => v),
      publishNow: false,
    });

    await load();
    navigate(`${portalBase}/sops/${res.data.id}`);
  };

  if (loading) {
    return (
      <div className="sop-shell-light">
        <div className="sop-loading" style={{ textAlign: "center", padding: "80px", fontWeight: "800", color: "#64748b" }}>Loading SOP Center…</div>
      </div>
    );
  }

  if (selected) {
    const canActOnInbox = inboxItem && ["pending", "later"].includes(inboxItem.status);
    const canAdminApprove = isAdmin && !inboxItem && selected.status !== "published";

    return (
      <div className="sop-shell-light">
        {/* Live Particles Background */}
        <div className="sop-particles-container">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="sop-particle"
              style={{
                left: `${(i * 7.5) % 100}%`,
                animationDelay: `${(i * 0.4) % 5}s`,
                animationDuration: `${12 + (i % 6)}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '40px 0 80px' }}>
          <div className="sop-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button
              className="cv-action-btn secondary"
              onClick={() => navigate(portalBase ? `${portalBase}/sops` : "/sops")}
            >
              ← SOP Library
            </button>

            <div className="sop-topbar-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {getToken() && (
                <Link className="cv-action-btn secondary" to={`${portalBase}/sop-inbox`} style={{ textDecoration: 'none' }}>
                  📨 SOP Approval Inbox
                </Link>
              )}
              {isAdmin && <StatusPill status={selected.status} />}
              {inboxItem && <StatusPill status={inboxItem.status} />}
            </div>
          </div>

          <div className="sop-detail-head-3d">
            <div className="card-bg-light-glow"></div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="sop-eyebrow" style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '6px' }}>
                {selected.department || "Company Policy"} · v{selected.version}
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{selected.title}</h1>
              <p style={{ fontSize: '14.5px', color: '#475569', fontWeight: '600', margin: 0, maxWidth: '700px' }}>{selected.summary}</p>
            </div>

            <div className="sop-detail-actions" style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
              {!isAdmin && selected.status === "published" && (
                adminApprovalRequested ? (
                  <>
                    <button className="cv-action-btn secondary" disabled style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                      ✓ Approval Request Sent
                    </button>
                    {adminApprovalEmails.length > 0 && (
                      <button
                        className="cv-action-btn primary glow-btn"
                        disabled={actionBusy}
                        onClick={() => {
                          const to = encodeURIComponent(adminApprovalEmails.join(","));
                          const subject = encodeURIComponent(`SOP Approval Request: ${selected.title} v${selected.version}`);
                          const body = encodeURIComponent(`Dear Sir/Madam,\n\nI have read and understood the ${selected.title} shared by Recruweb Resources Pvt. Ltd.\n\nName: ${user?.name || "User"}\nAgreement: I Agree\nDate: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`);
                          window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`, "_blank", "noopener,noreferrer");
                        }}
                      >
                        ↗ Email Admin in Gmail
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className="cv-action-btn primary glow-btn"
                    disabled={actionBusy}
                    onClick={requestAdminApproval}
                  >
                    📩 Send Approval Request to Admin
                  </button>
                )
              )}

              {canActOnInbox && (
                <>
                  <button className="cv-action-btn primary glow-btn" style={{ background: '#10b981', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }} disabled={actionBusy} onClick={() => handleApproval("approve")}>✓ Approve SOP</button>
                  <button className="cv-action-btn secondary" disabled={actionBusy} onClick={() => handleApproval("later")}>⏰ Approve Later</button>
                  <button className="cv-action-btn secondary" style={{ background: '#fee2e2', color: '#ef4444', borderColor: '#fca5a5' }} disabled={actionBusy} onClick={() => handleApproval("reject")}>✕ Reject</button>
                </>
              )}

              {canAdminApprove && (
                <>
                  <button className="cv-action-btn primary glow-btn" style={{ background: '#10b981' }} disabled={actionBusy} onClick={() => handleApproval("approve")}>✓ Approve & Publish</button>
                  <button className="cv-action-btn secondary" style={{ background: '#fee2e2', color: '#ef4444', borderColor: '#fca5a5' }} disabled={actionBusy} onClick={() => handleApproval("reject")}>✕ Reject</button>
                </>
              )}

              {isAdmin && (
                <>
                  <button className="cv-action-btn secondary" onClick={() => openEmailPreview(selected)}>✉️ Preview Email</button>
                  <button className="cv-action-btn primary glow-btn" onClick={() => openGmailDirect(selected)}>↗ Open Gmail</button>
                </>
              )}
            </div>
            <div className="card-glow-bar"></div>
          </div>

          <div className="sop-document-container-3d" style={{ position: 'relative', zIndex: 1 }}>
            <div className="card-bg-light-glow"></div>
            <SopDocument content={selected.content} />
            <div className="card-glow-bar"></div>
          </div>
        </div>

        {email && (
          <div className="sop-modal-backdrop" onClick={() => setEmail(null)}>
            <div className="sop-modal-3d" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', padding: '36px', borderRadius: '24px', border: '1.5px solid #cbd5e1', maxWidth: '650px', width: '100%', position: 'relative' }}>
              <div className="card-bg-light-glow"></div>
              <div className="sop-modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Generated SOP Email</h2>
                <button onClick={() => setEmail(null)} style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: '800', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 2 }}>
                <label style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                  To
                  <input value={email.to || ""} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600' }} />
                </label>

                <label style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                  Subject
                  <input value={email.subject || ""} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600' }} />
                </label>

                <label style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                  Message
                  <textarea value={email.body || ""} readOnly rows={10} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600', fontFamily: 'inherit' }} />
                </label>
              </div>

              <div className="sop-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', position: 'relative', zIndex: 2 }}>
                <button className="cv-action-btn secondary" onClick={() => navigator.clipboard?.writeText(email.body || "")}>Copy Email</button>
                <button className="cv-action-btn primary glow-btn" onClick={() => openGmailFromPreview(email)}>↗ Open Gmail</button>
              </div>
              <div className="card-glow-bar"></div>
            </div>
          </div>
        )}

        <style>{`
          .sop-shell-light {
            background: #f8fafc;
            color: #0f172a;
            min-height: 100vh;
            font-family: var(--font-body);
            position: relative;
            overflow-x: clip;
            overflow-anchor: none;
            isolation: isolate;
            contain: layout paint style;
          }

          /* Keep the browser scrollbar width stable on the SOP route.
             This prevents the scrollbar from blinking when animated layers repaint. */
          html:has(.sop-shell-light) {
            scrollbar-gutter: stable;
          }
          body:has(.sop-shell-light) {
            overflow-y: scroll;
          }
          .container {
            max-width: 1150px;
            margin: 0 auto;
            padding: 0 24px;
          }
          .sop-particles-container {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            contain: strict;
            transform: translateZ(0);
          }
          .sop-particle {
            position: absolute;
            width: 6px;
            height: 6px;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            border-radius: 50%;
            opacity: 0.6;
            animation: floatSopParticle linear infinite;
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
            will-change: transform, opacity;
            backface-visibility: hidden;
          }
          @keyframes floatSopParticle {
            0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
            20% { opacity: 0.7; }
            80% { opacity: 0.7; }
            100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
          }
          .sop-detail-head-3d, .sop-document-container-3d, .sop-card-3d, .sop-stat-card-3d {
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
          .sop-detail-head-3d:hover, .sop-document-container-3d:hover, .sop-card-3d:hover, .sop-stat-card-3d:hover {
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
            padding: 10px 18px;
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
          .sop-detail-head-3d:hover .card-glow-bar,
          .sop-document-container-3d:hover .card-glow-bar,
          .sop-card-3d:hover .card-glow-bar,
          .sop-stat-card-3d:hover .card-glow-bar {
            transform: scaleX(1);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sop-shell-light">
      {/* Live Particles Background */}
      <div className="sop-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="sop-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '50px 0 80px' }}>
        <div className="sop-hero-3d" style={{ marginBottom: '30px', padding: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="sop-eyebrow" style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '6px' }}>RECRUWEB · POLICY HUB</div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>SOP & Policy Center</h1>
            <p style={{ fontSize: '15px', color: '#475569', fontWeight: '600', margin: 0, maxWidth: '650px' }}>
              One connected source of truth for every operating procedure. Open any SOP, review the full process, and act directly from your portal.
            </p>
          </div>

          {isAdmin && (
            <button className="cv-action-btn primary glow-btn" onClick={() => setShowNew(true)} style={{ position: 'relative', zIndex: 2 }}>
              ＋ New SOP
            </button>
          )}
          <div className="card-glow-bar"></div>
        </div>

        <div className="sop-stats-grid-3d" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div className="sop-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <strong style={{ position: 'relative', zIndex: 2 }}>{counts.published}</strong>
            <span style={{ position: 'relative', zIndex: 2 }}>Published SOPs</span>
            <div className="card-glow-bar"></div>
          </div>
          <div className="sop-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <strong style={{ position: 'relative', zIndex: 2 }}>{counts.pending}</strong>
            <span style={{ position: 'relative', zIndex: 2 }}>Awaiting approval</span>
            <div className="card-glow-bar"></div>
          </div>
          <div className="sop-stat-card-3d">
            <div className="card-bg-light-glow"></div>
            <strong style={{ position: 'relative', zIndex: 2 }}>{counts.drafts}</strong>
            <span style={{ position: 'relative', zIndex: 2 }}>Drafts</span>
            <div className="card-glow-bar"></div>
          </div>
        </div>

        <div className="sop-grid-3d" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '22px' }}>
          {sops.map((sop) => (
            <Link
              className="sop-card-3d"
              to={`${portalBase}/sops/${sop.id}`}
              key={sop.id}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', padding: '28px' }}
            >
              <div className="card-bg-light-glow"></div>
              <div className="sop-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: '24px' }}>📘</span>
                {isAdmin && <StatusPill status={sop.status} />}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px', position: 'relative', zIndex: 2 }}>{sop.title}</h2>
              <div className="sop-meta" style={{ fontSize: '12.5px', fontWeight: '800', color: '#4f46e5', marginBottom: '10px', position: 'relative', zIndex: 2 }}>
                {sop.department || "Company-wide"} · v{sop.version}
              </div>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px', fontWeight: '600', position: 'relative', zIndex: 2, flex: 1 }}>{sop.summary}</p>
              <span className="sop-read" style={{ fontSize: '13.5px', fontWeight: '800', color: '#4f46e5', position: 'relative', zIndex: 2 }}>Open full SOP →</span>
              <div className="card-glow-bar"></div>
            </Link>
          ))}
        </div>

        {!sops.length && (
          <div className="sop-empty" style={{ textAlign: 'center', padding: '60px', background: '#ffffff', borderRadius: '20px', border: '1.5px solid #cbd5e1', fontWeight: '700', color: '#64748b' }}>No published SOPs are available yet.</div>
        )}

        {showNew && (
          <div
            className="sop-modal-backdrop"
            onClick={() => setShowNew(false)}
          >
            <form
              className="sop-form-3d"
              onSubmit={createSop}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#ffffff', padding: '36px', borderRadius: '24px', border: '1.5px solid #cbd5e1', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
              <div className="card-bg-light-glow"></div>
              <div className="sop-modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Create New SOP</h2>
                <button type="button" onClick={() => setShowNew(false)} style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: '800', cursor: 'pointer' }}>×</button>
              </div>

              <div className="sop-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', position: 'relative', zIndex: 2, fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                <label>
                  Title
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600' }}
                  />
                </label>
                <label>
                  Department
                  <input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600' }}
                  />
                </label>
                <label>
                  Version
                  <input
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600' }}
                  />
                </label>
                <label>
                  Effective date
                  <input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 2, fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '16px' }}>
                <label>
                  Short summary
                  <textarea
                    rows="2"
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600', fontFamily: 'inherit' }}
                  />
                </label>

                <label>
                  SOP content
                  <textarea
                    required
                    rows="10"
                    placeholder={"# 1. Purpose\n\nWrite the complete SOP here…"}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginTop: '4px', background: '#f8fafc', fontWeight: '600', fontFamily: 'inherit' }}
                  />
                </label>
              </div>

              <div className="sop-role-picker" style={{ position: 'relative', zIndex: 2, marginBottom: '16px', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                <b style={{ display: 'block', marginBottom: '8px' }}>Visible / approval audience</b>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {ROLES.map(([value, label]) => (
                    <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <input
                        type="checkbox"
                        checked={form.targetRoles.includes(value)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            targetRoles: e.target.checked
                              ? [...form.targetRoles, value]
                              : form.targetRoles.filter((r) => r !== value),
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <label className="sop-check" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.publishNow}
                  onChange={(e) => setForm({ ...form, publishNow: e.target.checked })}
                />
                Publish immediately (otherwise create approval emails + internal inbox tasks)
              </label>

              <div className="sop-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', position: 'relative', zIndex: 2 }}>
                <button type="button" className="cv-action-btn secondary" onClick={() => setShowNew(false)}>
                  Cancel
                </button>
                <button className="cv-action-btn primary glow-btn">Create SOP</button>
              </div>
              <div className="card-glow-bar"></div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .sop-shell-light {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow-x: clip;
          overflow-anchor: none;
          isolation: isolate;
          contain: layout paint style;
        }

        /* Stable scrollbar: prevents blink/flicker while SOP particles animate */
        html:has(.sop-shell-light) {
          scrollbar-gutter: stable;
        }
        body:has(.sop-shell-light) {
          overflow-y: scroll;
        }

        .container {
          max-width: 1150px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .sop-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          contain: strict;
          transform: translateZ(0);
        }

        .sop-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatSopParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        @keyframes floatSopParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        .sop-hero-3d, .sop-detail-head-3d, .sop-document-container-3d, .sop-card-3d, .sop-stat-card-3d {
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

        .sop-hero-3d:hover, .sop-detail-head-3d:hover, .sop-document-container-3d:hover, .sop-card-3d:hover, .sop-stat-card-3d:hover {
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
          padding: 10px 18px;
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

        .sop-hero-3d:hover .card-glow-bar,
        .sop-detail-head-3d:hover .card-glow-bar,
        .sop-document-container-3d:hover .card-glow-bar,
        .sop-card-3d:hover .card-glow-bar,
        .sop-stat-card-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        .sop-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        @media (max-width: 1024px) {
          .sop-stats-grid-3d, .sop-grid-3d {
            grid-template-columns: 1fr;
          }
          .sop-hero-3d, .sop-detail-head-3d {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}