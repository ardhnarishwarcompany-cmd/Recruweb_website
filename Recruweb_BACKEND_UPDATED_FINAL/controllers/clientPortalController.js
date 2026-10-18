import { Op } from "sequelize";
import {
  CrmClient,
  CrmRequirement,
  CandidateSubmission,
  Candidate,
  Invoice,
  ClientMessage,
  CalendarEvent,
  User,
} from "../models/index.js";
import { sequelize } from "../config/db.js";
import { SUBMISSION_STATUSES } from "../models/CandidateSubmission.js";
import { logAudit } from "../utils/auditLogger.js";
import { generateMeetingRoom } from "../utils/meetingRoom.js";
import { emitToRoom } from "../socket.js";
import { draftChatReply } from "../utils/chatAI.js";
import sendInvoicePdf from "../utils/invoicepdf.js";
import {
  razorpayCreateOrderForInvoice,
  razorpayVerifyCheckout,
} from "./paymentController.js";

// ==========================================================================
// Client Portal (Phase 7)
// Every endpoint here is scoped to req.user (the logged-in client, role =
// "client"). There is no mock/sample data anywhere in this file — every
// response is read from, or written to, the real MySQL tables (crm_clients,
// crm_requirements, candidate_submissions, invoices, client_messages,
// calendar_events) via Sequelize, exactly like candidatePortalController.js
// does for the Candidate Portal.
// ==========================================================================

// Finds this user's CrmClient record (crm_clients.userId), auto-creating a
// bare one on first visit so the portal always has a real row to read/write
// instead of falling back to placeholder data.
const getOrCreateProfile = async (req) => {
  let client = await CrmClient.findOne({ where: { userId: req.user.id } });
  if (client) return client;

  // First-time portal visit: try to adopt an existing CRM client record
  // created by staff for this same email before creating a brand-new one,
  // so history (requirements, contracts, notes) isn't lost.
  client = await CrmClient.findOne({
    where: { email: req.user.email, userId: null },
  });

  if (client) {
    client.userId = req.user.id;
    await client.save();
    return client;
  }

  const count = await CrmClient.count();
  client = await CrmClient.create({
    userId: req.user.id,
    clientCode: `CLT-${String(count + 1).padStart(5, "0")}`,
    name: req.user.name || "Client",
    email: req.user.email,
    status: "active",
    source: "website",
  });
  return client;
};

//
// ==========================================
// PROFILE
// ==========================================
//
export const getMyProfile = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const full = await CrmClient.findByPk(client.id, {
      include: [
        {
          model: User,
          as: "accountManager",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });
    res.status(200).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
      error: error.message,
    });
  }
};

// Fields the client is allowed to edit on their own profile. Internal-only
// fields (accountManagerId, status, source, branchId, clientCode, tags, ...)
// are deliberately excluded.
const EDITABLE_FIELDS = [
  "name",
  "industry",
  "website",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "country",
  "billingCurrency",
];

