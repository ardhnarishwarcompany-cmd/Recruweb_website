// generateOfferLetter.js
// Dynamic, branded Offer Letter PDF generator for Recruweb Resources Pvt. Ltd.
// Usage: node generateOfferLetter.js  (writes sample-offer-letter.pdf)
// In the real backend this is exported as a function: generateOfferLetterPDF(data) -> returns file path

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BLUE = "#29ABE2";
const BLACK = "#111111";
const DARKTEXT = "#1a1a1a";

function drawHeader(doc, logoPath) {
  const pageWidth = doc.page.width;

  // Black band across the top
  doc.rect(0, 0, pageWidth, 95).fill(BLACK);

  // Blue diagonal chevron band below it (the signature Recruweb cut)
  doc.moveTo(0, 95)
    .lineTo(pageWidth * 0.55, 95)
    .lineTo(pageWidth * 0.42, 150)
    .lineTo(0, 150)
    .closePath()
    .fill(BLACK);

  doc.moveTo(pageWidth * 0.55, 95)
    .lineTo(pageWidth, 95)
    .lineTo(pageWidth, 150)
    .lineTo(pageWidth * 0.42, 150)
    .closePath()
    .fill(BLUE);

  // Logo + company name (top-left, on black)
  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, 28, 18, { width: 40, height: 40 });
  }
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(11)
    .text("Recruweb Resources Pvt. Ltd.", 75, 33, { width: 260 });

  // OFFER LETTER title on the blue band
  doc.fillColor("#FFFFFF").font("Helvetica").fontSize(26)
    .text("OFFER LETTER", pageWidth * 0.42 + 20, 108, { width: pageWidth * 0.58 - 40 });
}

function drawFooter(doc) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const barY = pageHeight - 70;

  doc.rect(0, barY, pageWidth, 45).fill(BLUE);
  doc.fillColor("#FFFFFF").font("Helvetica").fontSize(9);
  doc.text("112, Ground H-Block, Sector-63, Noida", 40, barY + 16, { width: 300 });
  doc.text("www.recruweb.com", pageWidth - 260, barY + 8, { width: 220, align: "right" });
  doc.text("+91 9958256785", pageWidth - 260, barY + 24, { width: 220, align: "right" });

  doc.rect(0, barY + 45, pageWidth, 25).fill(BLACK);
}

function section(doc, title) {
  doc.moveDown(0.5);
  doc.fillColor(DARKTEXT).font("Helvetica-Bold").fontSize(12).text(title);
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(10.5).fillColor("#222");
}

function bullets(doc, items) {
  items.forEach((i) => doc.text("•  " + i, { indent: 10 }));
}

