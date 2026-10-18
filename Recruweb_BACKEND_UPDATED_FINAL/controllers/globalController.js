import { User } from "../models/index.js";
import {
  SUPPORTED_CURRENCIES,
  getLatestRates,
  convert,
  refreshRates,
} from "../utils/currencyService.js";
import {
  getAllTimezones,
  getTimezonesWithOffsets,
  isValidTimezone,
} from "../utils/timezoneUtils.js";

// GET /api/global/currencies
// Live rate table (or an honest success:false if not fetched yet) plus the
// static ISO 4217 code/name/symbol list for the currency picker.
export const listCurrencies = async (req, res) => {
  try {
    const base = (req.query.base || "USD").toUpperCase();
    const rateData = await getLatestRates(base);
    res.json({
      success: true,
      currencies: SUPPORTED_CURRENCIES,
      rates: rateData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/global/timezones
export const listTimezones = async (req, res) => {
  try {
    const withOffsets = req.query.withOffsets !== "false";
    res.json({
      success: true,
      timezones: withOffsets ? getTimezonesWithOffsets() : getAllTimezones(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/global/convert?amount=1000&from=USD&to=INR
export const convertAmount = async (req, res) => {
  try {
    const { amount, from, to } = req.query;
    if (amount === undefined || !from || !to) {
      return res.status(400).json({
        success: false,
        message: "amount, from and to query params are required",
      });
    }
    const numAmount = Number(amount);
    if (Number.isNaN(numAmount)) {
      return res.status(400).json({ success: false, message: "amount must be numeric" });
    }
    const result = await convert(numAmount, from, to);
    if (!result.success) {
      return res.status(503).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/global/preferences — the logged-in user's own timezone/currency.
export const getMyPreferences = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "timezone", "preferredCurrency"],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, preferences: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/global/preferences — update timezone and/or preferred currency.
export const updateMyPreferences = async (req, res) => {
  try {
    const { timezone, preferredCurrency } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (timezone !== undefined) {
      if (!isValidTimezone(timezone)) {
        return res.status(400).json({
          success: false,
          message: `"${timezone}" is not a recognised IANA timezone`,
        });
      }
      user.timezone = timezone;
    }

    if (preferredCurrency !== undefined) {
      const code = String(preferredCurrency).toUpperCase();
      const known = SUPPORTED_CURRENCIES.some((c) => c.code === code);
      if (!known) {
        return res.status(400).json({
          success: false,
          message: `"${preferredCurrency}" is not a supported currency code`,
        });
      }
      user.preferredCurrency = code;
    }

    await user.save();
    res.json({
      success: true,
      message: "Preferences updated",
      preferences: {
        id: user.id,
        timezone: user.timezone,
        preferredCurrency: user.preferredCurrency,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/global/refresh-rates — Admin/Super Admin only, manual refresh.
export const refreshRatesNow = async (req, res) => {
  try {
    const base = (req.body.base || "USD").toUpperCase();
    const result = await refreshRates(base);
    if (!result.success) {
      return res.status(502).json(result);
    }
    res.json({ success: true, message: "Exchange rates refreshed live", ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