export const updateMyProfile = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    await client.update(updates);

    await logAudit({
      req,
      action: "update",
      module: "client_portal",
      targetType: "CrmClient",
      targetId: client.id,
      description: "Client updated their own profile",
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

//
// ==========================================
// DASHBOARD — Open Positions / Candidate Submissions / Interview Schedule
// ==========================================
//
export const getDashboard = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);

    const [
      openPositions,
      totalRequirements,
      submissions,
      pendingOffers,
      unreadMessages,
    ] = await Promise.all([
      CrmRequirement.count({ where: { clientId: client.id, status: "open" } }),
      CrmRequirement.count({ where: { clientId: client.id } }),
      CandidateSubmission.count({ where: { clientId: client.id } }),
      CandidateSubmission.count({
        where: { clientId: client.id, status: "offer-extended" },
      }),
      ClientMessage.count({
        where: { clientId: client.id, senderRole: "staff", isRead: false },
      }),
    ]);

    // Upcoming interviews scoped to this client's own candidate submissions.
    const submissionRows = await CandidateSubmission.findAll({
      where: { clientId: client.id },
      attributes: ["candidateId"],
    });
    const candidateIds = [...new Set(submissionRows.map((s) => s.candidateId))];

    let interviewCount = 0;
    if (candidateIds.length) {
      interviewCount = await CalendarEvent.count({
        where: {
          relatedType: "candidate",
          relatedId: candidateIds,
          eventType: "interview",
          status: "scheduled",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        clientName: client.name,
        openPositions,
        totalRequirements,
        candidateSubmissions: submissions,
        upcomingInterviews: interviewCount,
        pendingOfferApprovals: pendingOffers,
        unreadMessages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};

//
// ==========================================
// REQUIREMENTS — Create Requirement / Track Jobs
// ==========================================
//
export const createRequirement = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);

    const {
      title,
      description,
      department,
      positions,
      skillsRequired,
      experienceLevel,
      employmentType,
      location,
      salaryMin,
      salaryMax,
      priority,
      targetDate,
    } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Job title is required" });
    }

    const requirement = await CrmRequirement.create({
      clientId: client.id,
      title,
      description,
      department,
      positions: positions || 1,
      skillsRequired: skillsRequired || [],
      experienceLevel,
      employmentType: employmentType || "full-time",
      location,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      priority: priority || "medium",
      targetDate: targetDate || null,
      status: "open",
    });

    await logAudit({
      req,
      action: "create",
      module: "client_portal",
      targetType: "CrmRequirement",
      targetId: requirement.id,
      description: `Client "${client.name}" raised requirement "${requirement.title}"`,
    });

    res.status(201).json({
      success: true,
      message:
        "Requirement submitted successfully. Your recruiter will pick it up shortly.",
      data: requirement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create requirement",
      error: error.message,
    });
  }
};

// Track Jobs — every requirement this client has ever raised, with live
// status and how many candidates have been submitted against each.
export const getMyRequirements = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const { status } = req.query;
    const where = { clientId: client.id };
    if (status) where.status = status;

    const requirements = await CrmRequirement.findAll({
      where,
      include: [
        {
          model: User,
          as: "assignedRecruiter",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const counts = await CandidateSubmission.findAll({
      where: { clientId: client.id },
      attributes: ["requirementId", "status"],
    });

    const data = requirements.map((r) => {
      const rSubs = counts.filter((c) => c.requirementId === r.id);
      return {
        ...r.toJSON(),
        submittedCount: rSubs.length,
        approvedCount: rSubs.filter((c) =>
          [
            "client-approved",
            "interview-scheduled",
            "interview-completed",
            "offer-extended",
            "offer-approved",
          ].includes(c.status),
        ).length,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch requirements",
      error: error.message,
    });
  }
};

export const getRequirementById = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const requirement = await CrmRequirement.findOne({
      where: { id: req.params.id, clientId: client.id },
      include: [
        {
          model: User,
          as: "assignedRecruiter",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    if (!requirement) {
      return res
        .status(404)
        .json({ success: false, message: "Requirement not found" });
    }
    res.status(200).json({ success: true, data: requirement });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch requirement",
      error: error.message,
    });
  }
};

//
// ==========================================
// CANDIDATE SUBMISSIONS — Approve Candidates / Approve Offers
// ==========================================
//
export const getMySubmissions = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const { status, requirementId } = req.query;
    // Internal HR Partner submissions stay private until an Admin approves
    // them. The client portal only sees the client-facing lifecycle.
    const where = {
      clientId: client.id,
      status: {
        [Op.notIn]: ["pending-admin-approval", "admin-rejected"],
      },
    };
    if (status) where.status = status;
    if (requirementId) where.requirementId = requirementId;

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
            "experience",
            "currentCompany",
            "expectedCTC",
            "skills",
            "resume",
            "aiScore",
          ],
        },
        {
          model: CrmRequirement,
          as: "requirement",
          attributes: ["id", "title", "department"],
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
      message: "Failed to fetch candidate submissions",
      error: error.message,
    });
  }
};

