import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const fmtMoney = (n) =>
  n === undefined || n === null
    ? "—"
    : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const Card = ({ label, value, color }) => (
  <div className="cand-stat-card-3d">
    <div className="card-bg-light-glow"></div>
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div className="stat-lbl">{label}</div>
      <div className="stat-val" style={{ color: color || "#0f172a" }}>
        {value}
      </div>
    </div>
    <div
      className="card-glow-bar"
      style={{ background: color || "#0284c7" }}
    ></div>
  </div>
);

export default function AdminFinance() {
  const [summary, setSummary] = useState(null);
  const [groupBy, setGroupBy] = useState("month");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (gb = groupBy) => {
    setLoading(true);
    const [sumRes, repRes] = await Promise.all([
      api.finance.getSummary(),
      api.finance.getRevenueReport({ groupBy: gb }),
    ]);
    if (sumRes?.success) setSummary(sumRes.data);
    if (repRes?.success) setReport(repRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load(groupBy);
  }, [groupBy]);

  return (
    <div className="light-fin-container">
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
      <div className="fin-marquee-banner">
        <div className="fin-marquee-track">
          <span>✨ Recruweb Enterprise Finance Dashboard &amp; Revenue Reports</span>
          <span>•</span>
          <span>📊 Live Figures Computed from Real Invoices &amp; Payments</span>
          <span>•</span>
          <span>⭐ GST, TDS, Collections &amp; Financial Analytics</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Finance Dashboard{" "}
            <span className="gradient-text">— Revenue &amp; Reports</span>
          </h1>
          <p className="cand-subtitle">
            Live figures computed from real invoices &amp; payments — Invoices, GST, TDS, Collections.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Summary Stat Cards Grid */}
      {summary && (
        <div className="client-stats-grid" style={{ position: 'relative', zIndex: 2 }}>
          <Card
            label="Total Invoiced"
            value={fmtMoney(summary.totalInvoiced)}
            color="#0284c7"
          />
          <Card
            label="Total Collected"
            value={fmtMoney(summary.totalCollected)}
            color="#059669"
          />
          <Card
            label="Outstanding Balance"
            value={fmtMoney(summary.totalOutstanding)}
            color="#dc2626"
          />
          <Card
            label="GST Collected"
            value={fmtMoney(summary.totalGstCollected)}
            color="#6366f1"
          />
          <Card
            label="TDS Deducted"
            value={fmtMoney(summary.totalTdsDeducted)}
            color="#d97706"
          />
          <Card
            label="Total Invoices"
            value={summary.invoiceCount}
            color="#0f172a"
          />
          <Card
            label="Paid Invoices"
            value={summary.paidCount}
            color="#059669"
          />
          <Card
            label="Overdue Invoices"
            value={summary.overdueCount}
            color="#dc2626"
          />
        </div>
      )}

      {/* Toolbar & Grouping Filter */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div className="card-bg-light-glow"></div>
        <h2 className="toolbar-heading" style={{ position: 'relative', zIndex: 2, fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>📈 Revenue Report Breakdown</h2>
        <div className="filter-select-wrap" style={{ position: 'relative', zIndex: 2, display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "0 16px", borderRadius: "12px" }}>
          <span className="filter-icon">📌</span>
          <select
            className="fin-select-dark"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="month">By Month</option>
            <option value="client">By Client Account</option>
            <option value="status">By Status</option>
          </select>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Live financial analysis */}
      <div className="client-grid-2" style={{ position: "relative", zIndex: 2, marginBottom: "24px" }}>
        <div className="cand-card-3d" style={{ minHeight: "280px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: "900" }}>📈 Invoiced vs Collected</h3>
            {report.length ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={report.slice(-12)}>
                  <XAxis dataKey={groupBy === "month" ? "month" : groupBy === "client" ? "clientId" : "status"} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="invoiced" name="Invoiced" fill="#0284c7" radius={[6,6,0,0]} />
                  <Bar dataKey="collected" name="Collected" fill="#059669" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="cand-empty-state">No financial rows available to chart.</div>}
          </div>
        </div>
        <div className="cand-card-3d" style={{ minHeight: "280px" }}>
          <div className="card-bg-light-glow"></div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: "900" }}>🥧 Collection Coverage</h3>
            {summary ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Collected", value: Number(summary.totalCollected || 0) },
                      { name: "Outstanding", value: Number(summary.totalOutstanding || 0) },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    <Cell fill="#059669" />
                    <Cell fill="#dc2626" />
                  </Pie>
                  <Tooltip formatter={(v) => fmtMoney(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="cand-empty-state">Loading collection analysis…</div>}
          </div>
        </div>
      </div>

      {/* Glass Panel Table Area */}
      <div className="cand-card-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cand-loading-state">
              <span className="cand-loader"></span> Loading revenue report...
            </div>
          ) : !report.length ? (
            <div className="cand-empty-state">
              No invoices found for this grouping yet.
            </div>
          ) : (
            <div className="cand-table-wrap">
              <table className="cand-light-table">
                <thead>
                  <tr>
                    <th>
                      {groupBy === "month"
                        ? "Month"
                        : groupBy === "client"
                          ? "Client Account"
                          : "Status"}
                    </th>
                    <th>Invoiced Amount</th>
                    <th>Collected Amount</th>
                    {groupBy !== "status" && <th>Outstanding Balance</th>}
                    {groupBy === "month" && (
                      <>
                        <th>GST Collected</th>
                        <th>TDS Deducted</th>
                      </>
                    )}
                    <th>Invoice Count</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((row, idx) => (
                    <tr key={idx} className="table-row-hover">
                      <td>
                        <strong style={{ color: "#0f172a", fontWeight: "900" }}>
                          {groupBy === "month"
                            ? row.month
                            : groupBy === "client"
                              ? row.client?.name || `Client #${row.clientId}`
                              : row.status}
                        </strong>
                      </td>
                      <td style={{ color: "#334155", fontWeight: "700" }}>{fmtMoney(row.invoiced)}</td>
                      <td>
                        <span style={{ color: "#059669", fontWeight: "900" }}>
                          {fmtMoney(row.collected)}
                        </span>
                      </td>
                      {groupBy !== "status" && (
                        <td>
                          <span
                            style={{
                              color:
                                Number(row.outstanding) > 0
                                  ? "#dc2626"
                                  : "#059669",
                              fontWeight: "900",
                            }}
                          >
                            {fmtMoney(row.outstanding)}
                          </span>
                        </td>
                      )}
                      {groupBy === "month" && (
                        <>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{fmtMoney(row.gst)}</td>
                          <td style={{ color: "#334155", fontWeight: "700" }}>{fmtMoney(row.tds)}</td>
                        </>
                      )}
                      <td>
                        <span className="invoice-count-pill">
                          {row.invoiceCount}
                        </span>
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
        .light-fin-container {
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
        .fin-marquee-banner {
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

        .fin-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .fin-marquee-track span {
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

        .client-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .cand-stat-card-3d {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 20px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-stat-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .stat-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-val {
          font-size: 22px;
          font-weight: 900;
        }

        .fin-select-dark {
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

        .invoice-count-pill {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 11.5px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1.5px solid #bae6fd;
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
      `}</style>
    </div>
  );
}