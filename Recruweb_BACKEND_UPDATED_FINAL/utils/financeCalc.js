// Phase 8 — Finance Module: GST / TDS computation helpers.
// All numbers are computed from the real invoice fields — no hard-coded
// dummy totals. Indian GST convention: CGST+SGST for intra-state supply,
// IGST for inter-state supply (place of supply state != seller/home state).

const HOME_STATE = (process.env.COMPANY_STATE || "Uttar Pradesh").toLowerCase();

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * @param {Object} p
 * @param {number} p.amount        taxable subtotal
 * @param {number} p.gstRate       e.g. 18 (%)
 * @param {boolean} p.tdsApplicable
 * @param {number} p.tdsRate       e.g. 2 (%)
 * @param {string} p.placeOfSupply state name, used to decide CGST+SGST vs IGST
 */
export const computeInvoiceTotals = ({
  amount,
  gstRate = 18,
  tdsApplicable = false,
  tdsRate = 0,
  placeOfSupply = "",
}) => {
  const subtotal = round2(amount);
  const gstAmount = round2((subtotal * (Number(gstRate) || 0)) / 100);

  const isInterState =
    placeOfSupply && placeOfSupply.trim().toLowerCase() !== HOME_STATE;

  let cgstAmount = 0,
    sgstAmount = 0,
    igstAmount = 0;
  if (gstAmount > 0) {
    if (isInterState) {
      igstAmount = gstAmount;
    } else {
      cgstAmount = round2(gstAmount / 2);
      sgstAmount = round2(gstAmount - cgstAmount);
    }
  }

  const tdsAmount = tdsApplicable
    ? round2((subtotal * (Number(tdsRate) || 0)) / 100)
    : 0;

  // Total payable by the client = subtotal + GST - TDS withheld by the client.
  const totalAmount = round2(subtotal + gstAmount - tdsAmount);

  return {
    subtotal,
    gstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    tdsAmount,
    totalAmount,
  };
};

/**
 * Recalculates amountPaid / balanceDue / status on an Invoice instance from
 * its real Payment rows (status = 'received' only). Call after any Payment
 * create/update/delete. Does not save — caller decides when to persist.
 */
export const applyPaymentsToInvoice = (invoice, payments) => {
  const amountPaid = round2(
    (payments || [])
      .filter((p) => p.status === "received")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
  );
  const total = Number(invoice.totalAmount || invoice.amount || 0);
  const balanceDue = round2(Math.max(total - amountPaid, 0));

  let status = invoice.status;
  if (status !== "cancelled" && status !== "draft") {
    if (balanceDue <= 0 && total > 0) status = "paid";
    else if (amountPaid > 0) status = "partially_paid";
    else if (invoice.dueDate && new Date(invoice.dueDate) < new Date())
      status = "overdue";
    else status = "sent";
  }

  return { amountPaid, balanceDue, status };
};

// Generate payment numbers from the highest existing sequence instead of
// COUNT(*) + 1. COUNT-based numbering can reuse an already-existing number
// after rows are deleted, which causes Sequelize to throw a generic
// "Validation error" on the unique paymentNumber field during Razorpay
// checkout.
export const nextPaymentNumber = async (Payment) => {
  const year = new Date().getFullYear();
  const prefix = `PMT-${year}-`;
  // Payment numbers are short, human-facing identifiers; reading the existing
  // numbers avoids depending on a dialect-specific SQL cast/expression.
  const existing = await Payment.findAll({ attributes: ["paymentNumber"] });
  const latestNumber = existing.reduce((max, row) => {
    const value = String(row.paymentNumber || "");
    if (!value.startsWith(prefix)) return max;
    const n = Number(value.slice(prefix.length));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  const next = latestNumber + 1;

  return `${prefix}${String(next).padStart(5, "0")}`;
};