const findOwnSubmission = async (req) => {
  const client = await getOrCreateProfile(req);
  const submission = await CandidateSubmission.findOne({
    where: { id: req.params.id, clientId: client.id },
    include: [{ model: Candidate, as: "candidate" }],
  });
  return { client, submission };
};

export const approveCandidate = async (req, res) => {
  try {
    const { submission } = await findOwnSubmission(req);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    if (submission.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: `Candidate can't be approved from status "${submission.status}"`,
      });
    }

    submission.status = "client-approved";
    submission.clientRemarks = req.body.remarks || submission.clientRemarks;
    submission.respondedAt = new Date();
    await submission.save();

    emitToRoom(`user:${req.user.id}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    emitToRoom("staff", "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    emitToRoom(`client:${submission.clientId}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });

    await logAudit({
      req,
      action: "update",
      module: "client_portal",
      targetType: "CandidateSubmission",
      targetId: submission.id,
      description: `Client approved candidate #${submission.candidateId} for requirement #${submission.requirementId}`,
    });

    res
      .status(200)
      .json({ success: true, message: "Candidate approved", data: submission });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve candidate",
      error: error.message,
    });
  }
};

export const rejectCandidate = async (req, res) => {
  try {
    const { submission } = await findOwnSubmission(req);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    if (
      !["submitted", "client-approved", "interview-scheduled"].includes(
        submission.status,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Candidate can't be rejected from status "${submission.status}"`,
      });
    }

    submission.status = "client-rejected";
    submission.clientRemarks = req.body.remarks || submission.clientRemarks;
    submission.respondedAt = new Date();
    await submission.save();

    emitToRoom(`user:${req.user.id}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    emitToRoom("staff", "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    emitToRoom(`client:${submission.clientId}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });

    await logAudit({
      req,
      action: "update",
      module: "client_portal",
      targetType: "CandidateSubmission",
      targetId: submission.id,
      description: `Client rejected candidate #${submission.candidateId} for requirement #${submission.requirementId}`,
    });

    res
      .status(200)
      .json({ success: true, message: "Candidate rejected", data: submission });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject candidate",
      error: error.message,
    });
  }
};

export const approveOffer = async (req, res) => {
  try {
    const { submission } = await findOwnSubmission(req);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    if (submission.status !== "offer-extended") {
      return res.status(400).json({
        success: false,
        message:
          "There is no pending offer awaiting your approval for this candidate.",
      });
    }

    submission.status = "offer-approved";
    submission.clientRemarks = req.body.remarks || submission.clientRemarks;
    submission.respondedAt = new Date();
    await submission.save();

    emitToRoom(`user:${req.user.id}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    emitToRoom("staff", "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    emitToRoom(`client:${submission.clientId}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });

    // Reflect the approval on the candidate's real ATS pipeline stage too.
    if (submission.candidate) {
      submission.candidate.pipelineStage = "Offer Released";
      await submission.candidate.save();
    }

    await logAudit({
      req,
      action: "update",
      module: "client_portal",
      targetType: "CandidateSubmission",
      targetId: submission.id,
      description: `Client approved offer for candidate #${submission.candidateId}`,
    });

    res
      .status(200)
      .json({ success: true, message: "Offer approved", data: submission });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve offer",
      error: error.message,
    });
  }
};

