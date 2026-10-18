import {
  CandidateSubmission,
  Candidate,
  CrmRequirement,
  CrmClient,
  User,
} from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";
import { emitToRoom } from "../socket.js";

// ==========================================================================
// Staff-side: submit a candidate against a client's requirement, and manage
// that submission through to interview/offer. This is what feeds the real
// rows the Client Portal reads for "Candidate Submissions", "Approve
// Candidates" and "Approve Offers" — recruiters create/advance these, the
// client only ever approves/rejects.
// ==========================================================================

export const createSubmission = async (req, res) => {
  try {
    const { candidateId, requirementId, submissionNotes } = req.body;
    if (!candidateId || !requirementId) {
      return res.status(400).json({
        success: false,
        message: "candidateId and requirementId are required",
      });
    }

    const requirement = await CrmRequirement.findByPk(requirementId);
    if (!requirement) {
      return res
        .status(404)
        .json({ success: false, message: "Requirement not found" });
    }
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }

    const submission = await CandidateSubmission.create({
      candidateId,
      requirementId,
      clientId: requirement.clientId,
      submissionNotes,
      submittedById: req.user?.id,
      status: "submitted",
    });

    if (
      candidate.pipelineStage === "New Lead" ||
      candidate.pipelineStage === "CV Received" ||
      candidate.pipelineStage === "AI Screened" ||
      candidate.pipelineStage === "Recruiter Reviewed"
    ) {
      candidate.pipelineStage = "Submitted To Client";
      await candidate.save();
    }

    emitToRoom("staff", "tracker:update", {
      candidateId: candidate.id,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    if (req.user?.id) {
      emitToRoom(`user:${req.user.id}`, "tracker:update", {
        candidateId: candidate.id,
        submissionId: submission.id,
        submissionStatus: submission.status,
        updatedAt: submission.updatedAt,
      });
    }
    emitToRoom(`client:${submission.clientId}`, "tracker:update", {
      candidateId: candidate.id,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });

    await logAudit({
      req,
      action: "create",
      module: "candidate_submission",
      targetType: "CandidateSubmission",
      targetId: submission.id,
      description: `Candidate #${candidateId} submitted to client for requirement #${requirementId}`,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Candidate submitted to client",
        data: submission,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit candidate",
      error: error.message,
    });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { clientId, requirementId, candidateId, status } = req.query;
    const where = {};
    if (clientId) where.clientId = clientId;
    if (requirementId) where.requirementId = requirementId;
    if (candidateId) where.candidateId = candidateId;
    if (status) where.status = status;

    const submissions = await CandidateSubmission.findAll({
      where,
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: [
            "id",
            "candidateCode",
            "firstName",
            "lastName",
            "email",
            "phone",
          ],
        },
        {
          model: CrmRequirement,
          as: "requirement",
          attributes: ["id", "title"],
        },
        {
          model: CrmClient,
          as: "client",
          attributes: ["id", "name", "clientCode"],
        },
        { model: User, as: "submittedBy", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res
      .status(200)
      .json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

export const getSubmission = async (req, res) => {
  try {
    const submission = await CandidateSubmission.findByPk(req.params.id, {
      include: [
        { model: Candidate, as: "candidate" },
        { model: CrmRequirement, as: "requirement" },
        { model: CrmClient, as: "client" },
        { model: User, as: "submittedBy", attributes: ["id", "name"] },
      ],
    });
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};

// Staff moves the submission forward (e.g. once the client approves the
// candidate in the portal and the interview actually happens) or extends an
// offer, which then shows up in the Client Portal awaiting Approve Offer.
export const updateSubmission = async (req, res) => {
  try {
    const submission = await CandidateSubmission.findByPk(req.params.id);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    const {
      status,
      offerAmount,
      offerCurrency,
      offerJoiningDate,
      offerNotes,
      submissionNotes,
    } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (offerAmount !== undefined) updates.offerAmount = offerAmount;
    if (offerCurrency !== undefined) updates.offerCurrency = offerCurrency;
    if (offerJoiningDate !== undefined)
      updates.offerJoiningDate = offerJoiningDate;
    if (offerNotes !== undefined) updates.offerNotes = offerNotes;
    if (submissionNotes !== undefined)
      updates.submissionNotes = submissionNotes;

    await submission.update(updates);

    emitToRoom("staff", "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    if (req.user?.id) {
      emitToRoom(`user:${req.user.id}`, "tracker:update", {
        candidateId: submission.candidateId,
        submissionId: submission.id,
        submissionStatus: submission.status,
        updatedAt: submission.updatedAt,
      });
    }
    emitToRoom(`client:${submission.clientId}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });

    await logAudit({
      req,
      action: "update",
      module: "candidate_submission",
      targetType: "CandidateSubmission",
      targetId: submission.id,
      description: `Submission #${submission.id} updated (status: ${submission.status})`,
    });

    res
      .status(200)
      .json({ success: true, message: "Submission updated", data: submission });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update submission",
      error: error.message,
    });
  }
};


// Internal approval gate for external HR Partner submissions.
// Pending submissions are invisible to the client portal until an authorized
// staff reviewer approves them. Approval changes the same source-of-truth row
// to `submitted`, which immediately makes it available to the client.
export const reviewSubmission = async (req, res) => {
  try {
    const submission = await CandidateSubmission.findByPk(req.params.id, {
      include: [
        { model: Candidate, as: "candidate" },
        { model: CrmRequirement, as: "requirement" },
        { model: CrmClient, as: "client" },
      ],
    });
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    const action = String(req.body?.action || "").toLowerCase();
    const note = String(req.body?.note || "").trim() || null;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action must be approve or reject",
      });
    }

    if (submission.status !== "pending-admin-approval") {
      return res.status(400).json({
        success: false,
        message: `Only pending-admin-approval submissions can be reviewed. Current status: ${submission.status}`,
      });
    }

    submission.status = action === "approve" ? "submitted" : "admin-rejected";
    submission.clientRemarks = note;
    submission.respondedAt = new Date();
    await submission.save();

    if (action === "approve" && submission.candidate) {
      const candidate = submission.candidate;
      if (
        ["New Lead", "CV Received", "AI Screened", "Recruiter Reviewed"].includes(
          candidate.pipelineStage,
        )
      ) {
        candidate.pipelineStage = "Submitted To Client";
        const timeline = Array.isArray(candidate.timeline) ? [...candidate.timeline] : [];
        timeline.push({
          stage: "Submitted To Client",
          note: `Submission #${submission.id} approved internally and forwarded to ${submission.client?.name || "client"}`,
          changedBy: req.user?.id || null,
          changedAt: new Date(),
        });
        candidate.timeline = timeline;
        candidate.changed("timeline", true);
        await candidate.save();
      }
    }

    emitToRoom("staff", "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    if (submission.submittedById) {
      emitToRoom(`user:${submission.submittedById}`, "tracker:update", {
        candidateId: submission.candidateId,
        submissionId: submission.id,
        submissionStatus: submission.status,
        updatedAt: submission.updatedAt,
      });
    }
    emitToRoom(`client:${submission.clientId}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });

    await logAudit({
      req,
      action: action === "approve" ? "approve" : "reject",
      module: "candidate_submission",
      targetType: "CandidateSubmission",
      targetId: submission.id,
      description:
        action === "approve"
          ? `Internally approved submission #${submission.id}; candidate forwarded to client`
          : `Internally rejected submission #${submission.id}`,
    });

    res.json({
      success: true,
      message: action === "approve"
        ? "Submission approved and forwarded to the client."
        : "Submission rejected internally.",
      data: submission,
    });
  } catch (error) {
    console.error("reviewSubmission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to review candidate submission",
      error: error.message,
    });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const submission = await CandidateSubmission.findByPk(req.params.id);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    await submission.destroy();
    res.status(200).json({ success: true, message: "Submission withdrawn" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete submission",
      error: error.message,
    });
  }
};
