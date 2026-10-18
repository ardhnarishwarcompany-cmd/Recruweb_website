import { Op } from "sequelize";
import { SupportChatMessage, User } from "../models/index.js";
import { ROLES } from "../config/roles.js";
import { emitToRoom } from "../socket.js";

const userRoles = (req) => [
  ...(Array.isArray(req.user?.roles) ? req.user.roles : []),
  req.user?.role,
].filter(Boolean);

const isAdmin = (req) =>
  userRoles(req).some((role) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role));

const isHrPartner = (req) =>
  userRoles(req).includes(ROLES.HR_PARTNER);

const loadMessage = (id) =>
  SupportChatMessage.findByPk(id, {
    include: [
      {
        model: User,
        as: "supportSender",
        attributes: ["id", "name", "role"],
      },
      {
        model: User,
        as: "supportParticipant",
        attributes: ["id", "name", "email", "role"],
      },
    ],
  });

export const getSupportThreads = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const rows = await SupportChatMessage.findAll({
      attributes: ["participantUserId"],
      where: { senderRole: { [Op.in]: ["hr_partner", "support"] } },
      group: ["participantUserId"],
    });
    const ids = rows.map((r) => Number(r.participantUserId));

    if (!ids.length) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const users = await User.findAll({
      where: { id: { [Op.in]: ids }, role: ROLES.HR_PARTNER },
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
    });

    const unread = await SupportChatMessage.findAll({
      where: {
        participantUserId: { [Op.in]: ids },
        senderRole: "hr_partner",
        isRead: false,
      },
      attributes: ["participantUserId"],
    });
    const unreadCounts = {};
    for (const row of unread) {
      unreadCounts[row.participantUserId] =
        (unreadCounts[row.participantUserId] || 0) + 1;
    }

    const data = users.map((u) => ({
      ...u.toJSON(),
      unreadCount: unreadCounts[u.id] || 0,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("[Support Chat] threads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load support conversations",
      error: error.message,
    });
  }
};

export const getMySupportMessages = async (req, res) => {
  try {
    if (!isHrPartner(req)) {
      return res.status(403).json({ success: false, message: "HR Partner access required" });
    }

    const messages = await SupportChatMessage.findAll({
      where: { participantUserId: req.user.id },
      include: [
        { model: User, as: "supportSender", attributes: ["id", "name", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    await SupportChatMessage.update(
      { isRead: true },
      {
        where: {
          participantUserId: req.user.id,
          senderRole: "support",
          isRead: false,
        },
      },
    );

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load support messages",
      error: error.message,
    });
  }
};

export const getSupportMessages = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const participantUserId = Number(req.params.userId);
    const participant = await User.findOne({
      where: { id: participantUserId, role: ROLES.HR_PARTNER },
      attributes: ["id", "name", "email", "role"],
    });
    if (!participant) {
      return res.status(404).json({ success: false, message: "HR Partner not found" });
    }

    const messages = await SupportChatMessage.findAll({
      where: { participantUserId },
      include: [
        { model: User, as: "supportSender", attributes: ["id", "name", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    await SupportChatMessage.update(
      { isRead: true },
      {
        where: {
          participantUserId,
          senderRole: "hr_partner",
          isRead: false,
        },
      },
    );

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load support messages",
      error: error.message,
    });
  }
};

export const sendSupportMessage = async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    let participantUserId;
    let senderRole;

    if (isHrPartner(req)) {
      participantUserId = req.user.id;
      senderRole = "hr_partner";
    } else if (isAdmin(req)) {
      participantUserId = Number(req.params.userId);
      const participant = await User.findOne({
        where: { id: participantUserId, role: ROLES.HR_PARTNER },
        attributes: ["id"],
      });
      if (!participant) {
        return res.status(404).json({ success: false, message: "HR Partner not found" });
      }
      senderRole = "support";
    } else {
      return res.status(403).json({ success: false, message: "Support chat is not available for this account" });
    }

    const created = await SupportChatMessage.create({
      participantUserId,
      senderId: req.user.id,
      senderRole,
      message,
    });
    const full = await loadMessage(created.id);

    const payload = {
      ...full.toJSON(),
      thread: "support",
      threadId: participantUserId,
    };

    emitToRoom(`support:${participantUserId}`, "support:new_message", payload);
    emitToRoom(`user:${participantUserId}`, "support:new_message", payload);
    emitToRoom("support:staff", "support:new_message", payload);

    res.status(201).json({ success: true, data: full });
  } catch (error) {
    console.error("[Support Chat] send:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send support message",
      error: error.message,
    });
  }
};
