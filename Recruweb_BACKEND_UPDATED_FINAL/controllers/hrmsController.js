import { CrmClient, HrmsSubscription, Invoice } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";
import { computeInvoiceTotals } from "../utils/financeCalc.js";
import {
  razorpayCreateOrderForInvoice,
  razorpayVerifyCheckout,
} from "./paymentController.js";
import { getHrmsPlan } from "../data/commercialCatalogue.js";

const GST_RATE = 18;

const nextInvoiceNumber = async () => {
  const count = await Invoice.count();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
};

const getClient = async (req) => {
  let client = await CrmClient.findOne({ where: { userId: req.user.id } });
  if (client) return client;

  client = await CrmClient.findOne({
    where: { email: req.user.email, userId: null },
  });

  if (client) {
    await client.update({ userId: req.user.id });
    return client;
  }

  const count = await CrmClient.count();
  return CrmClient.create({
    userId: req.user.id,
    clientCode: `CLT-${String(count + 1).padStart(5, "0")}`,
    name: req.user.name || "Client",
    email: req.user.email,
    status: "active",
    source: "website",
  });
};

export const getHrmsPlans = async (_req, res) => {
  try {
    // Kept as a separate endpoint so the public pricing page and client
    // portal use the same server-side commercial catalogue.
    const { HRMS_PLANS } = await import("../data/commercialCatalogue.js");
    res.json({ success: true, data: HRMS_PLANS });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load HRMS plans",
      error: error.message,
    });
  }
};

export const getMyHrmsSubscriptions = async (req, res) => {
  try {
    const client = await getClient(req);
    const rows = await HrmsSubscription.findAll({
      where: { clientId: client.id },
      include: [{ model: Invoice, as: "invoice", attributes: ["id", "invoiceNumber", "status", "totalAmount", "amountPaid", "balanceDue"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load HRMS subscriptions",
      error: error.message,
    });
  }
};

export const createHrmsPurchaseOrder = async (req, res) => {
  try {
    const { planId, employeeCount } = req.body;
    const plan = getHrmsPlan(planId);

    if (!plan) {
      return res.status(400).json({ success: false, message: "Invalid HRMS plan." });
    }

    const client = await getClient(req);

    let quantity = null;
    let baseAmount;

    if (plan.paymentType === "token") {
      baseAmount = Number(plan.token || 5000);
    } else {
      quantity = Math.max(1, Number(employeeCount || 0));
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Employee count is required for Standalone HRMS.",
        });
      }
      baseAmount = Number(plan.price) * quantity;
    }

    const totals = computeInvoiceTotals({
      amount: baseAmount,
      gstRate: GST_RATE,
      tdsApplicable: false,
      placeOfSupply: client.state || "",
    });

    const subscription = await HrmsSubscription.create({
      clientId: client.id,
      planId: plan.id,
      planName: plan.name,
      billingType: plan.paymentType,
      employeeCount: quantity,
      monthlyPrice: plan.paymentType === "monthly" ? Number(plan.price) : Number(plan.price || 0),
      contractMonths: plan.contractMonths || 11,
      tokenAmount: plan.paymentType === "token" ? Number(plan.token || 5000) : 0,
      status: "pending",
    });

    const invoice = await Invoice.create({
      clientId: client.id,
      invoiceNumber: await nextInvoiceNumber(),
      title: `HRMS Subscription — ${plan.name}`,
      amount: totals.subtotal,
      currency: "INR",
      status: "sent",
      issueDate: new Date(),
      dueDate: new Date(),
      notes: [
        "HRMS subscription purchase created from Client Portal.",
        `Plan: ${plan.name}`,
        `Contract: ${plan.contractMonths || 11} Months`,
        quantity ? `Employee count: ${quantity}` : "Payment: ₹5,000 agreement token",
        "Commercial prices are subject to GST and applicable statutory taxes.",
        `HRMS subscription ID: ${subscription.id}`,
      ].join("\n"),
      gstin: client.gstin || null,
      hsnSac: "998513",
      placeOfSupply: client.state || null,
      gstRate: GST_RATE,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      gstAmount: totals.gstAmount,
      tdsApplicable: false,
      tdsRate: 0,
      tdsAmount: 0,
      totalAmount: totals.totalAmount,
      amountPaid: 0,
      balanceDue: totals.totalAmount,
      createdBy: req.user.id,
    });

    await subscription.update({ invoiceId: invoice.id });

    try {
      const { order, payment, keyId } = await razorpayCreateOrderForInvoice(
        invoice,
        req.user.id,
      );

      await logAudit({
        req,
        action: "create",
        module: "hrms_subscription",
        targetType: "HrmsSubscription",
        targetId: subscription.id,
        description: `HRMS purchase order created for "${plan.name}" for client "${client.name}"`,
      });

      return res.status(201).json({
        success: true,
        data: {
          subscription,
          invoice,
          keyId,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          paymentId: payment.id,
          plan: {
            id: plan.id,
            name: plan.name,
            paymentType: plan.paymentType,
            employeeCount: quantity,
          },
          prefill: {
            name: client.name,
            email: client.email,
            contact: client.phone,
          },
        },
      });
    } catch (gatewayError) {
      // Do not pretend a payment was created when Razorpay is unavailable.
      await subscription.update({ status: "pending" });
      await invoice.update({ status: "draft" });
      throw gatewayError;
    }
  } catch (error) {
    const status =
      error.code === "RAZORPAY_NOT_CONFIGURED" ||
      error.code === "RAZORPAY_TEST_KEY_REJECTED"
        ? 503
        : 500;

    res.status(status).json({
      success: false,
      message: error.message || "Failed to start HRMS payment",
    });
  }
};

export const verifyHrmsPayment = async (req, res) => {
  try {
    const client = await getClient(req);
    const {
      invoiceId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!invoiceId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing HRMS payment verification fields.",
      });
    }

    const invoice = await Invoice.findOne({
      where: { id: invoiceId, clientId: client.id },
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "HRMS invoice not found." });
    }

    const subscription = await HrmsSubscription.findOne({
      where: { invoiceId: invoice.id, clientId: client.id },
    });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "HRMS subscription record not found.",
      });
    }

    const payment = await razorpayVerifyCheckout({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    const freshInvoice = await Invoice.findByPk(invoice.id);
    if (payment.status === "received") {
      const startedAt = subscription.startedAt || new Date();
      const endsAt = new Date(startedAt);
      endsAt.setMonth(endsAt.getMonth() + Number(subscription.contractMonths || 11));

      await subscription.update({
        status: "active",
        startedAt,
        endsAt,
      });
    }

    await logAudit({
      req,
      action: "update",
      module: "hrms_subscription",
      targetType: "HrmsSubscription",
      targetId: subscription.id,
      description: `HRMS subscription payment verified for "${subscription.planName}"`,
    });

    res.json({
      success: true,
      message: "HRMS payment verified successfully.",
      data: {
        payment,
        invoice: freshInvoice,
        subscription: await HrmsSubscription.findByPk(subscription.id),
      },
    });
  } catch (error) {
    res.status(error.code === "INVALID_SIGNATURE" ? 400 : 500).json({
      success: false,
      message: error.message || "HRMS payment verification failed.",
    });
  }
};
