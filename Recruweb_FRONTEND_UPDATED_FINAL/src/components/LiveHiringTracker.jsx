import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../utils/socket";
import JoiningTrackerStepper from "./JoiningTrackerStepper";

const LiveHiringTracker = ({
  title = "Live Hiring Tracker",
  subtitle = "Real recruitment progress from the database. No sample or placeholder records are used.",
  load,
  emptyMessage = "No real candidate activity is available for this account yet.",
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await load();
      if (!res?.success) throw new Error(res?.message || "Tracker request failed");
      setRows(Array.isArray(res.data) ? res.data : []);
      setLastUpdated(res.generatedAt || new Date().toISOString());
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load live tracker");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 10000);
    const socket = getSocket();
    const onUpdate = () => refresh();
    socket?.on("tracker:update", onUpdate);
    return () => {
      window.clearInterval(timer);
      socket?.off("tracker:update", onUpdate);
    };
  }, [refresh]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const stage = row.pipelineStage || "New Lead";
        acc.total += 1;
        if (stage === "Joined" || stage === "Retained 90 Days") acc.joined += 1;
        if (stage === "Interview Scheduled" || row.submission?.status === "interview-scheduled") acc.interview += 1;
        if (stage === "Interview Cleared" || row.submission?.status === "interview-completed") acc.cleared += 1;
        if (row.isRejected) acc.rejected += 1;
        return acc;
      },
      { total: 0, joined: 0, interview: 0, cleared: 0, rejected: 0 },
    );
  }, [rows]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.live}>● LIVE DATABASE TRACKER</div>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>
        <div style={styles.updated}>
          {lastUpdated
            ? `Updated ${new Date(lastUpdated).toLocaleTimeString("en-IN")}`
            : "Syncing…"}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.stats}>
        {[
          ["Candidates", totals.total],
          ["Interview", totals.interview],
          ["Cleared", totals.cleared],
          ["Joined", totals.joined],
          ["Rejected", totals.rejected],
        ].map(([label, value]) => (
          <div key={label} style={styles.stat}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={styles.empty}>Loading live tracker…</div>
      ) : rows.length === 0 ? (
        <div style={styles.empty}>{emptyMessage}</div>
      ) : (
        <div style={styles.list}>
          {rows.map((row) => {
            const selected = selectedId === row.candidateId;
            return (
              <div key={`${row.candidateId}-${row.submission?.id || "candidate"}`} style={styles.card}>
                <button
                  type="button"
                  onClick={() => setSelectedId(selected ? null : row.candidateId)}
                  style={styles.rowButton}
                >
                  <div style={styles.identity}>
                    <strong>{row.name || "Unnamed candidate"}</strong>
                    <span>{row.candidateCode || `Candidate #${row.candidateId}`}</span>
                  </div>
                  <div style={styles.stage}>
                    <span>{row.pipelineStage}</span>
                    {row.submission?.status && <small>{row.submission.status}</small>}
                  </div>
                  <div style={styles.progress}>
                    <div style={styles.progressTrack}>
                      <div style={{ ...styles.progressFill, width: `${row.tracker?.progress?.percent || 0}%` }} />
                    </div>
                    <span>{row.tracker?.progress?.percent || 0}%</span>
                  </div>
                  <span style={styles.chevron}>{selected ? "▲" : "▼"}</span>
                </button>

                {selected && (
                  <div style={styles.details}>
                    <JoiningTrackerStepper tracker={row.tracker} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: 28, color: "#f8fafc", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 22 },
  live: { color: "#34d399", fontSize: 11, fontWeight: 800, letterSpacing: 1 },
  title: { margin: "6px 0", fontSize: 28, fontWeight: 900 },
  subtitle: { margin: 0, color: "#94a3b8", fontSize: 13 },
  updated: { color: "#64748b", fontSize: 11, paddingTop: 8 },
  error: { padding: 12, borderRadius: 10, background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.3)", color: "#fb7185", marginBottom: 16 },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 18 },
  stat: { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 },
  statStrong: {},
  empty: { padding: 32, borderRadius: 16, border: "1px dashed rgba(255,255,255,.12)", color: "#94a3b8", textAlign: "center" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  card: { background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, overflow: "hidden" },
  rowButton: { width: "100%", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 28px", gap: 16, alignItems: "center", padding: 16, background: "transparent", border: 0, color: "inherit", textAlign: "left", cursor: "pointer" },
  identity: { display: "flex", flexDirection: "column", gap: 4 },
  identitySpan: {},
  stage: { display: "flex", flexDirection: "column", gap: 3, color: "#c4b5fd", fontSize: 12, fontWeight: 700 },
  progress: { display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 11 },
  progressTrack: { height: 7, flex: 1, borderRadius: 10, background: "rgba(255,255,255,.08)", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#6366f1,#34d399)", borderRadius: 10 },
  chevron: { color: "#94a3b8" },
  details: { padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,.06)" },
};

export default LiveHiringTracker;
