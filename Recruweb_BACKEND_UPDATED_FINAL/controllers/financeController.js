import { Invoice, Payment, CrmClient } from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";

// GET /api/finance/summary — top-line finance dashboard cards, all
// computed live from Invoice/Payment rows (no hard-coded numbers).
export const getFinanceSummary = async (req, res) => {
  try {
    const invoices = await Invoice.findAll();
    const payments = await Payment.findAll({ where: { status: "received" } });

    const totalInvoiced = invoices.reduce(
      (s, i) => s + Number(i.totalAmount || i.amount || 0),
      0,
    );
    const totalCollected = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const totalOutstanding = invoices.reduce(
      (s, i) =>
        s +
        Math.max(
          Number(i.balanceDue || 0),
          Number(i.totalAmount ?? i.amount ?? 0) - Number(i.amountPaid || 0),
        ),
      0,
    );
    const totalGst = invoices.reduce((s, i) => s + Number(i.gstAmount || 0), 0);
    const totalTds = invoices.reduce((s, i) => s + Number(i.tdsAmount || 0), 0);

    const overdueCount = invoices.filter((i) => i.status === "overdue").length;
    const paidCount = invoices.filter((i) => i.status === "paid").length;

    res.status(200).json({
      success: true,
      data: {
        totalInvoiced: Number(totalInvoiced.toFixed(2)),
        totalCollected: Number(totalCollected.toFixed(2)),
        totalOutstanding: Number(totalOutstanding.toFixed(2)),
        totalGstCollected: Number(totalGst.toFixed(2)),
        totalTdsDeducted: Number(totalTds.toFixed(2)),
        invoiceCount: invoices.length,
        paidCount,
        overdueCount,
        paymentCount: payments.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to compute finance summary",
      error: error.message,
    });
  }
};

// GET /api/finance/revenue-reports?groupBy=month|client|status&from=&to=
export const getRevenueReport = async (req, res) => {
  try {
    const { groupBy = "month", from, to } = req.query;

    const where = {};
    if (from || to) {
      where.issueDate = {};
      if (from) where.issueDate[Op.gte] = new Date(from);
      if (to) where.issueDate[Op.lte] = new Date(to);
    }

    if (groupBy === "client") {
      const rows = await Invoice.findAll({
        where,
        attributes: [
          "clientId",
          [fn("SUM", col("totalAmount")), "invoiced"],
          [fn("SUM", col("amountPaid")), "collected"],
          [fn("SUM", col("balanceDue")), "outstanding"],
          [fn("COUNT", col("Invoice.id")), "invoiceCount"],
        ],
        include: [{ model: CrmClient, as: "client", attributes: ["id", "name", "clientCode"] }],
        group: ["clientId", "client.id"],
        order: [[literal("invoiced"), "DESC"]],
      });
      return res.status(200).json({ success: true, groupBy, data: rows });
    }

    if (groupBy === "status") {
      const rows = await Invoice.findAll({
        where,
        attributes: [
          "status",
          [fn("SUM", col("totalAmount")), "invoiced"],
          [fn("SUM", col("amountPaid")), "collected"],
          [fn("COUNT", col("id")), "invoiceCount"],
        ],
        group: ["status"],
      });
      return res.status(200).json({ success: true, groupBy, data: rows });
    }

    // default: month
    const rows = await Invoice.findAll({
      where,
      attributes: [
        [fn("DATE_FORMAT", col("issueDate"), "%Y-%m"), "month"],
        [fn("SUM", col("totalAmount")), "invoiced"],
        [fn("SUM", col("amountPaid")), "collected"],
        [fn("SUM", col("balanceDue")), "outstanding"],
        [fn("SUM", col("gstAmount")), "gst"],
        [fn("SUM", col("tdsAmount")), "tds"],
        [fn("COUNT", col("id")), "invoiceCount"],
      ],
      group: [fn("DATE_FORMAT", col("issueDate"), "%Y-%m")],
      order: [[literal("month"), "ASC"]],
    });

    res.status(200).json({ success: true, groupBy: "month", data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to compute revenue report",
      error: error.message,
    });
  }
};
