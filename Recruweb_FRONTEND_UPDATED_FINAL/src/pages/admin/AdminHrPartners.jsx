import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { api, API_URL } from "../../utils/api";
import ScrollIndicator from "../../components/ScrollIndicator";

const STATUS_META = {
  pending: {
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fde68a",
    label: "Pending",
  },
  approved: {
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    label: "Approved",
  },
  rejected: {
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    label: "Rejected",
  },
  suspended: {
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#cbd5e1",
    label: "Suspended",
  },
};

const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN");

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

function StatusBadge({ status }) {
  const meta =
    STATUS_META[status] || {
      color: "#64748b",
      bg: "#f1f5f9",
      border: "#cbd5e1",
      label: status || "Unknown",
    };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        textTransform: "capitalize",
        color: meta.color,
        background: meta.bg,
        border: `1.5px solid ${meta.border}`,
      }}
    >
      {meta.label}
    </span>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="cand-stat-card-3d">
      <div className="card-bg-light-glow"></div>
      <div style={{ position: 'relative', zIndex: 2, display: "flex", gap: "12px", alignItems: "center" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "17px",
            flexShrink: 0,
            background: `${color}1f`,
            color,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="stat-lbl">{label}</div>
          <div className="stat-val" style={{ color }}>{value}</div>
          {sub && <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", marginTop: "1px" }}>{sub}</div>}
        </div>
      </div>
      <div className="card-glow-bar" style={{ background: color }}></div>
    </div>
  );
}

export default function AdminHrPartners() {
  const [tab, setTab] = useState("partners");

  const [partners, setPartners] = useState([]);
  const [payouts, setPayouts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [toast, setToast] = useState(null);

  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [confirmAction, setConfirmAction] = useState(null);

  const [kycModal, setKycModal] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycBusyId, setKycBusyId] = useState(null);

  const [kycRejectingId, setKycRejectingId] = useState(null);
  const [kycRejectReason, setKycRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [partnerResponse, payoutResponse] =
        await Promise.all([
          api.hrPartner.getAll(),
          api.hrPartner.getPendingPayouts(),
        ]);

      if (partnerResponse?.success) {
        setPartners(partnerResponse.data || []);
      } else {
        setLoadError(
          partnerResponse?.message ||
            "Couldn't load HR Partners."
        );
      }

      if (payoutResponse?.success) {
        setPayouts(payoutResponse.data || []);
      } else if (partnerResponse?.success) {
        setLoadError(
          payoutResponse?.message ||
            "Couldn't load pending payouts."
        );
      }
    } catch (error) {
      console.error("HR Partner load error:", error);
      setLoadError(
        "Something went wrong while loading this page."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type, text) => {
    setToast({
      type,
      text,
    });
  };

  const handleApprove = async (id, status) => {
    if (!id) {
      showToast(
        "error",
        "Invalid HR Partner ID."
      );
      return;
    }

    setBusyId(id);

    try {
      const response =
        await api.hrPartner.approve(id, status);

      if (response?.success) {
        showToast(
          "success",
          `Partner marked ${status}.`
        );

        setPartners((previous) =>
          previous.map((partner) =>
            partner.id === id
              ? {
                  ...partner,
                  ...response.data,
                }
              : partner
          )
        );

        await load();
      } else {
        showToast(
          "error",
          response?.message ||
            "Failed to update partner status."
        );
      }
    } catch (error) {
      console.error(
        "HR Partner status error:",
        error
      );

      showToast(
        "error",
        error?.message ||
          "Network error. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handlePrimaryApprove = (partner) => {
    if (!partner?.id) return;

    if (partner.kycStatus !== "approved") {
      showToast(
        "error",
        "KYC approval is required before approving this HR Partner."
      );

      openKycReview(partner);
      return;
    }

    setConfirmAction({
      id: partner.id,
      kind: "approved",
      label: `Approve ${
        partner.user?.name ||
        partner.hrCode ||
        "this HR Partner"
      }?`,
    });
  };

  const handleRelease = async (id) => {
    if (!id) return;

    setBusyId(id);

    try {
      const response =
        await api.hrPartner.releasePayout(id);

      if (response?.success) {
        showToast(
          "success",
          "Payout released successfully."
        );

        setPayouts((previous) =>
          previous.filter(
            (transaction) =>
              transaction.id !== id
          )
        );
      } else {
        showToast(
          "error",
          response?.message ||
            "Failed to release payout."
        );
      }
    } catch (error) {
      console.error(
        "Payout release error:",
        error
      );

      showToast(
        "error",
        "Network error. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  const runConfirmed = () => {
    if (!confirmAction) return;

    const {
      id,
      kind,
    } = confirmAction;

    setConfirmAction(null);

    if (kind === "release") {
      handleRelease(id);
      return;
    }

    handleApprove(id, kind);
  };

  const openKycReview = async (partner) => {
    if (!partner?.user?.id) {
      showToast(
        "error",
        "Partner user information is missing."
      );
      return;
    }

    setKycModal({
      partner,
      documents: [],
    });

    setKycLoading(true);
    setKycRejectingId(null);
    setKycRejectReason("");

    try {
      const response =
        await api.kyc.getAll();

      if (!response?.success) {
        showToast(
          "error",
          response?.message ||
            "Failed to load KYC documents."
        );

        setKycModal(null);
        return;
      }

      const partnerUserId =
        Number(partner.user.id);

      const documents =
        (response.data || []).filter(
          (document) =>
            Number(document.userId) ===
              partnerUserId ||
            Number(document.user?.id) ===
              partnerUserId
        );

      setKycModal({
        partner,
        documents,
      });
    } catch (error) {
      console.error(
        "KYC load error:",
        error
      );

      showToast(
        "error",
        "Failed to load KYC documents."
      );

      setKycModal(null);
    } finally {
      setKycLoading(false);
    }
  };

  const closeKycReview = () => {
    if (kycBusyId) return;

    setKycModal(null);
    setKycRejectingId(null);
    setKycRejectReason("");
  };

  const reviewKycDocument = async (
    documentId,
    status,
    rejectionReason = ""
  ) => {
    if (!documentId) return;

    if (
      status === "rejected" &&
      !rejectionReason.trim()
    ) {
      showToast(
        "error",
        "Please enter a rejection reason."
      );
      return;
    }

    setKycBusyId(documentId);

    try {
      const response =
        await api.kyc.review(
          documentId,
          status,
          rejectionReason
        );

      if (!response?.success) {
        showToast(
          "error",
          response?.message ||
            "Failed to review KYC document."
        );

        return;
      }

      showToast(
        "success",
        `KYC document ${
          status === "approved"
            ? "approved"
            : "rejected"
        } successfully.`
      );

      setKycModal((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          documents:
            previous.documents.map(
              (document) =>
                document.id === documentId
                  ? {
                      ...document,
                      ...response.data,
                      status,
                    }
                  : document
            ),
        };
      });

      setKycRejectingId(null);
      setKycRejectReason("");

      await load();

      if (kycModal?.partner) {
        const responseAfter =
          await api.kyc.getAll();

        if (responseAfter?.success) {
          const partnerUserId =
            Number(
              kycModal.partner.user?.id
            );

          const documents =
            (responseAfter.data || []).filter(
              (document) =>
                Number(document.userId) ===
                  partnerUserId ||
                Number(document.user?.id) ===
                  partnerUserId
            );

          setKycModal((previous) =>
            previous
              ? {
                  ...previous,
                  documents,
                }
              : previous
          );
        }
      }
    } catch (error) {
      console.error(
        "KYC review error:",
        error
      );

      showToast(
        "error",
        "Network error while reviewing KYC."
      );
    } finally {
      setKycBusyId(null);
    }
  };

  const statsObj = useMemo(() => {
    const byStatus = {
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    };

    let walletTotal = 0;

    partners.forEach((partner) => {
      if (
        byStatus[partner.status] !==
        undefined
      ) {
        byStatus[partner.status] += 1;
      }

      walletTotal += Number(
        partner.wallet?.balance || 0
      );
    });

    const payoutTotal =
      payouts.reduce(
        (sum, transaction) =>
          sum +
          Number(transaction.amount || 0),
        0
      );

    return {
      ...byStatus,
      total: partners.length,
      walletTotal,
      payoutTotal,
      payoutCount: payouts.length,
    };
  }, [partners, payouts]);

  const pieData = useMemo(
    () =>
      [
        "pending",
        "approved",
        "rejected",
        "suspended",
      ]
        .map((key) => ({
          name:
            STATUS_META[key].label,
          value: statsObj[key],
          color:
            STATUS_META[key].color,
        }))
        .filter(
          (item) => item.value > 0
        ),
    [statsObj]
  );

  const walletBarData = useMemo(
    () =>
      [...partners]
        .sort(
          (a, b) =>
            Number(
              b.wallet?.balance || 0
            ) -
            Number(
              a.wallet?.balance || 0
            )
        )
        .slice(0, 6)
        .map((partner) => ({
          name:
            partner.hrCode ||
            partner.user?.name ||
            "—",
          balance: Number(
            partner.wallet?.balance || 0
          ),
        })),
    [partners]
  );

  const filteredPartners = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return partners.filter((partner) => {
      if (
        statusFilter !== "all" &&
        partner.status !== statusFilter
      ) {
        return false;
      }

      if (!query) return true;

      return (
        partner.hrCode
          ?.toLowerCase()
          .includes(query) ||
        partner.user?.name
          ?.toLowerCase()
          .includes(query) ||
        partner.user?.email
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [
    partners,
    search,
    statusFilter,
  ]);

  const filteredPayouts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) return payouts;

    return payouts.filter(
      (transaction) => {
        const name =
          transaction.wallet
            ?.hrPartnerProfile
            ?.user?.name
            ?.toLowerCase() || "";

        const code =
          transaction.wallet
            ?.hrPartnerProfile
            ?.hrCode
            ?.toLowerCase() || "";

        return (
          name.includes(query) ||
          code.includes(query)
        );
      }
    );
  }, [payouts, search]);

  return (
    <div className="light-hr-partners-container">
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
      <div className="hr-marquee-banner">
        <div className="hr-marquee-track">
          <span>✨ Recruweb Enterprise HR Partners &amp; Payout Management</span>
          <span>•</span>
          <span>👥 Review HR Partner Applications, KYC Verification &amp; Commission Payouts</span>
          <span>•</span>
          <span>⭐ Real-time Wallet Tracking &amp; Status Approvals</span>
        </div>
      </div>

      {/* HEADER */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              HR Partners <span className="gradient-text">— Operations</span>
            </h1>

            <p className="cand-subtitle">
              Review HR Partner applications, KYC verification and commission payouts.
            </p>
          </div>

          <button
            className="cv-action-btn secondary"
            onClick={load}
            disabled={loading}
            style={{ position: 'relative', zIndex: 2 }}
          >
            {loading ? "Refreshing…" : "🔄 Refresh"}
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {loadError && (
        <div className="cand-msg-banner" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca', marginBottom: "24px", position: 'relative', zIndex: 2 }}>
          ⚠ {loadError}
        </div>
      )}

      {/* STATS */}
      <div className="client-stats-grid" style={{ position: 'relative', zIndex: 2 }}>
        <StatCard
          label="Total Partners"
          value={statsObj.total}
          color="#0284c7"
          icon="👥"
        />

        <StatCard
          label="Pending Review"
          value={statsObj.pending}
          sub={
            statsObj.pending
              ? "Needs your attention"
              : "All caught up"
          }
          color="#d97706"
          icon="⏳"
        />

        <StatCard
          label="Approved"
          value={statsObj.approved}
          color="#059669"
          icon="✅"
        />

        <StatCard
          label="Suspended / Rejected"
          value={
            statsObj.suspended +
            statsObj.rejected
          }
          color="#dc2626"
          icon="⛔"
        />

        <StatCard
          label="Total Wallet Balance"
          value={money(
            statsObj.walletTotal
          )}
          color="#6366f1"
          icon="💰"
        />

        <StatCard
          label="Pending Payouts"
          value={money(
            statsObj.payoutTotal
          )}
          sub={`${statsObj.payoutCount} transaction${
            statsObj.payoutCount === 1
              ? ""
              : "s"
          }`}
          color="#9333ea"
          icon="🏦"
        />
      </div>

      {/* CHARTS with Smooth Animations */}
      {!loading &&
        statsObj.total > 0 && (
          <div className="client-grid-2" style={{ position: 'relative', zIndex: 2, marginBottom: "28px" }}>
            <div className="cand-card-3d">
              <div className="card-bg-light-glow"></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>
                  Partner status breakdown
                </div>

                {pieData.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height={230}
                  >
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={1000}
                      >
                        {pieData.map(
                          (item, index) => (
                            <Cell
                              key={index}
                              fill={item.color}
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          background:
                            "#ffffff",
                          border:
                            "1.5px solid #cbd5e1",
                          borderRadius: 12,
                          color: "#0f172a",
                          fontWeight: 700,
                        }}
                      />

                      <Legend
                        wrapperStyle={{
                          fontSize: 12.5,
                          color: "#334155",
                          fontWeight: "700",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="cand-empty-state">
                    No data yet
                  </div>
                )}
              </div>
              <div className="card-glow-bar"></div>
            </div>

            <div className="cand-card-3d">
              <div className="card-bg-light-glow"></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>
                  Top wallet balances
                </div>

                {walletBarData.some(
                  (item) => item.balance > 0
                ) ? (
                  <ResponsiveContainer
                    width="100%"
                    height={230}
                  >
                    <BarChart
                      data={walletBarData}
                      margin={{
                        top: 8,
                        right: 12,
                        left: -10,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "#64748b",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fill: "#64748b",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        formatter={(value) =>
                          money(value)
                        }
                        contentStyle={{
                          background:
                            "#ffffff",
                          border:
                            "1.5px solid #cbd5e1",
                          borderRadius: 12,
                          color: "#0f172a",
                          fontWeight: 700,
                        }}
                      />

                      <Bar
                        dataKey="balance"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                        fill="#0284c7"
                        isAnimationActive={true}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="cand-empty-state">
                    No wallet balances yet
                  </div>
                )}
              </div>
              <div className="card-glow-bar"></div>
            </div>
          </div>
        )}

      {/* TOOLBAR */}
      <div className="cand-card-3d" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", gap: "8px" }}>
          <button
            onClick={() =>
              setTab("partners")
            }
            className={`cv-action-btn${tab === "partners" ? " primary glow-btn" : " secondary"}`}
          >
            Partners ({partners.length})
          </button>

          <button
            onClick={() =>
              setTab("payouts")
            }
            className={`cv-action-btn${tab === "payouts" ? " primary glow-btn" : " secondary"}`}
          >
            Pending Payouts ({payouts.length})
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {tab === "partners" && (
            <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "0 14px", display: "flex", alignItems: "center" }}>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                style={{ background: "none", border: "none", outline: "none", color: "#0f172a", fontWeight: "800", fontSize: "13.5px", padding: "10px 0", cursor: "pointer" }}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "8px 14px", display: "flex", alignItems: "center", minWidth: "260px" }}>
            <span style={{ marginRight: "8px" }}>🔍</span>
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={
                tab === "partners"
                  ? "Search name, email, HR code…"
                  : "Search partner or HR code…"
              }
              style={{ background: "none", border: "none", outline: "none", color: "#0f172a", fontSize: "14px", fontWeight: "600", width: "100%" }}
            />
          </div>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          className="cand-msg-banner"
          style={{
            marginBottom: "20px",
            position: 'relative',
            zIndex: 2,
            background: toast.type === "error" ? "#fef2f2" : "#ecfdf5",
            color: toast.type === "error" ? "#dc2626" : "#059669",
            borderColor: toast.type === "error" ? "#fecaca" : "#a7f3d0",
          }}
        >
          {toast.type === "error" ? "⚠ " : "✓ "} {toast.text}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="cand-loading-state">
          <span className="cand-loader"></span> Loading HR partners…
        </div>
      )}

      {/* PARTNERS */}
      {!loading &&
        tab === "partners" && (
          <div className="cand-card-3d">
            <div className="card-bg-light-glow"></div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              {filteredPartners.length ===
              0 ? (
                <div className="cand-empty-state">
                  <div
                    style={{
                      fontSize: 36,
                      marginBottom: 10,
                    }}
                  >
                    🗂️
                  </div>

                  {partners.length === 0
                    ? "No HR Partners have registered yet."
                    : "No partners match your search or filter."}
                </div>
              ) : (
                <div className="cand-table-wrap">
                  <table
                    className="cand-light-table"
                  >
                    <thead>
                      <tr>
                        <th>
                          Partner
                        </th>

                        <th>
                          HR Code
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          KYC
                        </th>

                        <th>
                          Wallet
                        </th>

                        <th
                          style={{
                            textAlign:
                              "right",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPartners.map(
                        (partner) => {
                          const isBusy =
                            busyId ===
                            partner.id;

                          const kycApproved =
                            partner.kycStatus ===
                            "approved";

                          return (
                            <tr
                              key={
                                partner.id
                              }
                              className="table-row-hover"
                            >
                              {/* PARTNER */}
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "38px",
                                      height: "38px",
                                      borderRadius: "12px",
                                      background:
                                        "linear-gradient(135deg,#0284c7,#6366f1)",
                                      color: "white",
                                      fontWeight: "900",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "14px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {initials(
                                      partner
                                        .user
                                        ?.name
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      minWidth: 0,
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontWeight: "900",
                                        color: "#0f172a",
                                        fontSize: "14.5px",
                                      }}
                                    >
                                      {partner
                                        .user
                                        ?.name ||
                                        "—"}
                                    </div>

                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "#64748b",
                                        fontWeight: "700",
                                      }}
                                    >
                                      {partner
                                        .user
                                        ?.email ||
                                        "—"}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* HR CODE */}
                              <td
                                style={{
                                  fontFamily:
                                    "monospace",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: "#0f172a",
                                }}
                              >
                                {
                                  partner.hrCode
                                }
                              </td>

                              {/* STATUS */}
                              <td>
                                <StatusBadge
                                  status={
                                    partner.status
                                  }
                                />
                              </td>

                              {/* KYC */}
                              <td>
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    flexDirection:
                                      "column",
                                    gap: 6,
                                    alignItems:
                                      "flex-start",
                                  }}
                                >
                                  <StatusBadge
                                    status={
                                      partner.kycStatus
                                    }
                                  />

                                  {partner.status !==
                                    "approved" && (
                                    <button
                                      onClick={() =>
                                        openKycReview(
                                          partner
                                        )
                                      }
                                      className="cv-action-btn secondary"
                                      style={{ padding: "4px 10px", fontSize: "11.5px" }}
                                    >
                                      🔍 Review KYC
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* WALLET */}
                              <td style={{ color: "#0f172a", fontWeight: "900" }}>
                                {money(
                                  partner
                                    .wallet
                                    ?.balance
                                )}
                              </td>

                              {/* ACTIONS */}
                              <td
                                style={{
                                  textAlign:
                                    "right",
                                }}
                              >
                                {partner.status ===
                                  "pending" && (
                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      gap: 6,
                                      justifyContent:
                                        "flex-end",
                                      flexWrap:
                                        "wrap",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        handlePrimaryApprove(
                                          partner
                                        )
                                      }
                                      className="cv-action-btn primary glow-btn"
                                      style={{ padding: "6px 12px", fontSize: "12px" }}
                                      disabled={
                                        isBusy
                                      }
                                      title={
                                        kycApproved
                                          ? "Approve HR Partner"
                                          : "KYC approval required first"
                                      }
                                    >
                                      {isBusy
                                        ? "…"
                                        : kycApproved
                                        ? "Approve"
                                        : "Approve → KYC"}
                                    </button>

                                    <button
                                      onClick={() =>
                                        setConfirmAction(
                                          {
                                            id:
                                              partner.id,
                                            kind:
                                              "rejected",
                                            label: `Reject ${
                                              partner
                                                .user
                                                ?.name ||
                                              partner.hrCode
                                            }?`,
                                          }
                                        )
                                      }
                                      className="cv-action-btn"
                                      style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                                      disabled={
                                        isBusy
                                      }
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}

                                {partner.status ===
                                  "approved" && (
                                  <button
                                    onClick={() =>
                                      setConfirmAction(
                                        {
                                          id:
                                            partner.id,
                                          kind:
                                            "suspended",
                                          label: `Suspend ${
                                            partner
                                              .user
                                              ?.name ||
                                            partner.hrCode
                                          }?`,
                                        }
                                      )
                                    }
                                    className="cv-action-btn"
                                    style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                                    disabled={
                                      isBusy
                                    }
                                  >
                                    {isBusy
                                      ? "…"
                                      : "Suspend"}
                                  </button>
                                )}

                                {(partner.status ===
                                  "rejected" ||
                                  partner.status ===
                                    "suspended") && (
                                  <span
                                    style={{
                                      color:
                                        "#64748b",
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    No actions
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-glow-bar"></div>
          </div>
        )}

      {/* PAYOUTS */}
      {!loading &&
        tab === "payouts" && (
          <div className="cand-card-3d">
            <div className="card-bg-light-glow"></div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              {filteredPayouts.length ===
              0 ? (
                <div className="cand-empty-state">
                  <div
                    style={{
                      fontSize: 36,
                      marginBottom: 10,
                    }}
                  >
                    💸
                  </div>

                  {payouts.length === 0
                    ? "No pending payouts right now."
                    : "No payouts match your search."}
                </div>
              ) : (
                <div className="cand-table-wrap">
                  <table
                    className="cand-light-table"
                  >
                    <thead>
                      <tr>
                        <th>
                          Partner
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Description
                        </th>

                        <th>
                          Created
                        </th>

                        <th
                          style={{
                            textAlign:
                              "right",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPayouts.map(
                        (transaction) => {
                          const isBusy =
                            busyId ===
                            transaction.id;

                          return (
                            <tr
                              key={
                                transaction.id
                              }
                              className="table-row-hover"
                            >
                              <td>
                                <strong style={{ color: "#0f172a", fontWeight: "900" }}>
                                  {transaction
                                    .wallet
                                    ?.hrPartnerProfile
                                    ?.user
                                    ?.name ||
                                    "—"}
                                </strong>

                                <span
                                  style={{
                                    color:
                                      "#64748b",
                                    fontWeight: "700",
                                    fontSize: "12px",
                                    marginLeft: "6px",
                                  }}
                                >
                                  (
                                  {
                                    transaction
                                      .wallet
                                      ?.hrPartnerProfile
                                      ?.hrCode
                                  }
                                  )
                                </span>
                              </td>

                              <td
                                style={{
                                  fontWeight:
                                    "900",
                                  color:
                                    "#059669",
                                }}
                              >
                                {money(
                                  transaction.amount
                                )}
                              </td>

                              <td style={{ color: "#334155", fontWeight: "700" }}>
                                {transaction.description ||
                                  "—"}
                              </td>

                              <td className="date-text">
                                {transaction.createdAt
                                  ? new Date(
                                      transaction.createdAt
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "—"}
                              </td>

                              <td
                                style={{
                                  textAlign:
                                    "right",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    setConfirmAction(
                                      {
                                        id:
                                          transaction.id,
                                        kind:
                                          "release",
                                        label: `Release ${money(
                                          transaction.amount
                                        )} to ${
                                          transaction
                                            .wallet
                                            ?.hrPartnerProfile
                                            ?.user
                                            ?.name ||
                                          "this partner"
                                        }?`,
                                      }
                                    )
                                  }
                                  className="cv-action-btn primary glow-btn"
                                  style={{ padding: "6px 14px", fontSize: "12px" }}
                                  disabled={
                                    isBusy
                                  }
                                >
                                  {isBusy
                                    ? "…"
                                    : "Release Now ✨"}
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-glow-bar"></div>
          </div>
        )}

      {/* =====================================================
          KYC REVIEW MODAL
          ===================================================== */}
      {kycModal && (
        <div
          className="modal-overlay-light"
          onClick={closeKycReview}
        >
          <div
            className="modal-card-light animate-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{ maxWidth: "760px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
          >
            <div className="drawer-header-3d">
              <div>
                <h2>
                  KYC Review
                </h2>

                <p className="drawer-subtext">
                  {kycModal.partner
                    ?.user?.name ||
                    "HR Partner"}{" "}
                  ·{" "}
                  {kycModal.partner
                    ?.hrCode ||
                    "—"}
                </p>
              </div>

              <button
                onClick={
                  closeKycReview
                }
                className="close-drawer-btn"
                disabled={
                  Boolean(kycBusyId)
                }
              >
                ×
              </button>
            </div>

            <div className="drawer-scroll-body">
              {/* PARTNER SUMMARY */}
              <div className="client-stats-grid" style={{ marginBottom: "16px" }}>
                <div className="cand-stat-card-3d" style={{ padding: "12px" }}>
                  <span className="stat-lbl">Partner Status</span>
                  <div style={{ marginTop: "6px" }}>
                    <StatusBadge
                      status={
                        kycModal.partner
                          ?.status
                      }
                    />
                  </div>
                </div>

                <div className="cand-stat-card-3d" style={{ padding: "12px" }}>
                  <span className="stat-lbl">KYC Status</span>
                  <div style={{ marginTop: "6px" }}>
                    <StatusBadge
                      status={
                        kycModal.partner
                          ?.kycStatus
                      }
                    />
                  </div>
                </div>

                <div className="cand-stat-card-3d" style={{ padding: "12px" }}>
                  <span className="stat-lbl">Email</span>
                  <div className="stat-val" style={{ fontSize: "13.5px", color: "#0f172a", wordBreak: "break-word", marginTop: "6px" }}>
                    {kycModal.partner
                      ?.user?.email ||
                      "—"}
                  </div>
                </div>
              </div>

              {/* KYC CONTENT */}
              {kycLoading ? (
                <div className="cand-loading-state">
                  <span className="cand-loader"></span> Loading KYC documents…
                </div>
              ) : kycModal.documents
                  ?.length === 0 ? (
                <div className="cand-empty-state">
                  <div
                    style={{
                      fontSize: 36,
                      marginBottom: 10,
                    }}
                  >
                    📄
                  </div>

                  <strong>
                    No KYC documents found
                  </strong>

                  <p
                    style={{
                      color:
                        "#64748b",
                      fontSize: 13,
                      fontWeight: 600,
                      marginTop: 6,
                    }}
                  >
                    This partner has not
                    uploaded a KYC document
                    yet.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {kycModal.documents.map(
                    (document) => {
                      const isBusy =
                        kycBusyId ===
                        document.id;

                      return (
                        <div
                          key={
                            document.id
                          }
                          className="drawer-card-section"
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 15,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: 900,
                                  color: "#0f172a",
                                }}
                              >
                                {document.documentType ||
                                  "KYC Document"}
                              </div>

                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#64748b",
                                  fontWeight: 700,
                                  marginTop: 4,
                                }}
                              >
                                {document.fileName ||
                                  "Uploaded document"}
                              </div>
                            </div>

                            <StatusBadge
                              status={
                                document.status
                              }
                            />
                          </div>

                          {document.rejectionReason && (
                            <div
                              style={{
                                marginTop: 10,
                                padding: "8px 12px",
                                background:
                                  "#fef2f2",
                                border:
                                  "1.5px solid #fecaca",
                                borderRadius: 10,
                                color: "#dc2626",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              <strong>
                                Rejection reason:
                              </strong>{" "}
                              {
                                document.rejectionReason
                              }
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flexWrap: "wrap",
                              marginTop: 14,
                            }}
                          >
                            {document.fileUrl && (
                              <a
                                href={
                                  document.fileUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="cv-action-btn secondary"
                                style={{ padding: "6px 12px", fontSize: "12px", textDecoration: "none" }}
                              >
                                👁 View Document ↗
                              </a>
                            )}

                            {document.status ===
                              "pending" && (
                              <>
                                {kycRejectingId ===
                                document.id ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      flexWrap: "wrap",
                                      width: "100%",
                                      marginTop: "8px",
                                    }}
                                  >
                                    <input
                                      value={
                                        kycRejectReason
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setKycRejectReason(
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      placeholder="Enter rejection reason..."
                                      className="cand-input"
                                      style={{ flex: 1, minWidth: "220px" }}
                                      disabled={
                                        isBusy
                                      }
                                    />

                                    <button
                                      onClick={() =>
                                        reviewKycDocument(
                                          document.id,
                                          "rejected",
                                          kycRejectReason
                                        )
                                      }
                                      className="cv-action-btn"
                                      style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 16px", fontWeight: "800", cursor: "pointer" }}
                                      disabled={
                                        isBusy
                                      }
                                    >
                                      {isBusy
                                        ? "..."
                                        : "Confirm Reject"}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setKycRejectingId(
                                          null
                                        );
                                        setKycRejectReason(
                                          ""
                                        );
                                      }}
                                      className="cv-action-btn secondary"
                                      disabled={
                                        isBusy
                                      }
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        reviewKycDocument(
                                          document.id,
                                          "approved"
                                        )
                                      }
                                      className="cv-action-btn primary glow-btn"
                                      style={{ padding: "6px 14px", fontSize: "12px" }}
                                      disabled={
                                        isBusy
                                      }
                                    >
                                      {isBusy
                                        ? "..."
                                        : "✓ Approve KYC"}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setKycRejectingId(
                                          document.id
                                        );
                                        setKycRejectReason(
                                          ""
                                        );
                                      }}
                                      className="cv-action-btn"
                                      style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "6px 12px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}
                                      disabled={
                                        isBusy
                                      }
                                    >
                                      Reject KYC
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <div className="drawer-header-3d" style={{ background: "#f8fafc", justifyContent: "flex-end" }}>
              <button
                className="cv-action-btn secondary"
                onClick={
                  closeKycReview
                }
                disabled={
                  Boolean(kycBusyId)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRM MODAL
          ===================================================== */}
      {confirmAction && (
        <div
          className="modal-overlay-light"
          onClick={() =>
            setConfirmAction(null)
          }
        >
          <div
            className="modal-card-light animate-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{ maxWidth: "420px", padding: "28px" }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: "#0f172a",
                marginBottom: "8px",
              }}
            >
              Please confirm
            </div>

            <p
              style={{
                fontSize: 14,
                color: "#334155",
                fontWeight: "700",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              {confirmAction.label}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                className="cv-action-btn secondary"
                onClick={() =>
                  setConfirmAction(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                className="cv-action-btn primary glow-btn"
                style={{
                  background:
                    confirmAction.kind ===
                    "rejected" || confirmAction.kind === "suspended"
                      ? "#dc2626"
                      : undefined,
                }}
                onClick={
                  runConfirmed
                }
              >
                Confirm ✨
              </button>
            </div>
          </div>
        </div>
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-hr-partners-container {
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
        .hr-marquee-banner {
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

        .hr-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .hr-marquee-track span {
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

        .client-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
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

        .stat-val {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .stat-lbl {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .client-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
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

        .date-text {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 700;
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
          padding: 50px 20px;
          color: #64748b;
          font-weight: 700;
        }

        .cand-msg-banner {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 800;
          border: 1.5px solid;
        }

        /* Modal / Drawer Overlays */
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

        .drawer-card-section {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          padding: 18px;
          border-radius: 18px;
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

        @media (max-width: 768px) {
          .client-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  // Keeping fallback styles object if needed or integrated above
};