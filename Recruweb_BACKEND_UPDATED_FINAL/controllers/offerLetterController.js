import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { Candidate } from "../models/index.js";
import { generateOfferLetterPDF } from "../utils/generateOfferLetter.js";
import { send } from "../utils/email.js";
import { logAudit } from "../utils/auditLogger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, "../assets/recruweb-logo.png");
const TMP_DIR = path.join(__dirname, "../uploads/documents");

function offerEmailHtml({ firstName }) {
  return `
  <div style="font-family:Arial,sans-serif;font-size:14px;color:#222;line-height:1.6;max-width:640px;margin:auto;">
    <img src="cid:recruweblogo" alt="Recruweb Resources Pvt. Ltd." style="width:70px;margin-bottom:16px;" />
    <p>Dear ${firstName},</p>
    <p>Greetings from <b>Recruweb Resources Pvt. Ltd.</b>!</p>
    <p>We are pleased to share your <b>Offer Letter</b> for the position offered to you. Kindly find the attached offer letter for your reference. Please read the document carefully and confirm your acceptance by replying to this email within the stipulated timeline.</p>
    <p>Additionally, kindly submit the following documents before your joining date for the completion of your onboarding formalities:</p>
    <p><b>Required Joining Documents:</b></p>
    <ul>
      <li>Updated Resume</li>
      <li>Passport-size Photograph</li>
      <li>Aadhaar Card</li>
      <li>PAN Card</li>
      <li>Educational Certificates/Mark Sheets (10th, 12th, Graduation, or latest qualification)</li>
      <li>Internship/Experience Certificates (if applicable)</li>
      <li>Latest Updated CV</li>
      <li>Bank Account Details (Cancelled Cheque or Passbook Copy)</li>
      <li>UAN/PF Details (if applicable)</li>
      <li>Any Government-issued Photo ID (if required)</li>
    </ul>
    <p>Please share scanned copies of the above documents by replying to this email or before your joining date.</p>
    <p>If you have any questions or require any clarification regarding the offer or joining process, please feel free to contact us. We will be happy to assist you.</p>
    <p>We look forward to welcoming you to the Recruweb Resources Pvt. Ltd. family and wish you a successful and rewarding journey with us.</p>
    <p>Best regards,<br/><b>HR Team</b><br/>Recruweb Resources Pvt. Ltd.</p>
  </div>`;
}

// ==========================================
// GENERATE + EMAIL OFFER LETTER
// POST /api/candidates/:id/offer-letter/generate
// Body: { position, joiningDate, duration, perProjectPay, postInternshipSalary, ... }
// ==========================================
export const generateAndSendOfferLetter = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }
    if (!candidate.email) {
      return res.status(400).json({ success: false, message: "Candidate has no email on file" });
    }

    const candidateName = `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || "Candidate";

    const offerData = {
      candidateName,
      position: req.body.position,
      joiningDate: req.body.joiningDate,
      duration: req.body.duration,
      workMode: req.body.workMode,
      officeAddress: req.body.officeAddress,
      workingDays: req.body.workingDays,
      officeTimings: req.body.officeTimings,
      perProjectPay: req.body.perProjectPay,
      postInternshipSalary: req.body.postInternshipSalary,
      noticePeriod: req.body.noticePeriod,
      offerDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
    // Drop undefined keys so generateOfferLetterPDF's own defaults kick in
    Object.keys(offerData).forEach((k) => offerData[k] === undefined && delete offerData[k]);

    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
    const filename = `offer-letter-${candidate.id}-${Date.now()}.pdf`;
    const pdfPath = path.join(TMP_DIR, filename);

    generateOfferLetterPDF(offerData, pdfPath, LOGO_PATH);

    const firstName = candidateName.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "").split(" ")[0];

    await send({
      to: candidate.email,
      subject: "Your Offer Letter from Recruweb Resources Pvt. Ltd.",
      html: offerEmailHtml({ firstName }),
      attachments: [
        { filename: "Offer_Letter.pdf", path: pdfPath, contentType: "application/pdf" },
        { filename: "logo.png", path: LOGO_PATH, cid: "recruweblogo" },
      ],
    });

    candidate.offerLetterUrl = `/uploads/documents/${filename}`;
    if (candidate.pipelineStage !== "Joined" && candidate.pipelineStage !== "Retained 90 Days") {
      candidate.pipelineStage = "Offer Released";
    }
    await candidate.save();

    await logAudit({
      req,
      action: "update",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Offer letter auto-generated and emailed to candidate",
    });

    res.json({
      success: true,
      message: `Offer letter generated and emailed to ${candidate.email}`,
      data: { offerLetterUrl: candidate.offerLetterUrl },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
