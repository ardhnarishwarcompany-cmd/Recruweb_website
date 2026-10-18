import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import "./sop.css";

export default function SopQuickBar({ basePath = "/admin" }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    api.sops.getStats().then((res) => {
      if (active && res?.success) setStats(res.data);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="sop-quickbar">
      <div>
        <div className="sop-quick-kicker">POLICY & PROCESS</div>
        <strong>SOP Center</strong>
        <span>Centralized procedures, versions and acknowledgement workflow.</span>
      </div>
      <div className="sop-quick-stats">
        <span><b>{stats?.total ?? "—"}</b> SOPs</span>
        <span><b>{stats?.pending ?? "—"}</b> Pending</span>
        <span><b>{stats?.approved ?? "—"}</b> Approved</span>
      </div>
      <div className="sop-quick-actions">
        <Link to={`${basePath}/sops`} className="sop-btn sop-btn-primary">📚 Open SOPs</Link>
        <Link to={`${basePath}/sop-inbox`} className="sop-btn sop-btn-secondary">📨 Inbox</Link>
      </div>
    </div>
  );
}