export function generateOfferLetterPDF(data, outputPath, logoPath) {
  const {
    candidateName,
    position = "Web Developer / Full Stack Developer / MERN Stack Developer",
    sisterCompany = "Ardhnarishwar",
    offerDate,
    joiningDate,
    duration = "1 to 3 Months (Based on Performance)",
    workMode = "WFH / WFO (as per management & project requirement)",
    officeAddress = "H-112, Sector 63, Noida, Uttar Pradesh (Near Electronic City Metro Station)",
    workingDays = "6 Days per Week",
    officeTimings = "9:00 AM – 6:00 PM",
    stipendNote = "After completion of the observation period, salary will be decided as per performance",
    perProjectPay = "₹2,000 per successfully completed project",
    postInternshipSalary = "₹20,000 per month",
    noticePeriod = "1 Month (minimum 15 days written notice before resignation)",
  } = data;

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 175, bottom: 95, left: 40, right: 40 },
    autoFirstPage: false,
  });
  doc.pipe(fs.createWriteStream(outputPath));

  // Draw the branded header + footer automatically on every page,
  // whether added explicitly (doc.addPage()) or by natural text overflow.
  doc.on("pageAdded", () => {
    // Temporarily remove margins so absolute-positioned header/footer text
    // near the page edges never triggers pdfkit's own auto page-break logic
    // (which would otherwise recurse infinitely on this same event).
    const saved = { ...doc.page.margins };
    doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };
    drawHeader(doc, logoPath);
    drawFooter(doc);
    doc.page.margins = saved;
    doc.x = 40;
    doc.y = 175;
  });
  doc.addPage();

  doc.fillColor(DARKTEXT).font("Helvetica").fontSize(10.5);
  doc.text(`Date: ${offerDate}`);
  doc.text("To,");
  doc.font("Helvetica-Bold").text(candidateName);
  doc.text(`Subject: Offer of Internship – ${position}`);
  doc.moveDown(0.3);
  const firstName = candidateName.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "").split(" ")[0];
  doc.font("Helvetica").text(`Dear ${firstName},`);
  doc.moveDown(0.3);
  doc.text(
    `We are pleased to offer you the position of ${position} Intern at Recruweb Resources Pvt. Ltd. (Sister Company: ${sisterCompany}). We are excited to welcome you to our team and look forward to your contribution to our growth. During your internship you will receive practical industry exposure, work on live projects, and gain hands-on experience under the guidance of experienced professionals.`,
    { align: "justify" }
  );

  section(doc, "1. Job Details");
  bullets(doc, [
    `Position: ${position} Intern`,
    `Internship Duration: ${duration}`,
    `Date of Joining: ${joiningDate}`,
    `Work Mode: ${workMode}`,
    `Office Address: ${officeAddress}`,
    `Working Days: ${workingDays}`,
    `Office Timings: ${officeTimings}`,
  ]);

  section(doc, "2. Internship Compensation & Salary Structure");
  bullets(doc, [
    `Duration: ${duration} (${stipendNote})`,
    `Project-Based Compensation: ${perProjectPay}`,
    `Post-Internship Fixed Salary (on confirmation): ${postInternshipSalary}, subject to management approval and performance evaluation`,
  ]);

  section(doc, "3. Notice Period");
  doc.text(noticePeriod);

  // ---- Page 2 : Roles, evaluation, leave/attendance policy ----
  doc.addPage();
  section(doc, "4. Roles & Responsibilities");
  bullets(doc, [
    "Frontend: responsive UIs with HTML5, CSS3, JavaScript, Bootstrap, React.js",
    "Backend: scalable APIs with Node.js & Express.js",
    "Database: design & manage MongoDB / MySQL schemas",
    "Full-stack MERN development, deployment & documentation",
    "Follow coding standards, meet deadlines, collaborate with the team",
  ]);

  section(doc, "5. Evaluation Parameters");
  bullets(doc, [
    "Technical knowledge, learning ability & code quality",
    "Discipline, attendance, punctuality",
    "Communication & professional conduct",
  ]);
  doc.moveDown(0.3);
  doc.font("Helvetica-Oblique").fontSize(10).fillColor("#a02020")
    .text("Note: Successful completion of the internship does not automatically guarantee permanent employment or a salary hike. Confirmation is subject to management evaluation. Unsatisfactory performance, discipline issues, or policy violations during or after the evaluation period may result in termination / non-confirmation of the offer, as per company policy.");
  doc.fillColor(DARKTEXT).font("Helvetica");

  section(doc, "6. Leave & Attendance Policy (summary)");
  bullets(doc, [
    "Medical leave: inform via email before 9:30 AM with proof",
    "Planned leave: request at least 7 days in advance",
    "Max 3 late arrivals permitted; arrival after 10:00 AM may count as Half Day",
  ]);

  // ---- Page 3 : Acceptance + signature ----
  doc.addPage();
  section(doc, "Acceptance of Offer");
  doc.text(
    "Please reply to this email confirming your acceptance of the above terms and conditions. We warmly welcome you to Recruweb Resources Pvt. Ltd. and wish you a successful and rewarding journey with us.",
    { align: "justify" }
  );

  doc.moveDown(4);
  doc.font("Helvetica-Bold").text("For Recruweb Resources Pvt. Ltd.");
  doc.moveDown(2);
  doc.text("Director");

  doc.end();
  return outputPath;
}

