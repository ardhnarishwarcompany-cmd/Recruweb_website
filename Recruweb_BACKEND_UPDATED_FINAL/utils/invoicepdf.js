import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const safeFilePathFromUrl = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return null;
  if (/^https?:\/\//i.test(fileUrl)) return null;

  const relative = fileUrl.replace(/^[/\\]+/, "");
  const resolved = path.resolve(process.cwd(), relative);
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const normalizedRoot = uploadsRoot.endsWith(path.sep)
    ? uploadsRoot
    : `${uploadsRoot}${path.sep}`;

  if (!resolved.startsWith(normalizedRoot)) return null;
  return resolved;
};

const money = (currency, value) =>
  `${String(currency || "INR").toUpperCase()} ${Number(value || 0).toLocaleString(
    "en-IN",
    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  )}`;

const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
};

const sendInvoicePdf = async (res, invoice, client = null) => {
  if (!invoice) {
    res.status(404).json({ success: false, message: "Invoice not found" });
    return;
  }

  // If Finance uploaded a genuine PDF, serve that exact file.
  const storedPath = safeFilePathFromUrl(invoice.fileUrl);
  if (storedPath && fs.existsSync(storedPath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${String(invoice.invoiceNumber || "invoice").replace(
        /[^a-zA-Z0-9._-]/g,
        "_",
      )}.pdf"`,
    );
    res.sendFile(storedPath);
    return;
  }

  // No uploaded PDF: generate a real invoice PDF from the persisted invoice.
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${String(invoice.invoiceNumber || "invoice").replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
    )}.pdf"`,
  );
  res.setHeader("Cache-Control", "private, no-store");

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  const currency = invoice.currency || "INR";
  const clientName = client?.name || "Client";
  const clientEmail = client?.email || "";
  const clientPhone = client?.phone || "";

  doc.fontSize(22).font("Helvetica-Bold").text("Recruweb Resources Pvt. Limited");
  doc.fontSize(10).font("Helvetica").fillColor("#475569").text(
    "Corporate Invoice",
  );
  doc.moveDown(1);

  doc.fillColor("#111827").fontSize(16).font("Helvetica-Bold").text(
    invoice.invoiceNumber || "Invoice",
  );
  doc.fontSize(10).font("Helvetica").fillColor("#475569")
    .text(`Issue Date: ${fmtDate(invoice.issueDate)}`)
    .text(`Due Date: ${fmtDate(invoice.dueDate)}`)
    .text(`Status: ${invoice.status || "sent"}`);

  doc.moveDown(1);
  doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("Bill To");
  doc.fontSize(10).font("Helvetica")
    .text(clientName)
    .text(clientEmail || "—")
    .text(clientPhone || "—");

  doc.moveDown(1);
  doc.fontSize(11).font("Helvetica-Bold").text("Description");
  doc.fontSize(10).font("Helvetica").text(invoice.title || "Professional services");

  doc.moveDown(1);
  const x = 50;
  const y = doc.y;
  doc.rect(x, y, 495, 24).fill("#eef2ff");
  doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold")
    .text("Particular", x + 8, y + 7)
    .text("Amount", x + 390, y + 7, { width: 95, align: "right" });

  let rowY = y + 34;
  const line = (label, value) => {
    doc.fillColor("#111827").fontSize(10).font("Helvetica")
      .text(label, x + 8, rowY)
      .text(money(currency, value), x + 390, rowY, { width: 95, align: "right" });
    rowY += 22;
  };

  line("Taxable Amount", invoice.amount);
  line(`GST (${Number(invoice.gstRate || 0)}%)`, invoice.gstAmount);
  if (Number(invoice.tdsAmount || 0) > 0) {
    line(`TDS (${Number(invoice.tdsRate || 0)}%)`, -Math.abs(Number(invoice.tdsAmount)));
  }

  doc.moveTo(x, rowY + 2).lineTo(x + 495, rowY + 2).strokeColor("#cbd5e1").stroke();
  rowY += 14;
  doc.fillColor("#111827").fontSize(12).font("Helvetica-Bold")
    .text("Total", x + 8, rowY)
    .text(money(currency, invoice.totalAmount), x + 390, rowY, {
      width: 95,
      align: "right",
    });

  rowY += 28;
  doc.fontSize(10).font("Helvetica")
    .text(`Amount Paid: ${money(currency, invoice.amountPaid)}`, x + 8, rowY)
    .text(`Balance Due: ${money(currency, invoice.balanceDue)}`, x + 8, rowY + 18);

  if (invoice.gstin) {
    doc.text(`GSTIN: ${invoice.gstin}`, x + 8, rowY + 36);
  }
  if (invoice.hsnSac) {
    doc.text(`HSN/SAC: ${invoice.hsnSac}`, x + 8, rowY + 54);
  }
  if (invoice.placeOfSupply) {
    doc.text(`Place of Supply: ${invoice.placeOfSupply}`, x + 8, rowY + 72);
  }
  if (invoice.notes) {
    doc.moveDown(1);
    doc.font("Helvetica-Bold").text("Notes");
    doc.font("Helvetica").text(String(invoice.notes));
  }

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#64748b").text(
    "This invoice was generated from the Recruweb finance system. Please retain it for your records.",
  );

  doc.end();
};

export { sendInvoicePdf };
export default sendInvoicePdf;
