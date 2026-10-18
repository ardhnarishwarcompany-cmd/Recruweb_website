import { NewJoinerForm, Candidate, CandidateSubmission } from "../models/index.js";
import { ROLES } from "../config/roles.js";
import { emitToRoom } from '../socket.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const emitTrackerForEmail = async (email) => {
  if (!email) return;
  const candidate = await Candidate.findOne({ where: { email } });
  if (!candidate) return;

  emitToRoom("staff", "tracker:update", {
    candidateId: candidate.id,
    updatedAt: new Date().toISOString(),
  });
  if (candidate.userId) {
    emitToRoom(`user:${candidate.userId}`, "tracker:update", {
      candidateId: candidate.id,
      updatedAt: new Date().toISOString(),
    });
  }

  const submissions = await CandidateSubmission.findAll({
    where: { candidateId: candidate.id },
    attributes: ["clientId"],
  });
  for (const submission of submissions) {
    emitToRoom(`client:${submission.clientId}`, "tracker:update", {
      candidateId: candidate.id,
      updatedAt: new Date().toISOString(),
    });
  }
};

// New joiner / newly applied-and-selected candidate submits their joining form
export const createNewJoinerForm = async (req, res) => {
  try {
    const record = await NewJoinerForm.create(req.body);
    await emitTrackerForEmail(record.email);

    try {
      await transporter.sendMail({
        from: `"Recruweb Website" <${process.env.FROM_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Joiner Form Submitted - ${record.firstName} ${record.lastName}`,
        html: `
          <h2>New Employee Joining Form Submitted</h2>
          <p><strong>Name:</strong> ${record.firstName} ${record.lastName}</p>
          <p><strong>Email:</strong> ${record.email}</p>
          <p><strong>Phone:</strong> ${record.phone}</p>
          <p><strong>Designation:</strong> ${record.designation || 'N/A'}</p>
          <p><strong>Department:</strong> ${record.department || 'N/A'}</p>
          <p><strong>Joining Date:</strong> ${record.joiningDate || 'N/A'}</p>
        `
      });
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Joining form submitted successfully! Our HR team will review your details.',
      data: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit joining form. Please try again.', error: error.message });
  }
};

export const getNewJoinerForms = async (req, res) => {
  try {
    const records = await NewJoinerForm.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch joining forms', error: error.message });
  }
};

export const getNewJoinerForm = async (req, res) => {
  try {
    const record = await NewJoinerForm.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch record', error: error.message });
  }
};

export const updateNewJoinerFormStatus = async (req, res) => {
  try {
    // Joining-form approval is a final HR/Admin action. Keep read access
    // broader, but never allow HR/recruiter/client users to approve it.
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin can approve or reject a joining form.",
      });
    }

    const { status } = req.body;
    const allowedStatuses = [
      "under-review",
      "documents-pending",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid joining-form status.",
      });
    }

    const record = await NewJoinerForm.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Joining form not found",
      });
    }

    if (status === "approved" && !record.declaration) {
      return res.status(400).json({
        success: false,
        message: "Candidate must accept the employee declaration before approval.",
      });
    }

    const previousStatus = record.status;
    record.status = status;
    await record.save();

    // Approval is the point at which the candidate becomes a real New Joiner.
    // Do not create fake employee records: the existing Candidate row is the
    // source of truth and is moved to the real "Joined" ATS stage.
    if (status === "approved") {
      const candidate = await Candidate.findOne({
        where: { email: record.email },
        order: [["updatedAt", "DESC"]],
      });

      if (candidate) {
        const timeline = Array.isArray(candidate.timeline)
          ? [...candidate.timeline]
          : [];

        const alreadyJoined = timeline.some(
          (item) => item?.stage === "Joined" && item?.employeeJoiningId === record.id,
        );

        if (!alreadyJoined) {
          timeline.push({
            stage: "Joined",
            changedAt: new Date().toISOString(),
            changedBy: req.user?.id || null,
            source: "joining_form_approval",
            newJoinerFormId: record.id,
          });
        }

        if (candidate.pipelineStage !== "Retained 90 Days") {
          candidate.pipelineStage = "Joined";
        }

        candidate.isRejected = false;
        candidate.rejectionReason = null;
        candidate.rejectedAt = null;
        candidate.timeline = timeline;
        await candidate.save();

        await logJoiningAudit(req, record, previousStatus, status, candidate.id);
      } else {
        await logJoiningAudit(req, record, previousStatus, status, null);
      }
    } else {
      await logJoiningAudit(req, record, previousStatus, status, null);
    }

    await emitTrackerForEmail(record.email);

    // Push a dedicated event so all live tracker screens refresh immediately.
    emitToRoom("staff", "tracker:joining_status", {
      joiningId: record.id,
      email: record.email,
      status: record.status,
      approvedBy: req.user?.id || null,
      updatedAt: new Date().toISOString(),
    });

    const candidate = await Candidate.findOne({ where: { email: record.email } });
    if (candidate?.userId) {
      emitToRoom(`user:${candidate.userId}`, "tracker:joining_status", {
        joiningId: record.id,
        status: record.status,
        updatedAt: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "Joining form approved. Candidate is now marked as a New Joiner."
          : `Joining form status updated to ${status}.`,
      data: record,
    });
  } catch (error) {
    console.error("[Employee Joining] Status update failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update onboarding status",
      error: error.message,
    });
  }
};

async function logJoiningAudit(req, record, previousStatus, status, candidateId) {
  try {
    const { logAudit } = await import("../utils/auditLogger.js");
    await logAudit({
      req,
      action: status === "approved" ? "approve" : "update",
      module: "employee_joining",
      targetType: "NewJoinerForm",
      targetId: record.id,
      description: `Joining form status changed from ${previousStatus} to ${status}${
        candidateId ? ` for candidate ${candidateId}` : ""
      }`,
    });
  } catch (auditError) {
    // Audit failure must not undo a successfully persisted onboarding decision.
    console.error("[Employee Joining] Audit log failed:", auditError.message);
  }
};

