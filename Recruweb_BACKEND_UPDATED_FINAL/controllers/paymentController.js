import { Op } from "sequelize";
import { Payment, Invoice, CrmClient } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";
import {
  applyPaymentsToInvoice,
  nextPaymentNumber,
} from "../utils/financeCalc.js";
import {
  getRazorpayClient,
  getPublicKeyId,
  getRazorpayDiagnostics,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from "../utils/razorpay.js";

// Recomputes and persists Invoice.amountPaid/balanceDue/status from its
// real Payment rows. Called after every create/update/delete below.
const resyncInvoice = async (invoiceId) => {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) return null;
  const payments = await Payment.findAll({ where: { invoiceId } });
  const { amountPaid, balanceDue, status } = applyPaymentsToInvoice(
    invoice,
    payments,
  );
  await invoice.update({ amountPaid, balanceDue, status });
  return invoice;
};

export const createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, mode, referenceNo, status, paymentDate, notes } =
      req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({
        success: false,
        message: "invoiceId and amount are required",
      });
    }

    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero.",
      });
    }

    const invoiceTotal = Number(invoice.totalAmount ?? invoice.amount ?? 0);
    const invoicePaid = Number(invoice.amountPaid || 0);
    const invoiceBalance = Math.max(
      Number(invoice.balanceDue || 0),
      invoiceTotal - invoicePaid,
    );
    if (invoiceBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "This invoice is already fully collected.",
      });
    }
    if (paymentAmount > invoiceBalance + 0.01) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds the outstanding balance of ₹${invoiceBalance.toFixed(2)}.`,
      });
    }

    const payment = await Payment.create({
      paymentNumber: await nextPaymentNumber(Payment),
      invoiceId,
      clientId: invoice.clientId,
      amount: paymentAmount,
      mode: mode || "bank_transfer",
      referenceNo,
      status: status || "received",
      paymentDate: paymentDate || new Date(),
      notes,
      recordedBy: req.user?.id,
    });

    await resyncInvoice(invoiceId);

    await logAudit({
      req,
      action: "create",
      module: "payment",
      targetType: "Payment",
      targetId: payment.id,
      description: `Payment ${payment.paymentNumber} of ${payment.amount} recorded against invoice ${invoice.invoiceNumber}`,
    });

    res
      .status(201)
      .json({ success: true, message: "Payment recorded", data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { invoiceId, clientId, status, mode } = req.query;
    const where = {};
    if (invoiceId) where.invoiceId = invoiceId;
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (mode) where.mode = mode;

    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: Invoice,
          as: "invoice",
          attributes: ["id", "invoiceNumber", "totalAmount"],
        },
        {
          model: CrmClient,
          as: "client",
          attributes: ["id", "name", "clientCode"],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    res
      .status(200)
      .json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        { model: Invoice, as: "invoice" },
        { model: CrmClient, as: "client" },
      ],
    });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    const nextAmount =
      req.body.amount !== undefined ? Number(req.body.amount) : Number(payment.amount);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      return res.status(400).json({ success: false, message: "Payment amount must be greater than zero." });
    }

    if (nextAmount !== Number(payment.amount)) {
      const invoice = await Invoice.findByPk(payment.invoiceId);
      const otherReceived = await Payment.sum("amount", {
        where: {
          invoiceId: payment.invoiceId,
          status: "received",
          id: { [Op.not]: payment.id },
        },
      });
      const total = Number(invoice?.totalAmount ?? invoice?.amount ?? 0);
      const maxAllowed = Math.max(total - Number(otherReceived || 0), 0);
      if (nextAmount > maxAllowed + 0.01) {
        return res.status(400).json({
          success: false,
          message: `Payment exceeds the outstanding balance of ₹${maxAllowed.toFixed(2)}.`,
        });
      }
    }

    await payment.update({ ...req.body, amount: nextAmount });
    await resyncInvoice(payment.invoiceId);

    await logAudit({
      req,
      action: "update",
      module: "payment",
      targetType: "Payment",
      targetId: payment.id,
      description: `Payment ${payment.paymentNumber} updated`,
    });

    res
      .status(200)
      .json({ success: true, message: "Payment updated", data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    const invoiceId = payment.invoiceId;
    await payment.destroy();
    await resyncInvoice(invoiceId);
    res.status(200).json({ success: true, message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};

// ============================================================================
// Razorpay LIVE online payments — a client pays their own invoice through
// Razorpay Checkout on the Client Portal. No amount, order id, payment id
// or "paid" status is ever invented here: the order comes from the real
// Razorpay API, and a payment is only ever marked "received" after Razorpay
// itself confirms it (checkout signature AND/OR webhook — see below).
// ============================================================================

// Creates a real Razorpay order for the given invoice's current balanceDue,
// and a matching "pending" Payment row to track it. Called from the Client
// Portal (see clientPortalController.createInvoicePaymentOrder), which is
// responsible for making sure `invoice` actually belongs to the requesting
// client before calling this.
export const razorpayCreateOrderForInvoice = async (invoice, recordedBy) => {
  if (!invoice) throw new Error("Invoice not found");

  // Older invoice rows may have balanceDue=0 because the Finance fields were
  // added after the row was created. Treat a non-paid invoice with a real
  // total/amount as payable instead of incorrectly returning "nothing due".
  const totalAmount = Number(
    invoice.totalAmount ?? invoice.amount ?? 0,
  );
  const storedBalance = Number(invoice.balanceDue);
  const amountPaid = Number(invoice.amountPaid || 0);
  const derivedBalance = Math.max(totalAmount - amountPaid, 0);
  const amountDue =
    storedBalance > 0
      ? storedBalance
      : derivedBalance > 0
        ? derivedBalance
        : 0;

  if (!(amountDue > 0)) {
    const err = new Error("This invoice has no outstanding balance to pay.");
    err.code = "NOTHING_DUE";
    throw err;
  }

  const razorpay = getRazorpayClient();

  // Razorpay expects the amount in the smallest currency unit (paise for INR).
  const amountInPaise = Math.round(amountDue * 100);

  let order;
  try {
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: String(invoice.currency || "INR").toUpperCase(),
      receipt: `inv_${invoice.id}_${Date.now()}`,
      notes: {
        invoiceId: String(invoice.id),
        invoiceNumber: invoice.invoiceNumber,
        clientId: String(invoice.clientId),
      },
    });
  } catch (error) {
    const diagnostics = getRazorpayDiagnostics();
    console.error("[Razorpay] Order creation failed", {
      ...diagnostics,
      statusCode: error?.statusCode || error?.status,
      code: error?.error?.code || error?.code || "",
      description: error?.error?.description || error?.description || error?.message || "",
    });
    const wrapped = new Error(
      error?.error?.description ||
      error?.description ||
      error?.message ||
      "Razorpay could not create the payment order.",
    );
    wrapped.code = "RAZORPAY_API_ERROR";
    wrapped.statusCode = error?.statusCode || error?.status || 502;
    throw wrapped;
  }

  const payment = await Payment.create({
    paymentNumber: await nextPaymentNumber(Payment),
    invoiceId: invoice.id,
    clientId: invoice.clientId,
    amount: amountDue,
    currency: invoice.currency || "INR",
    mode: "online",
    status: "pending",
    paymentDate: new Date(),
    gateway: "razorpay",
    gatewayOrderId: order.id,
    recordedBy: recordedBy || null,
    notes: "Created via Razorpay Checkout (Client Portal)",
  });

  return { order, payment, keyId: getPublicKeyId() };
};

// Confirms a checkout using the signature Razorpay Checkout hands back to
// the browser on success. This gives the UI an instant answer, but the
// webhook (razorpayWebhookHandler below) is what ultimately/authoritatively
// marks money as received, since a client could close the tab before this
// runs.
export const razorpayVerifyCheckout = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const payment = await Payment.findOne({
    where: { gatewayOrderId: razorpayOrderId, gateway: "razorpay" },
  });

  if (!payment) {
    const err = new Error("No matching Razorpay order found for this payment.");
    err.code = "PAYMENT_NOT_FOUND";
    throw err;
  }

  /*
   * SECURITY:
   * Razorpay's documentation requires the order_id used for HMAC verification
   * to come from our own database, not from the browser callback.
   */
  const storedOrderId = String(payment.gatewayOrderId || "").trim();

  const valid = verifyCheckoutSignature({
    orderId: storedOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!valid) {
    const diagnostics = getRazorpayDiagnostics();
    const callbackOrderId = String(razorpayOrderId || "").trim();

    console.error("[Razorpay] Checkout signature mismatch", {
      ...diagnostics,
      storedOrderId,
      receivedOrderId: callbackOrderId,
      orderMatchesStored: callbackOrderId === storedOrderId,
      paymentIdPrefix: String(razorpayPaymentId || "").slice(0, 12),
      signatureLength: String(razorpaySignature || "").length,
    });

    // A bad browser callback must not destroy a pending order. Razorpay's
    // webhook can still deliver a genuine payment.captured event for this
    // order. Keep the payment pending so a transient/client-side callback
    // problem does not turn a real payment into a permanently failed row.
    await payment.update({
      gatewayPaymentId: razorpayPaymentId || payment.gatewayPaymentId || null,
      gatewaySignature: razorpaySignature || payment.gatewaySignature || null,
    });

    const err = new Error(
      callbackOrderId && callbackOrderId !== storedOrderId
        ? "Razorpay verification failed because the checkout order does not match the invoice order. Please restart payment from this invoice."
        : "Razorpay signature verification failed. Confirm that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET belong to the same Razorpay TEST/ LIVE account, then restart the backend.",
    );
    err.code = "INVALID_SIGNATURE";
    throw err;
  }

  /*
   * Signature is valid. Confirm the payment against Razorpay before changing
   * the invoice. This also prevents accepting a payment id belonging to a
   * different order.
   */
  const razorpay = getRazorpayClient();
  const gatewayPayment = await razorpay.payments.fetch(razorpayPaymentId);

  const expectedAmount = Math.round(Number(payment.amount) * 100);
  const gatewayAmount = Number(gatewayPayment.amount);
  const gatewayOrderId = String(gatewayPayment.order_id || "").trim();
  const expectedCurrency = String(payment.currency || "INR").toUpperCase();
  const gatewayCurrency = String(gatewayPayment.currency || "").toUpperCase();

  if (
    gatewayOrderId !== storedOrderId ||
    gatewayAmount !== expectedAmount ||
    gatewayCurrency !== expectedCurrency
  ) {
    await payment.update({
      status: "failed",
      gatewayPaymentId: razorpayPaymentId,
      gatewaySignature: razorpaySignature,
      gatewayRaw: JSON.stringify(gatewayPayment),
    });

    const err = new Error(
      "Razorpay payment details do not match the invoice order.",
    );
    err.code = "PAYMENT_DETAILS_MISMATCH";
    throw err;
  }

  await payment.update({
    gatewayPaymentId: razorpayPaymentId,
    gatewaySignature: razorpaySignature,
    referenceNo: razorpayPaymentId,
    gatewayRaw: JSON.stringify(gatewayPayment),
  });

  /*
   * Razorpay can return 'authorized' before capture. Only a captured payment
   * is treated as received. The webhook remains the final reliable path.
   */
  if (gatewayPayment.status === "captured") {
    if (payment.status !== "received") {
      await payment.update({ status: "received" });
      await resyncInvoice(payment.invoiceId);
    }
  } else if (gatewayPayment.status === "authorized") {
    if (payment.status !== "received") {
      await payment.update({ status: "pending" });
    }
  } else if (gatewayPayment.status === "failed") {
    await payment.update({ status: "failed" });
    const err = new Error("Razorpay reports this payment as failed.");
    err.code = "GATEWAY_PAYMENT_FAILED";
    throw err;
  }

  return payment;
};

// POST /api/payments/webhook/razorpay — mounted with a raw body parser
// (see backend/index.js) BEFORE express.json(), because signature
// verification needs the exact raw bytes Razorpay signed.
export const razorpayWebhookHandler = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body; // Buffer, thanks to express.raw()

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const eventType = event.event;
    const entity = event?.payload?.payment?.entity;

    if (!entity) {
      return res
        .status(200)
        .json({ success: true, message: "Ignored (no payment entity)" });
    }

    const orderId = entity.order_id;
    const payment = await Payment.findOne({
      where: { gatewayOrderId: orderId, gateway: "razorpay" },
    });

    if (!payment) {
      // Order wasn't created by this app (or already cleaned up) — nothing to do.
      return res
        .status(200)
        .json({ success: true, message: "No matching payment" });
    }

    if (eventType === "payment.captured") {
      if (payment.status !== "received") {
        await payment.update({
          status: "received",
          gatewayPaymentId: entity.id,
          referenceNo: entity.id,
          gatewayRaw: JSON.stringify(entity),
        });
        await resyncInvoice(payment.invoiceId);
      }
    } else if (eventType === "payment.failed") {
      await payment.update({
        status: "failed",
        gatewayPaymentId: entity.id,
        gatewayRaw: JSON.stringify(entity),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Webhook processing failed",
        error: error.message,
      });
  }
};

// GET /api/finance/collections — invoices with an outstanding balance,
// i.e. what's yet to be collected. Purely derived from real Invoice rows.
export const getCollections = async (req, res) => {
  try {
    const { Op } = await import("sequelize");
    const invoices = await Invoice.findAll({
      where: {
        status: { [Op.notIn]: ["draft", "cancelled", "paid"] },
      },
      include: [
        {
          model: CrmClient,
          as: "client",
          attributes: ["id", "name", "clientCode", "email", "phone"],
        },
        { model: Payment, as: "payments" },
      ],
      order: [["dueDate", "ASC"]],
    });

    const today = new Date();
    const data = invoices
      .map((inv) => {
        const json = inv.toJSON();
        const total = Number(json.totalAmount ?? json.amount ?? 0);
        const paid = Number(json.amountPaid || 0);
        const derivedBalance = Math.max(total - paid, 0);
        const balanceDue = Math.max(Number(json.balanceDue || 0), derivedBalance);
        const overdueDays =
          inv.dueDate && new Date(inv.dueDate) < today
            ? Math.floor((today - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24))
            : 0;
        return { ...json, balanceDue, overdueDays };
      })
      .filter((inv) => inv.balanceDue > 0);

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch collections",
      error: error.message,
    });
  }
};
