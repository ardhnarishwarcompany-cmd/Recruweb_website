import {
  SupportTicket,
  SupportTicketReply,
  User,
} from "../models/index.js";
import { ROLE_GROUPS } from "../config/roles.js";
import { logAudit } from "../utils/auditLogger.js";

// Support ticket module — merged in from D RTPN. Open to any authenticated
// user (candidate, client, HR partner, or staff) via the SAME auth session
// as every other Recruweb route — not a separate helpdesk login.

// POST /api/support-tickets
export const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    if (!subject) {
      return res.status(400).json({ success: false, message: "subject is required" });
    }

    const ticket = await SupportTicket.create({
      raisedByUserId: req.user.id,
      subject,
      category: category || null,
      priority: priority && ["low", "medium", "high", "urgent"].includes(priority) ? priority : "medium",
    });

    if (message) {
      await SupportTicketReply.create({
        ticketId: ticket.id,
        authorUserId: req.user.id,
        message,
      });
    }

    await logAudit({
      actor: req.user,
      action: "create",
      module: "support",
      targetType: "SupportTicket",
      targetId: ticket.id,
      description: `Opened support ticket: ${subject}`,
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create ticket", error: error.message });
  }
};

// GET /api/support-tickets/mine
export const listMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { raisedByUserId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load tickets", error: error.message });
  }
};

// GET /api/support-tickets — staff queue (optional ?status=open filter)
export const listAllTickets = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const tickets = await SupportTicket.findAll({
      where,
      include: [
        { model: User, as: "raisedBy", attributes: ["id", "name", "email", "role"] },
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load tickets", error: error.message });
  }
};

// GET /api/support-tickets/:id — the raiser or staff can view a ticket's full thread
export const getTicketDetail = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id, {
      include: [
        { model: User, as: "raisedBy", attributes: ["id", "name", "email", "role"] },
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
        {
          model: SupportTicketReply,
          as: "replies",
          include: [{ model: User, as: "author", attributes: ["id", "name", "role"] }],
          order: [["createdAt", "ASC"]],
        },
      ],
    });
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    const isOwner = ticket.raisedByUserId === req.user.id;
    const isStaff = (req.user.roles || []).some((r) => ROLE_GROUPS.STAFF.includes(r));
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Not authorized to view this ticket" });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load ticket", error: error.message });
  }
};

// POST /api/support-tickets/:id/replies — owner or staff adds a reply
export const addReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "message is required" });

    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    const isOwner = ticket.raisedByUserId === req.user.id;
    const isStaff = (req.user.roles || []).some((r) => ROLE_GROUPS.STAFF.includes(r));
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Not authorized to reply to this ticket" });
    }

    const reply = await SupportTicketReply.create({
      ticketId: ticket.id,
      authorUserId: req.user.id,
      message,
    });

    // A staff reply on an "open" ticket moves it forward automatically —
    // same UX shortcut D's status machine implied, made explicit here.
    if (isStaff && ticket.status === "open") {
      ticket.status = "in_progress";
      await ticket.save();
    }

    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add reply", error: error.message });
  }
};

// PATCH /api/support-tickets/:id — staff updates status/priority/assignment
export const updateTicket = async (req, res) => {
  try {
    const { status, priority, assignedToUserId } = req.body;
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    if (status) {
      if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      ticket.status = status;
      ticket.resolvedAt = status === "resolved" || status === "closed" ? new Date() : null;
    }
    if (priority) ticket.priority = priority;
    if (assignedToUserId !== undefined) ticket.assignedToUserId = assignedToUserId;

    await ticket.save();

    await logAudit({
      actor: req.user,
      action: "update",
      module: "support",
      targetType: "SupportTicket",
      targetId: ticket.id,
      description: `Updated ticket #${ticket.id}`,
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update ticket", error: error.message });
  }
};