export const rejectOffer = async (req, res) => {
  try {
    const { submission } = await findOwnSubmission(req);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    if (submission.status !== "offer-extended") {
      return res.status(400).json({
        success: false,
        message:
          "There is no pending offer awaiting your decision for this candidate.",
      });
    }

    submission.status = "offer-rejected";
    submission.clientRemarks = req.body.remarks || submission.clientRemarks;
    submission.respondedAt = new Date();
    await submission.save();

    emitToRoom(`user:${req.user.id}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    emitToRoom("staff", "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });
    emitToRoom(`client:${submission.clientId}`, "tracker:update", {
      candidateId: submission.candidateId,
      submissionId: submission.id,
      submissionStatus: submission.status,
      updatedAt: submission.updatedAt,
    });

    await logAudit({
      req,
      action: "update",
      module: "client_portal",
      targetType: "CandidateSubmission",
      targetId: submission.id,
      description: `Client rejected offer for candidate #${submission.candidateId}`,
    });

    res
      .status(200)
      .json({ success: true, message: "Offer rejected", data: submission });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject offer",
      error: error.message,
    });
  }
};

//
// ==========================================
// INTERVIEW SCHEDULE
// ==========================================
//
export const getMyInterviews = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);

    const submissionRows = await CandidateSubmission.findAll({
      where: { clientId: client.id },
      attributes: ["candidateId", "requirementId"],
    });
    const candidateIds = [...new Set(submissionRows.map((s) => s.candidateId))];

    if (!candidateIds.length) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const events = await CalendarEvent.findAll({
      where: {
        relatedType: "candidate",
        relatedId: candidateIds,
        eventType: "interview",
      },
      order: [["startAt", "DESC"]],
    });

    const candidates = await Candidate.findAll({
      where: { id: candidateIds },
      attributes: ["id", "firstName", "lastName", "candidateCode"],
    });
    const candidateMap = Object.fromEntries(candidates.map((c) => [c.id, c]));

    const data = events.map((ev) => ({
      ...ev.toJSON(),
      candidate: candidateMap[ev.relatedId] || null,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview schedule",
      error: error.message,
    });
  }
};

//
// ==========================================
// CHAT WITH RECRUITER
// ==========================================
//
export const getMyMessages = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const messages = await ClientMessage.findAll({
      where: { clientId: client.id },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Mark staff messages as read now that the client has opened the thread.
    await ClientMessage.update(
      { isRead: true },
      { where: { clientId: client.id, senderRole: "staff", isRead: false } },
    );

    res
      .status(200)
      .json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

export const sendMyMessage = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required" });
    }

    const created = await ClientMessage.create({
      clientId: client.id,
      senderId: req.user.id,
      senderRole: "client",
      message: message.trim(),
    });

    const full = await ClientMessage.findByPk(created.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
    });

    emitToRoom(`client:${client.id}`, "chat:new_message", full);
    emitToRoom("staff", "chat:new_message", {
      ...full.toJSON(),
      thread: "client",
      threadId: client.id,
    });
    if (client.accountManagerId) emitToRoom(`user:${client.accountManagerId}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: client.id });
    if (client.createdBy && client.createdBy !== client.accountManagerId) emitToRoom(`user:${client.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: client.id });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// POST /api/client-portal/messages/call — client starts a video call with
// their account manager. Creates a real Jitsi room (Phase 2's generator),
// posts it into the thread as a call_invite message, and pushes an instant
// "incoming call" event to staff over the socket so it can ring in real time.
export const startCallFromClient = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const { roomId, meetingLink } = generateMeetingRoom("recruweb-client-call");

    const created = await ClientMessage.create({
      clientId: client.id,
      senderId: req.user.id,
      senderRole: "client",
      type: "call_invite",
      meetingLink,
      message: "📹 Started a video call — tap Join to connect.",
    });
    const full = await ClientMessage.findByPk(created.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
    });

    emitToRoom(`client:${client.id}`, "chat:new_message", full);
    emitToRoom("staff", "call:incoming", {
      thread: "client",
      threadId: client.id,
      from: req.user.name,
      meetingLink,
      roomId,
    });
    if (client.accountManagerId) emitToRoom(`user:${client.accountManagerId}`, "call:incoming", { thread: "client", threadId: client.id, from: req.user.name, meetingLink, roomId });
    if (client.createdBy && client.createdBy !== client.accountManagerId) emitToRoom(`user:${client.createdBy}`, "call:incoming", { thread: "client", threadId: client.id, from: req.user.name, meetingLink, roomId });
    emitToRoom("staff", "chat:new_message", {
      ...full.toJSON(),
      thread: "client",
      threadId: client.id,
    });
    if (client.accountManagerId) emitToRoom(`user:${client.accountManagerId}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: client.id });
    if (client.createdBy && client.createdBy !== client.accountManagerId) emitToRoom(`user:${client.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: client.id });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to start call",
        error: error.message,
      });
  }
};

