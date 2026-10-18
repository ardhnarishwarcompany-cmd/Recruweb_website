import {
  Candidate,
  CandidateSubmission,
  CrmClient,
  EmployeeJoining,
} from "../models/index.js";
import { Op } from "sequelize";
import { buildJoiningTracker } from "../utils/joiningTracker.js";

const latestJoiningFor = async (email) => {
  if (!email) return null;
  return EmployeeJoining.findOne({
    where: { email },
    order: [["createdAt", "DESC"]],
  });
};

const serializeCandidate = (candidate, joining, submission = null) => {
  const tracker = buildJoiningTracker(candidate, joining, submission);
  return {
    candidateId: candidate.id,
    candidateCode: candidate.candidateCode || null,
    name: `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim(),
    email: candidate.email || null,
    phone: candidate.phone || null,
    pipelineStage: candidate.pipelineStage,
    isRejected: Boolean(candidate.isRejected),
    rejectionReason: candidate.rejectionReason || null,
    submission: submission
      ? {
          id: submission.id,
          clientId: submission.clientId,
          requirementId: submission.requirementId,
          status: submission.status,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
          respondedAt: submission.respondedAt,
        }
      : null,
    tracker,
    updatedAt: candidate.updatedAt,
  };
};

// Admin/recruiter live tracker. Only real Candidate rows are returned.
export const getStaffTracker = async (req, res) => {
  try {
    const candidates = await Candidate.findAll({
      where: { isActive: true },
      order: [["updatedAt", "DESC"]],
      limit: 500,
      attributes: [
        "id",
        "candidateCode",
        "firstName",
        "lastName",
        "email",
        "phone",
        "pipelineStage",
        "timeline",
        "documents",
        "offerLetterUrl",
        "isRejected",
        "rejectionReason",
        "createdAt",
        "updatedAt",
      ],
    });

    const ids = candidates.map((c) => c.id);
    const submissions = ids.length
      ? await CandidateSubmission.findAll({
          where: { candidateId: { [Op.in]: ids } },
          order: [["createdAt", "DESC"]],
        })
      : [];

    const latestSubmission = new Map();
    for (const s of submissions) {
      if (!latestSubmission.has(s.candidateId)) {
        latestSubmission.set(s.candidateId, s);
      }
    }

    const data = [];
    for (const candidate of candidates) {
      const joining = await latestJoiningFor(candidate.email);
      data.push(
        serializeCandidate(
          candidate,
          joining,
          latestSubmission.get(candidate.id) || null,
        ),
      );
    }

    return res.json({
      success: true,
      count: data.length,
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Tracker] staff:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch live hiring tracker",
      error: error.message,
    });
  }
};

// Client tracker is strictly scoped to that client's real submissions.
export const getClientTracker = async (req, res) => {
  try {
    let client = await CrmClient.findOne({
      where: { userId: req.user.id },
      attributes: ["id", "userId"],
    });

    // Keep the portal connected to an existing CRM client record when one
    // exists for the same email. If none exists, create only the real account
    // profile required by this authenticated client.
    if (!client) {
      client = await CrmClient.findOne({
        where: { email: req.user.email, userId: null },
        attributes: ["id", "userId"],
      });
      if (client) {
        client.userId = req.user.id;
        await client.save();
      }
    }

    if (!client) {
      const count = await CrmClient.count();
      client = await CrmClient.create({
        userId: req.user.id,
        clientCode: `CLT-${String(count + 1).padStart(5, "0")}`,
        name: req.user.name || "Client",
        email: req.user.email,
        status: "active",
        source: "website",
      });
    }

    const submissions = await CandidateSubmission.findAll({
      where: { clientId: client.id },
      include: [{ model: Candidate, as: "candidate" }],
      order: [["updatedAt", "DESC"]],
      limit: 500,
    });

    const data = [];
    for (const submission of submissions) {
      if (!submission.candidate) continue;
      const joining = await latestJoiningFor(submission.candidate.email);
      data.push(
        serializeCandidate(submission.candidate, joining, submission),
      );
    }

    return res.json({
      success: true,
      count: data.length,
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Tracker] client:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch client hiring tracker",
      error: error.message,
    });
  }
};

// HR Partner sees candidates actually submitted by that account. No global candidate list and no dummy rows.
export const getHrPartnerTracker = async (req, res) => {
  try {
    const submissions = await CandidateSubmission.findAll({
      where: { submittedById: req.user.id },
      include: [{ model: Candidate, as: "candidate" }],
      order: [["updatedAt", "DESC"]],
      limit: 500,
    });

    const byId = new Map();

    // CandidateSubmission is the persisted ownership/link for external HR
    // Partners in this project. We deliberately do not infer access from a
    // non-persisted model property or expose the global candidate table.
    for (const s of submissions) {
      if (s.candidate) byId.set(s.candidate.id, s.candidate);
    }

    const submissionByCandidate = new Map();
    for (const s of submissions) {
      if (!submissionByCandidate.has(s.candidateId)) {
        submissionByCandidate.set(s.candidateId, s);
      }
    }

    const data = [];
    for (const candidate of byId.values()) {
      const joining = await latestJoiningFor(candidate.email);
      data.push(
        serializeCandidate(
          candidate,
          joining,
          submissionByCandidate.get(candidate.id) || null,
        ),
      );
    }

    data.sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
    );

    return res.json({
      success: true,
      count: data.length,
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Tracker] hr_partner:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch HR partner hiring tracker",
      error: error.message,
    });
  }
};
