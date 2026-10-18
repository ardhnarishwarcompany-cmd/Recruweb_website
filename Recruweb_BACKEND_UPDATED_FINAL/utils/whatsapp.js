import { Setting, AutomationLog } from "../models/index.js";

// =======================================================
// NORMALIZE WHATSAPP NUMBER
// =======================================================

const normalizeWhatsAppNumber = (phone) => {
  if (!phone) return "";

  let value = String(phone).trim();

  // Remove spaces, -, brackets, etc.
  value = value.replace(/[^\d+]/g, "");

  // 00XXXXXXXX -> +XXXXXXXX
  if (value.startsWith("00")) {
    value = "+" + value.substring(2);
  }

  // Remove +
  if (value.startsWith("+")) {
    return value.substring(1);
  }

  // IMPORTANT:
  // Do not blindly add country code.
  // Number should ideally contain country code.
  return value;
};

// =======================================================
// SEND WHATSAPP MESSAGE
// =======================================================

export const sendWhatsAppMessage = async ({
  to,
  message,
  type = "manual",
  relatedType = "general",
  relatedId = null,
  triggeredBy = null,
  senderUserId = null,
  recipientName = null,
  draftId = null,
  scheduledAt = null,
}) => {
  // ---------------------------------------------------
  // LOAD WHATSAPP SETTINGS
  // ---------------------------------------------------

  const settingRow = await Setting.findOne({
    where: {
      category: "whatsapp",
    },
  });

  const cfg = settingRow?.value || {};

  // ---------------------------------------------------
  // BASE LOG
  // ---------------------------------------------------

  const baseLog = {
    senderUserId:
      senderUserId || triggeredBy || null,

    recipientName,

    recipientPhone: to,

    recipient: to,

    channel: "whatsapp",

    type,

    relatedType,

    relatedId,

    message,

    draftId,

    scheduledAt,

    triggeredBy:
      triggeredBy || senderUserId || null,
  };

  // ---------------------------------------------------
  // CHECK CONFIGURATION
  // ---------------------------------------------------

  if (
    !cfg.isEnabled ||
    !cfg.accessToken ||
    !cfg.phoneNumberId
  ) {
    const errorMessage =
      "WhatsApp is not configured/enabled in Settings > WhatsApp";

    const log = await AutomationLog.create({
      ...baseLog,

      status: "skipped_not_configured",

      errorMessage,

      error: errorMessage,
    });

    return {
      success: false,
      skipped: true,
      reason: "not_configured",
      logId: log.id,
    };
  }

  // ---------------------------------------------------
  // NORMALIZE RECIPIENT
  // ---------------------------------------------------

  const recipient = normalizeWhatsAppNumber(to);

  if (!recipient) {
    const errorMessage =
      "Invalid WhatsApp recipient number";

    const log = await AutomationLog.create({
      ...baseLog,

      status: "failed",

      errorMessage,

      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
      logId: log.id,
    };
  }

  // ---------------------------------------------------
  // CREATE SENDING LOG
  // ---------------------------------------------------

  const log = await AutomationLog.create({
    ...baseLog,

    status: "sending",

    provider: "meta_whatsapp_cloud_api",
  });

  try {
    console.log("========================================");
    console.log("[WhatsApp] Sending message");
    console.log("[WhatsApp] Original recipient:", to);
    console.log("[WhatsApp] Normalized recipient:", recipient);
    console.log(
      "[WhatsApp] Phone Number ID:",
      cfg.phoneNumberId
    );
    console.log(
      "[WhatsApp] Enabled:",
      cfg.isEnabled
    );
    console.log("========================================");

    // -------------------------------------------------
    // META WHATSAPP CLOUD API
    // -------------------------------------------------

    const url =
      `https://graph.facebook.com/v19.0/${cfg.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messaging_product: "whatsapp",

        recipient_type: "individual",

        to: recipient,

        type: "text",

        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const body = await response.json();

    console.log("[WhatsApp] HTTP Status:", response.status);
    console.log("[WhatsApp] Response:", body);

    // -------------------------------------------------
    // API ERROR
    // -------------------------------------------------

    if (!response.ok) {
      const apiError =
        body?.error?.message ||
        body?.error?.error_user_msg ||
        "WhatsApp API request failed";

      throw new Error(apiError);
    }

    // -------------------------------------------------
    // PROVIDER MESSAGE ID
    // -------------------------------------------------

    const providerMessageId =
      body?.messages?.[0]?.id || null;

    // -------------------------------------------------
    // SUCCESS LOG
    // -------------------------------------------------

    await log.update({
      status: "sent",

      provider:
        "meta_whatsapp_cloud_api",

      providerMessageId,

      providerResponse: body,

      sentAt: new Date(),

      errorMessage: null,

      error: null,
    });

    console.log(
      "[WhatsApp] Message sent successfully"
    );

    return {
      success: true,

      provider:
        "meta_whatsapp_cloud_api",

      providerMessageId,

      data: body,

      logId: log.id,
    };
  } catch (err) {
    // -------------------------------------------------
    // ERROR
    // -------------------------------------------------

    console.error("========================================");
    console.error("[WhatsApp] SEND ERROR");
    console.error("[WhatsApp] Error:", err.message);
    console.error("========================================");

    await log.update({
      status: "failed",

      errorMessage: err.message,

      error: err.message,
    });

    return {
      success: false,

      error: err.message,

      logId: log.id,
    };
  }
};