// POST /api/client-portal/messages/ask-ai — client asks the in-chat AI
// assistant a question; the AI's grounded answer is posted into the same
// thread (visible to both sides) as a real message, not a private aside.
export const askAIInClientThread = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const { question } = req.body;
    if (!question?.trim())
      return res
        .status(400)
        .json({ success: false, message: "question is required" });

    const history = await ClientMessage.findAll({
      where: { clientId: client.id },
      order: [["createdAt", "ASC"]],
      limit: 50,
    });
    const answer = await draftChatReply({
      history,
      askedBy: "the client",
      question,
    });

    const created = await ClientMessage.create({
      clientId: client.id,
      senderId: req.user.id,
      senderRole: "ai",
      type: "ai",
      message: answer,
    });
    const full = await ClientMessage.findByPk(created.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
    });

    emitToRoom(`client:${client.id}`, "chat:new_message", full);
    emitToRoom("staff", "chat:new_message", {
      ...full.toJSON(),
      thread: "client",
      threadId: client.id,
    });
    if (client.accountManagerId) emitToRoom(`user:${client.accountManagerId}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: client.id });
    if (client.createdBy && client.createdBy !== client.accountManagerId) emitToRoom(`user:${client.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: client.id });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "AI assistant failed to respond",
        error: error.message,
      });
  }
};

//
// ==========================================
// INVOICES — Download Invoices
// ==========================================
//
export const getMyInvoices = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const invoices = await Invoice.findAll({
      where: { clientId: client.id },
      order: [["issueDate", "DESC"]],
    });

    const data = invoices.map((inv) => ({
      ...inv.toJSON(),
      downloadUrl: inv.fileUrl
        ? `${req.protocol}://${req.get("host")}${inv.fileUrl}`
        : null,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

// ==========================================================================
// Pay Invoice — real, LIVE Razorpay Checkout. The invoice is always looked
// up scoped to `client.id` (this logged-in client), so a client can never
// create an order for, or "pay", someone else's invoice.
// ==========================================================================

// POST /api/client-portal/invoices/:id/pay/order
export const createInvoicePaymentOrder = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, clientId: client.id },
    });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    if (["paid", "cancelled", "draft"].includes(invoice.status)) {
      return res.status(400).json({
        success: false,
        message: `This invoice is ${invoice.status} and cannot be paid online.`,
      });
    }

    const { order, payment, keyId } = await razorpayCreateOrderForInvoice(
      invoice,
      req.user.id,
    );

    res.status(201).json({
      success: true,
      data: {
        keyId,
        orderId: order.id,
        amount: order.amount, // paise, straight from Razorpay
        currency: order.currency,
        paymentId: payment.id,
        invoiceNumber: invoice.invoiceNumber,
        // Prefill for Razorpay Checkout
        name: "Recruweb",
        prefill: {
          name: client.name,
          email: client.email,
          contact: client.phone,
        },
      },
    });
  } catch (error) {
    const status =
      error.code === "RAZORPAY_NOT_CONFIGURED" ||
      error.code === "RAZORPAY_TEST_KEY_REJECTED" ||
      error.code === "RAZORPAY_AUTH_FAILED" ||
      error.code === "RAZORPAY_SECRET_MISSING"
        ? 503
        : error.code === "RAZORPAY_API_ERROR"
          ? 502
          : error.code === "NOTHING_DUE"
            ? 400
            : 500;

    let message = error.message || "Failed to start payment";
    if (error.code === "RAZORPAY_NOT_CONFIGURED") {
      message = "Razorpay is not configured on the backend. Add a matching RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env, then restart the backend.";
    }
    console.error("[Client Invoice Payment] start failed:", {
      code: error.code || "PAYMENT_START_FAILED",
      name: error.name || "",
      message: error.message || "",
      validation: error?.errors?.map?.((item) => ({
        field: item.path,
        message: item.message,
      })) || [],
    });

    // Never expose secrets, but do expose the actual validation field/message
    // so the Client Portal no longer shows only the meaningless
    // "Validation error" text.
    const validationMessage = error?.errors?.length
      ? error.errors.map((item) => `${item.path}: ${item.message}`).join("; ")
      : null;

    res.status(status).json({
      success: false,
      code: error.code || "PAYMENT_START_FAILED",
      message: validationMessage || message,
    });
  }
};

