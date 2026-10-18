import { Setting, AutomationLog } from "../models/index.js";

const normalizePhoneNumber = (phone) => {
  if (!phone) return "";

  let value = String(phone).trim();

  value = value.replace(/[^\d+]/g, "");

  if (value.startsWith("00")) {
    value = "+" + value.substring(2);
  }

  return value;
};

export const sendSms = async ({
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
  const settingRow = await Setting.findOne({
    where: { category: "sms" },
  });

  const cfg = settingRow?.value || {};

  const baseLog = {
    senderUserId: senderUserId || triggeredBy,
    recipientName,
    recipientPhone: to,
    recipient: to,
    channel: "sms",
    type,
    relatedType,
    relatedId,
    message,
    draftId,
    scheduledAt,
    triggeredBy: triggeredBy || senderUserId,
  };

  if (
    !cfg.isEnabled ||
    !cfg.accountSid ||
    !cfg.authToken ||
    !cfg.senderId
  ) {
    const log = await AutomationLog.create({
      ...baseLog,
      status: "skipped_not_configured",
      errorMessage:
        "SMS is not configured/enabled in Settings > SMS",
      error:
        "SMS is not configured/enabled in Settings > SMS",
    });

    return {
      success: false,
      skipped: true,
      reason: "not_configured",
      logId: log.id,
    };
  }

  const recipient = normalizePhoneNumber(to);

  if (!recipient) {
    const log = await AutomationLog.create({
      ...baseLog,
      status: "failed",
      errorMessage: "Invalid recipient phone number",
      error: "Invalid recipient phone number",
    });

    return {
      success: false,
      error: "Invalid recipient phone number",
      logId: log.id,
    };
  }

  const log = await AutomationLog.create({
    ...baseLog,
    status: "sending",
    provider: "twilio",
  });

  try {
    const url =
      `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;

    const params = new URLSearchParams({
      To: recipient,
      From: cfg.senderId,
      Body: message,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${cfg.accountSid}:${cfg.authToken}`
          ).toString("base64"),

        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(
        body?.message ||
          body?.detail ||
          "Twilio SMS API request failed"
      );
    }

    await log.update({
      status: "sent",
      provider: "twilio",
      providerMessageId: body?.sid || null,
      providerResponse: body,
      sentAt: new Date(),
      errorMessage: null,
      error: null,
    });

    return {
      success: true,
      provider: "twilio",
      providerMessageId: body?.sid || null,
      data: body,
      logId: log.id,
    };
  } catch (error) {
    await log.update({
      status: "failed",
      provider: "twilio",
      errorMessage: error.message,
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
      logId: log.id,
    };
  }
};