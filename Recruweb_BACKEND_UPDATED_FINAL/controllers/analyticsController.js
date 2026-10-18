import {
  Job,
  Application,
  Company,
  Contact,
  GetStarted,
  EmployeeJoining,
  Subscriber,
  Task,
  User,
  CrmClient,
  Invoice,
  Payment,
} from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";
import { ROLES, ROLE_GROUPS } from "../config/roles.js";
import { convert as convertCurrency } from "../utils/currencyService.js";

// Phase 6 — Global Features. Invoices/Payments are recorded in the
// platform's home currency (INR, see models/Invoice.js & Payment.js
// defaults). When the CEO dashboard is requested with ?displayCurrency=XXX
// we additionally convert the revenue snapshot live via currencyService —
// this never replaces the original INR figures, it's an extra `converted`
// block so nothing that already consumes this endpoint breaks.
const HOME_CURRENCY = "INR";

// Lightweight CEO/recruiter dashboard analytics (counts + pipeline breakdown)
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      totalCompanies,
      totalContacts,
      totalClientInquiries,
      totalJoinings,
      totalSubscribers,
      pendingTasks,
    ] = await Promise.all([
      Job.count(),
      Job.count({ where: { isActive: true } }),
      Application.count(),
      Company.count(),
      Contact.count(),
      GetStarted.count(),
      EmployeeJoining.count(),
      Subscriber.count({ where: { isActive: true } }),
      Task.count({ where: { status: "pending" } }),
    ]);

    // Applied-candidate pipeline breakdown, e.g. for a simple Kanban view
    const statuses = [
      "new",
      "reviewed",
      "shortlisted",
      "interview",
      "offered",
      "rejected",
    ];
    const pipelineCounts = {};
    for (const status of statuses) {
      pipelineCounts[status] = await Application.count({ where: { status } });
    }

    // ---- Real monthly trend (last 6 months) — applications, jobs posted,
    // and collected revenue, all computed live from the DB. No mock data:
    // months with zero real activity simply show 0, never a placeholder
    // number, so the chart always reflects the true current state.
    const now = new Date();
    const monthBuckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      monthBuckets.push({
        label: d.toLocaleString("en-US", { month: "short" }),
        start: d,
        end: next,
      });
    }
    const [allApplicationsForTrend, allPaymentsForTrend, allJobsForTrend] =
      await Promise.all([
        Application.findAll({ attributes: ["createdAt"] }),
        Payment.findAll({
          where: { status: "received" },
          attributes: ["amount", "paymentDate"],
        }),
        Job.findAll({ attributes: ["createdAt"] }),
      ]);
    const monthlyTrend = monthBuckets.map(({ label, start, end }) => {
      const applications = allApplicationsForTrend.filter((a) => {
        const t = new Date(a.createdAt);
        return t >= start && t < end;
      }).length;
      const jobs = allJobsForTrend.filter((j) => {
        const t = new Date(j.createdAt);
        return t >= start && t < end;
      }).length;
      const revenue = allPaymentsForTrend
        .filter((p) => {
          const t = new Date(p.paymentDate);
          return t >= start && t < end;
        })
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      return { month: label, applications, jobs, revenue: Number(revenue.toFixed(2)) };
    });

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        totalCompanies,
        totalContacts,
        totalClientInquiries,
        totalJoinings,
        totalSubscribers,
        pendingTasks,
        pipelineCounts,
        monthlyTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// Phase 2 — Super Admin dashboard analytics.
// Total Users / Total Candidates / Total Clients / Total Jobs / Revenue / Active Recruiters
export const getSuperAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalClients,
      totalJobs,
      activeJobs,
      totalStaff,
      activeRecruitersCount,
      revenueRows,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: ROLES.CANDIDATE } }),
      Company.count(),
      Job.count(),
      Job.count({ where: { isActive: true } }),
      User.count({ where: { role: ROLE_GROUPS.STAFF } }),
      // Active recruiters: recruiters / recruitment managers currently active.
      User.count({
        where: {
          role: [ROLES.RECRUITER, ROLES.RECRUITMENT_MANAGER],
          isActive: true,
        },
      }),
      EmployeeJoining.findAll({
        where: { status: "approved" },
        attributes: ["billingAmount"],
      }),
    ]);

    const revenue = revenueRows.reduce(
      (sum, row) => sum + parseFloat(row.billingAmount || 0),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCandidates,
        totalClients,
        totalJobs,
        activeJobs,
        totalStaff,
        activeRecruiters: activeRecruitersCount,
        revenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch super admin stats",
      error: error.message,
    });
  }
};

