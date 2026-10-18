import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Candidate,
  Job,
  Branch,
  User,
  EmployeeJoining,
  CandidateSubmission,
} from "../models/index.js";
import { PIPELINE_STAGES } from "../models/Candidate.js";
import { logAudit } from "../utils/auditLogger.js";
import { parseResume } from "../utils/resumeParser.js";
import { buildJoiningTracker } from "../utils/joiningTracker.js";
import { emitToRoom } from "../socket.js";
import { sendUploadedFile } from "../utils/findUploadedFile.js";


// Inline authenticated file preview for ATS PDFs/documents. The existing
// /uploads static mount remains available, but these endpoints give the admin
// UI a reliable browser preview even when a stored path was generated on an
// older deployment. sendUploadedFile() also falls back to a basename search
// across every uploads/ subfolder when the exact recorded path is missing,
// so a file that only *moved* (rather than actually being deleted) still
// previews instead of showing a false "file not found" error.
const sendCandidateStoredFile = sendUploadedFile;

export const previewCandidateDocument = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    const index = Number(req.params.index);
    const doc = Array.isArray(candidate.documents) ? candidate.documents[index] : null;
    if (!doc?.path) return res.status(404).json({ success: false, message: "Document not found" });
    return sendCandidateStoredFile(res, doc.path, doc.name || `candidate-document-${index + 1}`);
  } catch (error) {
    console.error("previewCandidateDocument error:", error);
    return res.status(500).json({ success: false, message: "Failed to preview document" });
  }
};

export const previewOfferLetter = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    if (!candidate.offerLetterUrl) {
      return res.status(404).json({ success: false, message: "Offer letter not found" });
    }
    return sendCandidateStoredFile(res, candidate.offerLetterUrl, `offer-letter-${candidate.id}.pdf`);
  } catch (error) {
    console.error("previewOfferLetter error:", error);
    return res.status(500).json({ success: false, message: "Failed to preview offer letter" });
  }
};

