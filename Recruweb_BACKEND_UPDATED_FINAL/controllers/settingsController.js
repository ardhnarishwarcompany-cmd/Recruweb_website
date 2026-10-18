import { Setting } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

const CATEGORIES = ["company", "email", "whatsapp", "sms"];

// Sensible empty defaults so the frontend always has a shape to render,
// even before the Super Admin has saved anything for a category.
const DEFAULTS = {
  company: {
    companyName: "Recruweb",
    logo: "",
    website: "",
    supportEmail: "",
    supportPhone: "",
    address: "",
    gstNumber: "",
    timezone: "Asia/Kolkata",
  },
  email: {
    provider: "smtp",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromName: "Recruweb",
    fromEmail: "",
    isEnabled: false,
  },
  whatsapp: {
    provider: "meta_cloud_api",
    phoneNumberId: "",
    accessToken: "",
    businessAccountId: "",
    isEnabled: false,
  },
  sms: {
    provider: "twilio",
    accountSid: "",
    authToken: "",
    senderId: "",
    isEnabled: false,
  },
};

// Fields that should never be echoed back in full once saved.
const SECRET_FIELDS = {
  company: [],
  email: ["smtpPassword"],
  whatsapp: ["accessToken"],
  sms: ["authToken"],
};

const mask = (category, value) => {
  const masked = { ...value };
  for (const field of SECRET_FIELDS[category] || []) {
    if (masked[field]) masked[field] = "••••••••";
  }
  return masked;
};

// GET /api/settings — all categories at once (used by the tabbed Settings screen)
export const getAllSettings = async (req, res) => {
  try {
    const rows = await Setting.findAll();
    const byCategory = Object.fromEntries(
      rows.map((r) => [r.category, r.value]),
    );

    const data = {};
    for (const category of CATEGORIES) {
      const value = { ...DEFAULTS[category], ...(byCategory[category] || {}) };
      data[category] = mask(category, value);
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch settings",
        error: error.message,
      });
  }
};

// GET /api/settings/:category
export const getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!CATEGORIES.includes(category)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `category must be one of: ${CATEGORIES.join(", ")}`,
        });
    }
    const row = await Setting.findOne({ where: { category } });
    const value = { ...DEFAULTS[category], ...(row?.value || {}) };
    res.status(200).json({ success: true, data: mask(category, value) });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch settings",
        error: error.message,
      });
  }
};

// PUT /api/settings/:category — Company Settings / Email Settings / WhatsApp Settings / SMS Settings
export const updateSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!CATEGORIES.includes(category)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `category must be one of: ${CATEGORIES.join(", ")}`,
        });
    }

    let row = await Setting.findOne({ where: { category } });
    const before = row ? row.value : null;

    // Don't let a masked placeholder ("••••••••") coming back from the UI
    // overwrite a real stored secret — only replace secret fields when the
    // caller actually sent a new, non-masked value.
    const incoming = { ...req.body };
    for (const field of SECRET_FIELDS[category] || []) {
      if (incoming[field] === "••••••••") delete incoming[field];
    }

    const merged = { ...DEFAULTS[category], ...(before || {}), ...incoming };

    if (row) {
      await row.update({ value: merged, updatedById: req.user.id });
    } else {
      row = await Setting.create({
        category,
        value: merged,
        updatedById: req.user.id,
      });
    }

    await logAudit({
      req,
      action: "update",
      module: "settings",
      targetType: "Setting",
      targetId: category,
      description: `Updated ${category} settings`,
      changes: { before, after: merged },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Settings updated successfully",
        data: mask(category, merged),
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update settings",
        error: error.message,
      });
  }
};
