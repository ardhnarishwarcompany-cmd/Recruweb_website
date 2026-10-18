import { Invoice, CrmClient, Payment } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";
import { sendInvoicePdf } from "../utils/invoicepdf.js";
import { computeInvoiceTotals } from "../utils/financeCalc.js";

const nextInvoiceNumber = async () => {
  const count = await Invoice.count();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
};

export const createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      title,
      amount,
      currency,
      status,
      issueDate,
      dueDate,
      notes,
      gstin,
      hsnSac,
      placeOfSupply,
      gstRate,
      tdsApplicable,
      tdsSection,
      tdsRate,
    } = req.body;
    if (!clientId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "clientId and amount are required" });
    }

    const client = await CrmClient.findByPk(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const isTdsApplicable = tdsApplicable === true || tdsApplicable === "true";
    const totals = computeInvoiceTotals({
      amount,
      gstRate: gstRate ?? 18,
      tdsApplicable: isTdsApplicable,
      tdsRate: tdsRate ?? 0,
      placeOfSupply: placeOfSupply || client.state || "",
    });

    const invoice = await Invoice.create({
      clientId,
      invoiceNumber: req.body.invoiceNumber || (await nextInvoiceNumber()),
      title,
      amount: totals.subtotal,
      currency: currency || "INR",
      status: status || "sent",
      issueDate: issueDate || new Date(),
      dueDate: dueDate || null,
      notes,
      gstin: gstin || client.gstin || null,
      hsnSac: hsnSac || "998513",
      placeOfSupply: placeOfSupply || client.state || null,
      gstRate: gstRate ?? 18,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      gstAmount: totals.gstAmount,
      tdsApplicable: isTdsApplicable,
      tdsSection: isTdsApplicable ? tdsSection || "194C" : null,
      tdsRate: isTdsApplicable ? (tdsRate ?? 0) : 0,
      tdsAmount: totals.tdsAmount,
      totalAmount: totals.totalAmount,
      amountPaid: 0,
      balanceDue: totals.totalAmount,
      fileUrl: req.file ? `/uploads/invoices/${req.file.filename}` : null,
      createdBy: req.user?.id,
    });

    await logAudit({
      req,
      action: "create",
      module: "invoice",
      targetType: "Invoice",
      targetId: invoice.id,
      description: `Invoice ${invoice.invoiceNumber} raised for client "${client.name}"`,
    });

    res
      .status(201)
      .json({ success: true, message: "Invoice created", data: invoice });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { clientId, status } = req.query;
    const where = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const invoices = await Invoice.findAll({
      where,
      include: [
        {
          model: CrmClient,
          as: "client",
          attributes: ["id", "name", "clientCode"],
        },
        { model: Payment, as: "payments" },
      ],
      order: [["issueDate", "DESC"]],
    });

    res
      .status(200)
      .json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: CrmClient, as: "client" },
        { model: Payment, as: "payments" },
      ],
    });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message,
    });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    const updates = { ...req.body };
    if (req.file) updates.fileUrl = `/uploads/invoices/${req.file.filename}`;

    const financeFieldsTouched = [
      "amount",
      "gstRate",
      "tdsApplicable",
      "tdsRate",
      "placeOfSupply",
    ].some((f) => f in updates);

    if (financeFieldsTouched) {
      const isTdsApplicable =
        (updates.tdsApplicable ?? invoice.tdsApplicable) === true ||
        (updates.tdsApplicable ?? invoice.tdsApplicable) === "true";
      const totals = computeInvoiceTotals({
        amount: updates.amount ?? invoice.amount,
        gstRate: updates.gstRate ?? invoice.gstRate,
        tdsApplicable: isTdsApplicable,
        tdsRate: updates.tdsRate ?? invoice.tdsRate,
        placeOfSupply: updates.placeOfSupply ?? invoice.placeOfSupply,
      });
      updates.amount = totals.subtotal;
      updates.cgstAmount = totals.cgstAmount;
      updates.sgstAmount = totals.sgstAmount;
      updates.igstAmount = totals.igstAmount;
      updates.gstAmount = totals.gstAmount;
      updates.tdsAmount = totals.tdsAmount;
      updates.totalAmount = totals.totalAmount;
      updates.tdsApplicable = isTdsApplicable;

      const paid = Number(invoice.amountPaid || 0);
      updates.balanceDue = Math.max(totals.totalAmount - paid, 0);
    }

    await invoice.update(updates);

    await logAudit({
      req,
      action: "update",
      module: "invoice",
      targetType: "Invoice",
      targetId: invoice.id,
      description: `Invoice ${invoice.invoiceNumber} updated`,
    });

    res
      .status(200)
      .json({ success: true, message: "Invoice updated", data: invoice });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update invoice",
      error: error.message,
    });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    await invoice.destroy();
    res.status(200).json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: CrmClient, as: "client" }],
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    await sendInvoicePdf(res, invoice, invoice.client);
  } catch (error) {
    console.error("Invoice PDF download failed:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to download invoice PDF" });
    }
  }
};
