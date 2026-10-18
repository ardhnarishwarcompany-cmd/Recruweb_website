import { Op } from "sequelize";
import { ClientMessage, CrmClient, User } from "../models/index.js";
import { ROLES } from "../config/roles.js";
import { emitToRoom } from "../socket.js";
import { generateMeetingRoom } from "../utils/meetingRoom.js";

const isHrPartner = (req) => req.user?.role === ROLES.HR_PARTNER;

const canAccessClient = (req, client) => {
  // Admin/staff and HR Partners may open a conversation that exists in the
  // real chat inbox. The inbox itself only exposes clients with messages.
  return true;
};

const clientAccessWhere = (req) => {
  if (!isHrPartner(req)) return {};
  return {
    [Op.or]: [
      { accountManagerId: req.user.id },
      { createdBy: req.user.id },
    ],
  };
};

// Staff-side: list every client that has an active chat thread (or all
// clients, so a recruiter/account manager can start one), and read/reply to
// a specific client's thread. Backs the same client_messages table the
// Client Portal's "Chat With Recruiter" reads/writes.

export const getClientThreads = async (req, res) => {
  try {
    // Only real client conversations are shown. No dummy/placeholder clients
    // are injected into the chat inbox.
    const messageRows = await ClientMessage.findAll({
      attributes: ["clientId"],
      group: ["clientId"],
    });
    const clientIds = messageRows.map((row) => Number(row.clientId));

    if (!clientIds.length) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const clients = await CrmClient.findAll({
      where: { id: { [Op.in]: clientIds } },
      attributes: ["id", "name", "clientCode", "accountManagerId"],
      include: [
        { model: User, as: "accountManager", attributes: ["id", "name"] },
      ],
      order: [["name", "ASC"]],
    });

    const unread = await ClientMessage.findAll({
      where: {
        senderRole: "client",
        isRead: false,
        clientId: { [Op.in]: clientIds },
      },
      attributes: ["clientId"],
    });
    const unreadCounts = {};
    for (const row of unread) {
      unreadCounts[row.clientId] = (unreadCounts[row.clientId] || 0) + 1;
    }

    const data = clients.map((c) => ({
      ...c.toJSON(),
      unreadCount: unreadCounts[c.id] || 0,
    }));
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("[Client Chat] Failed to fetch threads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client chat threads",
      error: error.message,
    });
  }
};
export const getClientThreadMessages = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await CrmClient.findByPk(clientId);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });
    if (!canAccessClient(req, client)) return res.status(403).json({ success: false, message: "You do not have access to this client chat" });
    const messages = await ClientMessage.findAll({
      where: { clientId },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    await ClientMessage.update(
      { isRead: true },
      { where: { clientId, senderRole: "client", isRead: false } },
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

export const replyToClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required" });
    }

    const client = await CrmClient.findByPk(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }
    if (!canAccessClient(req, client)) return res.status(403).json({ success: false, message: "You do not have access to this client chat" });

    const created = await ClientMessage.create({
      clientId,
      senderId: req.user.id,
      senderRole: "staff",
      message: message.trim(),
    });

    const full = await ClientMessage.findByPk(created.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
    });

    emitToRoom(`client:${clientId}`, "chat:new_message", full);
    emitToRoom("staff", "chat:new_message", {
      ...full.toJSON(),
      thread: "client",
      threadId: Number(clientId),
    });
    if (client.accountManagerId) emitToRoom(`user:${client.accountManagerId}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: Number(clientId) });
    if (client.createdBy && client.createdBy !== client.accountManagerId) emitToRoom(`user:${client.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: Number(clientId) });

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// PUT /api/crm/client-chat/messages/:messageId — staff edits a message they
// sent earlier. Only the original sender may edit their own message.
export const updateClientMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required" });
    }

    const existing = await ClientMessage.findByPk(messageId);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    if (existing.senderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    existing.message = message.trim();
    await existing.save();

    const full = await ClientMessage.findByPk(existing.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
    });

    emitToRoom(`client:${existing.clientId}`, "chat:message_updated", full);
    emitToRoom("staff", "chat:message_updated", {
      ...full.toJSON(),
      thread: "client",
      threadId: Number(existing.clientId),
    });

    res.status(200).json({ success: true, data: full });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update message",
      error: error.message,
    });
  }
};

// DELETE /api/crm/client-chat/messages/:messageId — staff deletes a message
// they sent earlier. Only the original sender may delete their own message.
export const deleteClientMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const existing = await ClientMessage.findByPk(messageId);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    if (existing.senderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    const { clientId } = existing;
    await existing.destroy();

    emitToRoom(`client:${clientId}`, "chat:message_deleted", {
      id: Number(messageId),
    });
    emitToRoom("staff", "chat:message_deleted", {
      id: Number(messageId),
      thread: "client",
      threadId: Number(clientId),
    });

    res.status(200).json({ success: true, data: { id: Number(messageId) } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

// POST /api/client-chat/:clientId/call — staff starts a real video call
// with a client, ringing them instantly over the socket.
export const startCallWithClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await CrmClient.findByPk(clientId);
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    if (!canAccessClient(req, client)) return res.status(403).json({ success: false, message: "You do not have access to this client chat" });

    const { roomId, meetingLink } = generateMeetingRoom("recruweb-client-call");
    const created = await ClientMessage.create({
      clientId,
      senderId: req.user.id,
      senderRole: "staff",
      type: "call_invite",
      meetingLink,
      message: `📹 ${req.user.name} started a video call — tap Join to connect.`,
    });
    const full = await ClientMessage.findByPk(created.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
    });

    emitToRoom(`client:${clientId}`, "chat:new_message", full);
    emitToRoom(`client:${clientId}`, "call:incoming", {
      thread: "client",
      threadId: Number(clientId),
      from: req.user.name,
      meetingLink,
      roomId,
    });
    emitToRoom("staff", "chat:new_message", {
      ...full.toJSON(),
      thread: "client",
      threadId: Number(clientId),
    });
    if (client.accountManagerId) emitToRoom(`user:${client.accountManagerId}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: Number(clientId) });
    if (client.createdBy && client.createdBy !== client.accountManagerId) emitToRoom(`user:${client.createdBy}`, "chat:new_message", { ...full.toJSON(), thread: "client", threadId: Number(clientId) });

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