// ==========================================
// CREATE CANDIDATE
// ==========================================
export const createCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create({
      ...req.body,
      createdBy: req.user.id,
      timeline: [
        {
          stage: "New Lead",
          changedBy: req.user.id,
          changedAt: new Date(),
        },
      ],
    });

    await logAudit({
      req,
      action: "create",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: `Candidate ${candidate.firstName} ${
        candidate.lastName || ""
      } created`,
      changes: {
        before: null,
        after: candidate.toJSON(),
      },
    });

    res.status(201).json({
      success: true,
      data: candidate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// UPLOAD RESUME
// ==========================================
export const uploadResume = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume required",
      });
    }

    const parsed = await parseResume(req.file.path);

    candidate.resume = `/uploads/resumes/${req.file.filename}`;
    candidate.resumeText = parsed.resumeText;
    candidate.aiScore = parsed.aiScore;
    candidate.aiSummary = parsed.aiSummary;
    candidate.skills = parsed.skills;
    candidate.experience = parsed.experience;
    candidate.education = parsed.education;

    if (!candidate.email && parsed.email) {
      candidate.email = parsed.email;
    }

    if (!candidate.phone && parsed.phone) {
      candidate.phone = parsed.phone;
    }

    const timeline = candidate.timeline || [];

    if (candidate.pipelineStage === "New Lead") {
      timeline.push({
        stage: "CV Received",
        changedBy: req.user.id,
        changedAt: new Date(),
      });
    }

    timeline.push({
      stage: "AI Screened",
      changedBy: req.user.id,
      changedAt: new Date(),
    });

    candidate.pipelineStage = "AI Screened";
    candidate.timeline = timeline;
    candidate.changed("timeline", true);

    await candidate.save();

    await logAudit({
      req,
      action: "resume_uploaded",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Resume uploaded and AI parsed",
    });

    res.json({
      success: true,
      data: candidate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// ADD CANDIDATE NOTE
// ==========================================
export const addCandidateNote = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const notes = candidate.notes || [];

    notes.push({
      text: req.body.note,
      createdBy: req.user.id,
      createdAt: new Date(),
    });

    candidate.notes = notes;
    candidate.changed("notes", true);

    await candidate.save();

    await logAudit({
      req,
      action: "note_added",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Candidate note added",
    });

    res.json({
      success: true,
      data: candidate.notes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// GET CANDIDATE TIMELINE
// ==========================================
export const getCandidateTimeline = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      data: candidate.timeline || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// UPLOAD DOCUMENT
// ==========================================
export const uploadCandidateDocument = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const documents = candidate.documents || [];

    documents.push({
      name: req.body.label || req.file.originalname,
      path: `/uploads/documents/${req.file.filename}`,
      uploadedAt: new Date(),
      uploadedByCandidate: false,
      status: "pending",
      verifiedBy: null,
      verifiedAt: null,
      remarks: null,
    });

    candidate.documents = documents;
    candidate.changed("documents", true);

    await candidate.save();

    await logAudit({
      req,
      action: "document_upload",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Candidate document uploaded",
    });

    res.json({
      success: true,
      data: candidate.documents,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// VERIFY / REJECT A DOCUMENT
// ==========================================
export const verifyCandidateDocument = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }

    const { status, remarks } = req.body;
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be "verified" or "rejected"',
      });
    }

    const documents = Array.isArray(candidate.documents)
      ? [...candidate.documents]
      : [];
    const index = Number(req.params.index);
    const doc = documents[index];
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    documents[index] = {
      ...doc,
      status,
      remarks: remarks || null,
      verifiedBy: req.user?.id ?? null,
      verifiedByName: req.user?.name ?? null,
      verifiedAt: new Date(),
    };
    candidate.documents = documents;
    candidate.changed("documents", true);
    await candidate.save();

    await logAudit({
      req,
      action: "update",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: `Document "${doc.name}" ${status} for ${candidate.firstName} ${candidate.lastName}`,
    });

    res.json({ success: true, data: candidate.documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// JOINING TRACKER
// ==========================================
export const getCandidateTracker = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }
    const joining = await EmployeeJoining.findOne({
      where: { email: candidate.email },
      order: [["createdAt", "DESC"]],
    });
    res
      .status(200)
      .json({ success: true, data: buildJoiningTracker(candidate, joining) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// UPLOAD OFFER LETTER
// ==========================================
export const uploadOfferLetter = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Offer letter file is required",
      });
    }

    candidate.offerLetterUrl = `/uploads/documents/${req.file.filename}`;
    if (
      candidate.pipelineStage !== "Joined" &&
      candidate.pipelineStage !== "Retained 90 Days"
    ) {
      candidate.pipelineStage = "Offer Released";
    }
    await candidate.save();

    await logAudit({
      req,
      action: "update",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Offer letter uploaded for candidate",
    });

    res.json({
      success: true,
      message: "Offer letter uploaded successfully",
      data: { offerLetterUrl: candidate.offerLetterUrl },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// GET ALL CANDIDATES
// ==========================================
export const getCandidates = async (req, res) => {
  try {
    const {
      search,
      stage,
      recruiter,
      branch,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};

    if (stage) where.pipelineStage = stage;
    if (recruiter) where.assignedRecruiterId = recruiter;
    if (branch) where.branchId = branch;
    where.isActive = true;

    if (search) {
      where[Op.or] = [
        {
          firstName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          lastName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          email: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          phone: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    const pageNo = Number(page);
    const pageLimit = Number(limit);

    const { rows, count } = await Candidate.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: "job",
        },
        {
          model: Branch,
          as: "branch",
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["id", "name", "email"],
        },
      ],
      limit: pageLimit,
      offset: (pageNo - 1) * pageLimit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      count,
      page: pageNo,
      totalPages: Math.ceil(count / pageLimit),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// GET SINGLE CANDIDATE
// ==========================================
export const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          as: "job",
        },
        {
          model: Branch,
          as: "branch",
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      data: candidate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// UPDATE CANDIDATE
// ==========================================
export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const before = candidate.toJSON();

    await candidate.update(req.body);

    await logAudit({
      req,
      action: "update",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Candidate updated",
      changes: {
        before,
        after: candidate.toJSON(),
      },
    });

    res.json({
      success: true,
      data: candidate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// DELETE CANDIDATE (Soft Delete)
// ==========================================
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.isActive = false;

    await candidate.save();

    await logAudit({
      req,
      action: "delete",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Candidate deleted",
    });

    res.json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// REJECT CANDIDATE (performance / evaluation based)
// ==========================================
export const rejectCandidate = async (req, res) => {
  try {
    const { reason } = req.body;
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.isRejected = true;
    candidate.rejectionReason = reason || null;
    candidate.rejectedAt = new Date();

    const timeline = candidate.timeline || [];
    timeline.push({
      stage: "Rejected",
      note: reason || "Rejected by recruiter",
      at: new Date(),
      by: req.user?.id || null,
    });
    candidate.timeline = timeline;

    await candidate.save();

    await logAudit({
      req,
      action: "update",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: `Candidate rejected${reason ? `: ${reason}` : ""}`,
    });

    res.json({
      success: true,
      message: "Candidate rejected",
      data: candidate,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// UN-REJECT CANDIDATE (undo a rejection)
// ==========================================
export const unrejectCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.isRejected = false;
    candidate.rejectionReason = null;
    candidate.rejectedAt = null;
    await candidate.save();

    await logAudit({
      req,
      action: "update",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: "Candidate rejection reversed",
    });

    res.json({ success: true, message: "Candidate restored to pipeline", data: candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// UPDATE PIPELINE STAGE
// ==========================================
export const updatePipelineStage = async (req, res) => {
  try {
    const { stage } = req.body;

    if (!PIPELINE_STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pipeline stage",
      });
    }

    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.pipelineStage = stage;

    const timeline = candidate.timeline || [];

    timeline.push({
      stage,
      changedBy: req.user.id,
      changedAt: new Date(),
    });

    candidate.timeline = timeline;
    candidate.changed("timeline", true);

    await candidate.save();

    // Push a lightweight live-tracker invalidation. Portals re-fetch their
    // own scoped tracker data over REST, so no candidate data is broadcast
    // to an unauthorized client.
    emitToRoom("staff", "tracker:update", {
      candidateId: candidate.id,
      pipelineStage: candidate.pipelineStage,
      updatedAt: candidate.updatedAt,
    });
    if (candidate.userId) {
      emitToRoom(`user:${candidate.userId}`, "tracker:update", {
        candidateId: candidate.id,
        pipelineStage: candidate.pipelineStage,
        updatedAt: candidate.updatedAt,
      });
    }

    const candidateSubmissions = await CandidateSubmission.findAll({
      where: { candidateId: candidate.id },
      attributes: ["clientId"],
    });
    for (const submission of candidateSubmissions) {
      emitToRoom(`client:${submission.clientId}`, "tracker:update", {
        candidateId: candidate.id,
        pipelineStage: candidate.pipelineStage,
        updatedAt: candidate.updatedAt,
      });
    }

    await logAudit({
      req,
      action: "pipeline_change",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: `Pipeline moved to ${stage}`,
    });

    res.json({
      success: true,
      data: candidate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// UPDATE RATING
// ==========================================
export const updateRating = async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.rating = rating;

    await candidate.save();

    await logAudit({
      req,
      action: "rating_updated",
      module: "candidate",
      targetType: "Candidate",
      targetId: candidate.id,
      description: `Candidate rating updated to ${rating}`,
    });

    res.json({
      success: true,
      data: candidate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// PREVIEW RESUME
// ==========================================
export const previewResume = async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!candidate.resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not uploaded",
      });
    }

    // Stream the resume inline (same authenticated, path-safe approach used
    // by previewCandidateDocument / previewOfferLetter below) instead of
    // handing back a raw /uploads static URL. Returning a raw URL meant the
    // browser navigated straight to the static file: if that file was ever
    // missing (older deployment, moved disk, etc.) the request fell all the
    // way through to the SPA catch-all route and showed the confusing
    // "Frontend build not found" page instead of a real 404.
    const ext = path.extname(candidate.resume) || ".pdf";
    return sendCandidateStoredFile(
      res,
      candidate.resume,
      `resume-${candidate.id}${ext}`,
    );
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