// POST /api/client-portal/invoices/:id/pay/verify
export const verifyInvoicePayment = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, clientId: client.id },
    });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing Razorpay verification fields",
        });
    }

    const payment = await razorpayVerifyCheckout({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    await logAudit({
      req,
      action: "update",
      module: "payment",
      targetType: "Payment",
      targetId: payment.id,
      description: `Client paid invoice ${invoice.invoiceNumber} online via Razorpay (₹${payment.amount})`,
    });

    const freshInvoice = await Invoice.findByPk(invoice.id);

    res.status(200).json({
      success: true,
      message: "Payment verified and recorded",
      data: { payment, invoice: freshInvoice },
    });
  } catch (error) {
    const status = error.code === "INVALID_SIGNATURE" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

// ==========================================================================
// Client Analytics — merged in from D RTPN's client.service.js#getAnalytics.
// Adapted from D's Prisma groupBy/aggregate calls into Sequelize equivalents
// over Recruweb's OWN existing tables (crm_requirements, candidate_submissions,
// invoices) — no new models needed, this is a read-only summary of data that
// already exists across those tables, scoped to req.user the same way every
// other endpoint in this file is.
// ==========================================================================
export const getClientAnalytics = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);

    const [requirementRows, submissionRows, invoiceTotal, invoicePaid, invoicePending] =
      await Promise.all([
        CrmRequirement.findAll({
          where: { clientId: client.id },
          attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
          group: ["status"],
          raw: true,
        }),
        CandidateSubmission.findAll({
          where: { clientId: client.id },
          attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
          group: ["status"],
          raw: true,
        }),
        Invoice.sum("totalAmount", { where: { clientId: client.id } }),
        Invoice.sum("totalAmount", { where: { clientId: client.id, status: "paid" } }),
        Invoice.sum("totalAmount", {
          where: { clientId: client.id, status: ["sent", "partially_paid", "overdue"] },
        }),
      ]);

    const requirementStatusCounts = {};
    requirementRows.forEach((r) => {
      requirementStatusCounts[r.status] = Number(r.count);
    });

    // Always include every known submission status at 0, same as D's
    // FUNNEL_STAGES pre-fill, so the frontend can render a stable funnel
    // chart without checking for missing keys.
    const submissionFunnel = Object.fromEntries(SUBMISSION_STATUSES.map((s) => [s, 0]));
    submissionRows.forEach((r) => {
      submissionFunnel[r.status] = Number(r.count);
    });

    res.status(200).json({
      success: true,
      data: {
        requirementStatusCounts,
        submissionFunnel,
        invoices: {
          totalBilled: Number(invoiceTotal || 0),
          totalPaid: Number(invoicePaid || 0),
          totalOutstanding: Number(invoicePending || 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
      error: error.message,
    });
  }
};


// GET /api/client-portal/invoices/:id/download
export const downloadMyInvoice = async (req, res) => {
  try {
    const client = await getOrCreateProfile(req);
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, clientId: client.id },
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    await sendInvoicePdf(res, invoice, client);
  } catch (error) {
    console.error("Client invoice PDF download failed:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to download invoice PDF" });
    }
  }
};

