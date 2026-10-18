import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import "./sop-dashboard-card.css";

export default function SopDashboardCard() {
  const [sops, setSops] = useState([]);
  const location = useLocation();
  const portalBase = location.pathname.startsWith("/admin") ? "/admin" : location.pathname.startsWith("/candidate") ? "/candidate" : location.pathname.startsWith("/client") ? "/client" : location.pathname.startsWith("/hr-partner") ? "/hr-partner" : "";
  const [inbox, setInbox] = useState([]);

  useEffect(() => {
    Promise.all([api.sops.getAll(), api.sops.inbox()])
      .then(([s, i]) => {
        if (s?.success) setSops(s.data || []);
        if (i?.success) setInbox(i.data || []);
      })
      .catch(() => {});
  }, []);

  const pending = inbox.filter((x) => x.status === "pending").length;
  const published = sops.filter((x) => x.status === "published").length;

  return (
    <section className="sop-dash-card">
      <div className="sop-dash-copy">
        <span className="sop-dash-icon">📘</span>
        <div>
          <div className="sop-dash-kicker">POLICY CENTER</div>
          <h3>SOPs & Operating Procedures</h3>
          <p>Access every approved SOP, open the full process instantly, and keep your policy approvals in one place.</p>
        </div>
      </div>
      <div className="sop-dash-stats">
        <div><strong>{published}</strong><span>Live SOPs</span></div>
        <div><strong>{pending}</strong><span>Inbox actions</span></div>
      </div>
      <div className="sop-dash-actions">
        <Link to={`${portalBase}/sops`}>View all SOPs →</Link>
        <Link to={`${portalBase}/sop-inbox`}>Open SOP Inbox →</Link>
      </div>
    </section>
  );
}
