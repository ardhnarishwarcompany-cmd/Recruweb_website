import { Op } from "sequelize";
import { CandidateMessage, Candidate, User } from "../models/index.js";
import { ROLES } from "../config/roles.js";
import { emitToRoom } from "../socket.js";
import { generateMeetingRoom } from "../utils/meetingRoom.js";

const isHrPartner = (req) => req.user?.role === ROLES.HR_PARTNER;

const canAccessCandidate = (req, candidate) => {
  // Admin/staff and HR Partners may open a conversation that exists in the
  // real chat inbox. The inbox itself only exposes candidates with messages.
  return true;
};

const candidateAccessWhere = (req) => {
  if (!isHrPartner(req)) return {};
  return {
    [Op.or]: [
      { assignedRecruiterId: req.user.id },
      { createdBy: req.user.id },
    ],
  };
};

// Staff-side: list every candidate that has an active chat thread (or all
// candidates, so a recruiter can start one), and read/reply to a specific
// candidate's thread. Backs the same candidate_messages table the Candidate
// Portal's "Chat With Recruiter" reads/writes.


export const getCandidateThreads = async (req, res) => {
  try {
    // Only return candidates that actually have chat messages. This keeps the
    // inbox real-data-only while still allowing Admin to see every conversation.
    const messageRows = await CandidateMessage.findAll({
      attributes: ["candidateId"],
      group: ["candidateId"],
    });
    const candidateIds = messageRows.map((row) => Number(row.candidateId));

    if (!candidateIds.length) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const where = { id: { [Op.in]: candidateIds } };
    if (isHrPartner(req)) {
      // HR Partners see real candidate conversations, not placeholder/all-candidate
      // rows. Assignment is still exposed so the UI can show ownership.
      // A conversation can therefore appear as soon as a candidate sends a message.
    }

    const candidates = await Candidate.findAll({
      where,
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "assignedRecruiterId",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "recruiter",
          attributes: ["id", "name", "role"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: 200,
    });

    const unread = await CandidateMessage.findAll({
      where: { senderRole: "candidate", isRead: false, candidateId: { [Op.in]: candidateIds } },
      attributes: ["candidateId"],
    });

    const unreadCounts = {};
    for (const row of unread) {
      unreadCounts[row.candidateId] = (unreadCounts[row.candidateId] || 0) + 1;
    }

    const data = candidates.map((candidate) => ({
      ...candidate.toJSON(),
      unreadCount: unreadCounts[candidate.id] || 0,
      assignedRecruiter: candidate.recruiter
        ? {
            id: candidate.recruiter.id,
            name: candidate.recruiter.name,
            role: candidate.recruiter.role,
          }
        : null,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("[Candidate Chat] Failed to fetch threads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate chat threads",
      error: error.message,
    });
  }
};
export const getCandidateThreadMessages = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await Candidate.findByPk(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }
    if (!canAccessCandidate(req, candidate)) {
      return res.status(403).json({ success: false, message: "You do not have access to this candidate chat" });
    }

    const messages = await CandidateMessage.findAll({
      where: {
        candidateId: Number(candidateId),
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Candidate ke unread messages ko read mark karo
    await CandidateMessage.update(
      { isRead: true },
      {
        where: {
          candidateId: Number(candidateId),
          senderRole: "candidate",
          isRead: false,
        },
      }
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error(
      "[Candidate Chat] Failed to fetch messages:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate chat messages",
      error: error.message,
    });
  }
};
export const replyToCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "Message text is required" });

    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    if (!canAccessCandidate(req, candidate)) return res.status(403).json({ success: false, message: "You do not have access to this candidate chat" });

    const created = await CandidateMessage.create({
      candidateId,
      senderId: req.user.id,
      senderRole: "staff",
      message: message.trim(),
    });
    const full = await CandidateMessage.findByPk(created.id, {
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
    });

    emitToRoom(`candidate:${candidateId}`, "chat:new_message", full);
    emitToRoom("staff", "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: Number(candidateId) });
    if (candidate.assignedRecruiterId) emitToRoom(`user:${candidate.assignedRecruiterId}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: Number(candidateId) });
    if (candidate.createdBy && candidate.createdBy !== candidate.assignedRecruiterId) emitToRoom(`user:${candidate.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: Number(candidateId) });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
  }
};

// POST /api/candidate-chat/:candidateId/call — staff starts a real video
// call with a candidate, ringing them instantly over the socket.
export const startCallWithCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    if (!canAccessCandidate(req, candidate)) return res.status(403).json({ success: false, message: "You do not have access to this candidate chat" });

    const { roomId, meetingLink } = generateMeetingRoom("recruweb-candidate-call");
    const created = await CandidateMessage.create({
      candidateId,
      senderId: req.user.id,
      senderRole: "staff",
      type: "call_invite",
      meetingLink,
      message: `📹 ${req.user.name} started a video call — tap Join to connect.`,
    });
    const full = await CandidateMessage.findByPk(created.id, {
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
    });

    emitToRoom(`candidate:${candidateId}`, "chat:new_message", full);
    emitToRoom(`candidate:${candidateId}`, "call:incoming", { thread: "candidate", threadId: Number(candidateId), from: req.user.name, meetingLink, roomId });
    if (candidate.assignedRecruiterId) emitToRoom(`user:${candidate.assignedRecruiterId}`, "call:incoming", { thread: "candidate", threadId: Number(candidateId), from: req.user.name, meetingLink, roomId });
    if (candidate.createdBy && candidate.createdBy !== candidate.assignedRecruiterId) emitToRoom(`user:${candidate.createdBy}`, "call:incoming", { thread: "candidate", threadId: Number(candidateId), from: req.user.name, meetingLink, roomId });
    emitToRoom("staff", "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: Number(candidateId) });
    if (candidate.assignedRecruiterId) emitToRoom(`user:${candidate.assignedRecruiterId}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: Number(candidateId) });
    if (candidate.createdBy && candidate.createdBy !== candidate.assignedRecruiterId) emitToRoom(`user:${candidate.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "candidate", threadId: Number(candidateId) });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to start call", error: error.message });
  }
};
