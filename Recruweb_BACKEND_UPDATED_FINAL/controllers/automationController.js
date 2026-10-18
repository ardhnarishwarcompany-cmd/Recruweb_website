import { AutomationLog, Candidate } from "../models/index.js";

import { sendAutomatedEmail } from "../utils/emailAutomation.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";
import { sendSms } from "../utils/sms.js";

import {
  runInterviewReminders,
  runJoiningReminders,
} from "../utils/reminders.js";

// =======================================================
// GET AUTOMATION LOGS
// =======================================================

export const getAutomationLogs = async (req, res) => {
  try {
    const { channel, type, status } = req.query;

    const where = {};

    if (channel) where.channel = channel;
    if (type) where.type = type;
    if (status) where.status = status;

    const logs = await AutomationLog.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: 200,
    });

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error("GET AUTOMATION LOGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch automation logs",
      error: error.message,
    });
  }
};

// =======================================================
// GET AUTOMATION STATS
// =======================================================

export const getAutomationStats = async (req, res) => {
  try {
    const logs = await AutomationLog.findAll();

    const byChannel = {};
    const byStatus = {};

    for (const log of logs) {
      byChannel[log.channel] =
        (byChannel[log.channel] || 0) + 1;

      byStatus[log.status] =
        (byStatus[log.status] || 0) + 1;
    }

    return res.status(200).json({
      success: true,
      data: {
        total: logs.length,
        byChannel,
        byStatus,
      },
    });
  } catch (error) {
    console.error("GET AUTOMATION STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to compute automation stats",
      error: error.message,
    });
  }
};

// =======================================================
// SEND MANUAL AUTOMATION MESSAGE
// =======================================================

export const sendManual = async (req, res) => {
  try {
    const {
      channel,
      candidateId,
      to,
      subject,
      message,
    } = req.body;

    console.log("========================================");
    console.log("[AUTOMATION SEND]");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?.id);
    console.log("========================================");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Channel is required",
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const allowedChannels = [
      "email",
      "whatsapp",
      "sms",
    ];

    if (!allowedChannels.includes(channel)) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel",
      });
    }

    // ---------------------------------------------------
    // RECIPIENT DATA
    // ---------------------------------------------------

    let recipient = to || null;
    let recipientName = null;

    let relatedId = null;
    let relatedType = "general";

    let candidate = null;

    // ---------------------------------------------------
    // CANDIDATE RECIPIENT
    // ---------------------------------------------------

    if (candidateId && String(candidateId).trim()) {
      candidate = await Candidate.findByPk(candidateId);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      relatedId = candidate.id;
      relatedType = "candidate";

      recipientName =
        candidate.name ||
        candidate.fullName ||
        `${candidate.firstName || ""} ${
          candidate.lastName || ""
        }`.trim() ||
        null;

      // Candidate email/phone based on channel
      if (channel === "email") {
        recipient =
          candidate.email ||
          candidate.emailAddress ||
          null;
      } else {
        recipient =
          candidate.phone ||
          candidate.mobile ||
          candidate.phoneNumber ||
          null;
      }
    }

    // ---------------------------------------------------
    // CUSTOM RECIPIENT
    // ---------------------------------------------------

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message:
          "Recipient address is required. Please enter a valid recipient.",
      });
    }

    // ---------------------------------------------------
    // EMAIL
    // ---------------------------------------------------

    if (channel === "email") {
      if (!subject || !String(subject).trim()) {
        return res.status(400).json({
          success: false,
          message: "Subject is required for email",
        });
      }

      const result = await sendAutomatedEmail({
        to: recipient,
        subject: subject.trim(),
        html: `<p>${message}</p>`,

        type: "manual",

        relatedType,
        relatedId,

        triggeredBy: req.user?.id || null,
        senderUserId: req.user?.id || null,

        recipientName,
      });

      console.log("[EMAIL RESULT]", result);

      return res.status(result.success ? 200 : 500).json({
        success: !!result.success,
        message: result.success
          ? "Email sent successfully"
          : result.skipped
          ? "Email skipped because it is not configured"
          : "Failed to send email",
        data: result,
      });
    }

    // ---------------------------------------------------
    // WHATSAPP
    // ---------------------------------------------------

    if (channel === "whatsapp") {
      const result = await sendWhatsAppMessage({
        to: recipient,
        message: message.trim(),

        type: "manual",

        relatedType,
        relatedId,

        triggeredBy: req.user?.id || null,
        senderUserId: req.user?.id || null,

        recipientName,
      });

      console.log("[WHATSAPP RESULT]", result);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "WhatsApp message sent successfully",
          data: result,
        });
      }

      if (result.skipped) {
        return res.status(400).json({
          success: false,
          message:
            "WhatsApp is not configured/enabled in Settings > WhatsApp",
          data: result,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to send WhatsApp message",
        error: result.error,
        data: result,
      });
    }

    // ---------------------------------------------------
    // SMS
    // ---------------------------------------------------

    if (channel === "sms") {
      const result = await sendSms({
        to: recipient,
        message: message.trim(),

        type: "manual",

        relatedType,
        relatedId,

        triggeredBy: req.user?.id || null,
        senderUserId: req.user?.id || null,

        recipientName,
      });

      console.log("[SMS RESULT]", result);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "SMS sent successfully",
          data: result,
        });
      }

      if (result.skipped) {
        return res.status(400).json({
          success: false,
          message:
            "SMS is not configured/enabled in Settings > SMS",
          data: result,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to send SMS",
        error: result.error,
        data: result,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported channel",
    });
  } catch (error) {
    console.error("========================================");
    console.error("[AUTOMATION SEND ERROR]");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Stack:", error.stack);
    console.error("Request body:", req.body);
    console.error("User:", req.user?.id);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      message: "Failed to send automation message",
      error: error.message,
    });
  }
};

// =======================================================
// RUN REMINDERS NOW
// =======================================================

export const runRemindersNow = async (req, res) => {
  try {
    const interviews = await runInterviewReminders();
    const joinings = await runJoiningReminders();

    return res.status(200).json({
      success: true,
      message: `Sent ${interviews} interview reminder(s), ${joinings} joining reminder(s).`,
      data: {
        interviewReminders: interviews,
        joiningReminders: joinings,
      },
    });
  } catch (error) {
    console.error("RUN REMINDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run reminders",
      error: error.message,
    });
  }
};