// ==========================================================================
// Extra Module — Analytics Module: CEO Dashboard
// ==========================================================================
// GET /api/analytics/ceo — a single, executive-level snapshot of the whole
// business, computed live from real DB rows (Invoice/Payment for revenue,
// Application for the hiring funnel, CrmClient for accounts, User for the
// recruiter leaderboard). Nothing here is hard-coded or mocked.
export const getCEODashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // ---- Revenue snapshot (live from Invoice / Payment) ----
    const [invoices, payments] = await Promise.all([
      Invoice.findAll({ attributes: ["totalAmount", "amount", "balanceDue"] }),
      Payment.findAll({ where: { status: "received" } }),
    ]);

    const totalInvoiced = invoices.reduce(
      (s, i) => s + Number(i.totalAmount || i.amount || 0),
      0,
    );
    const totalCollected = payments.reduce(
      (s, p) => s + Number(p.amount || 0),
      0,
    );
    const totalOutstanding = invoices.reduce(
      (s, i) => s + Number(i.balanceDue || 0),
      0,
    );

    // ---- Monthly revenue trend — last 6 months, from real Payment rows ----
    const monthBuckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      });
    }
    const revenueTrend = monthBuckets.map(({ year, month, label }) => {
      const total = payments
        .filter((p) => {
          const pd = new Date(p.paymentDate);
          return pd.getFullYear() === year && pd.getMonth() === month;
        })
        .reduce((s, p) => s + Number(p.amount || 0), 0);
      return { month: label, revenue: Number(total.toFixed(2)) };
    });

    // ---- Hiring funnel — Applied Candidate Module status breakdown ----
    const funnelStatuses = [
      "new",
      "reviewed",
      "shortlisted",
      "interview",
      "offered",
      "rejected",
    ];
    const funnelEntries = await Promise.all(
      funnelStatuses.map((status) =>
        Application.count({ where: { status } }).then((count) => [
          status,
          count,
        ]),
      ),
    );
    const funnel = Object.fromEntries(funnelEntries);

    // ---- Headline counts + month-over-month application growth ----
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsThisMonth,
      applicationsLastMonth,
      totalClients,
      activeClients,
      totalCandidateUsers,
      newJoinersThisMonth,
    ] = await Promise.all([
      Job.count(),
      Job.count({ where: { isActive: true } }),
      Application.count(),
      Application.count({
        where: { createdAt: { [Op.gte]: startOfThisMonth } },
      }),
      Application.count({
        where: {
          createdAt: {
            [Op.gte]: startOfLastMonth,
            [Op.lt]: startOfThisMonth,
          },
        },
      }),
      CrmClient.count(),
      CrmClient.count({ where: { status: "active" } }),
      User.count({ where: { role: ROLES.CANDIDATE } }),
      EmployeeJoining.count({
        where: { joiningDate: { [Op.gte]: startOfThisMonth } },
      }),
    ]);

    const applicationsGrowthPct =
      applicationsLastMonth > 0
        ? Number(
            (
              ((applicationsThisMonth - applicationsLastMonth) /
                applicationsLastMonth) *
              100
            ).toFixed(1),
          )
        : applicationsThisMonth > 0
          ? 100
          : 0;

    // ---- Recruiter leaderboard — real assignment/offer counts per recruiter ----
    const recruiters = await User.findAll({
      where: {
        role: [
          ROLES.RECRUITER,
          ROLES.RECRUITMENT_MANAGER,
          ROLES.HR,
          ROLES.HR_MANAGER,
        ],
        isActive: true,
      },
      attributes: ["id", "name", "role"],
    });
    const recruiterLeaderboard = (
      await Promise.all(
        recruiters.map(async (r) => {
          const [assignedCandidates, offersMade, joinedCandidates] =
            await Promise.all([
              Application.count({ where: { assignedToId: r.id } }),
              Application.count({
                where: { assignedToId: r.id, status: "offered" },
              }),
              Application.count({
                where: { assignedToId: r.id, status: "reviewed" },
              }),
            ]);
          return {
            id: r.id,
            name: r.name,
            role: r.role,
            assignedCandidates,
            offersMade,
            reviewed: joinedCandidates,
          };
        }),
      )
    )
      .filter((r) => r.assignedCandidates > 0 || r.offersMade > 0)
      .sort(
        (a, b) =>
          b.offersMade - a.offersMade ||
          b.assignedCandidates - a.assignedCandidates,
      )
      .slice(0, 10);

    // ---- Top clients by collected revenue (real Payment rows, grouped) ----
    const clientRevenueRows = await Payment.findAll({
      attributes: ["clientId", [fn("SUM", col("amount")), "totalPaid"]],
      where: { status: "received" },
      group: ["clientId"],
      order: [[literal("totalPaid"), "DESC"]],
      limit: 5,
    });
    const topClientIds = clientRevenueRows
      .map((r) => r.clientId)
      .filter(Boolean);
    const topClientRecords = topClientIds.length
      ? await CrmClient.findAll({
          where: { id: topClientIds },
          attributes: ["id", "name"],
        })
      : [];
    const clientNameMap = Object.fromEntries(
      topClientRecords.map((c) => [c.id, c.name]),
    );
    const topClients = clientRevenueRows.map((r) => ({
      clientId: r.clientId,
      name: clientNameMap[r.clientId] || `Client #${r.clientId}`,
      revenue: Number(r.get("totalPaid") || 0),
    }));

    // ---- Optional live currency conversion of the revenue snapshot ----
    // Additive only: `revenue` above stays in HOME_CURRENCY (INR) exactly
    // as before, `revenueConverted` is only present when a valid
    // ?displayCurrency=XXX was requested and live rates were available.
    let revenueConverted = null;
    const displayCurrency = (req.query.displayCurrency || "").toUpperCase();
    if (displayCurrency && displayCurrency !== HOME_CURRENCY) {
      const [invoicedConv, collectedConv, outstandingConv] = await Promise.all([
        convertCurrency(totalInvoiced, HOME_CURRENCY, displayCurrency),
        convertCurrency(totalCollected, HOME_CURRENCY, displayCurrency),
        convertCurrency(totalOutstanding, HOME_CURRENCY, displayCurrency),
      ]);
      if (invoicedConv.success && collectedConv.success && outstandingConv.success) {
        revenueConverted = {
          currency: displayCurrency,
          totalInvoiced: invoicedConv.convertedAmount,
          totalCollected: collectedConv.convertedAmount,
          totalOutstanding: outstandingConv.convertedAmount,
          rate: invoicedConv.rate,
          stale: invoicedConv.stale,
          fetchedAt: invoicedConv.fetchedAt,
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        revenue: {
          currency: HOME_CURRENCY,
          totalInvoiced: Number(totalInvoiced.toFixed(2)),
          totalCollected: Number(totalCollected.toFixed(2)),
          totalOutstanding: Number(totalOutstanding.toFixed(2)),
        },
        revenueConverted,
        revenueTrend,
        funnel,
        jobs: { totalJobs, activeJobs },
        applications: {
          total: totalApplications,
          thisMonth: applicationsThisMonth,
          lastMonth: applicationsLastMonth,
          growthPct: applicationsGrowthPct,
        },
        clients: { total: totalClients, active: activeClients },
        candidates: { totalRegistered: totalCandidateUsers },
        newJoinersThisMonth,
        recruiterLeaderboard,
        topClients,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch CEO dashboard",
      error: error.message,
    });
  }
};
