import { ExchangeRate } from "../models/index.js";

// Phase 6 — Global Features: multi-currency.
//
// Talks to exchangerate-api.com's v6 REST API (https://www.exchangerate-api.com)
// using EXCHANGE_RATE_API_KEY from .env. This is a real live HTTP call — there
// is no hardcoded/fake rate table in this file. The only numbers that exist
// here are whatever the provider actually returns, and they're persisted to
// the ExchangeRate table so the app keeps working (with a clearly-flagged
// `stale: true`) if the provider is briefly unreachable.
//
// IMPORTANT for whoever deploys this: set EXCHANGE_RATE_API_KEY in backend/.env
// (free tier key from https://www.exchangerate-api.com/ or a compatible
// v6-format provider). Without a key, live conversion is disabled and the
// API responds honestly with success:false rather than pretending to convert.

const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // refresh every 6 hours
const DEFAULT_BASE = "USD";

// A currency this platform recognises for selection in the UI. This list is
// only ISO 4217 codes/names (a real, unchanging standard) — NOT rate data —
// so it's fine to keep as a constant; the actual numeric rates always come
// from the live API call below.
export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "INR", name: "Indian Rupee", symbol: "\u20B9" },
  { code: "EUR", name: "Euro", symbol: "\u20AC" },
  { code: "GBP", name: "British Pound", symbol: "\u00A3" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "JPY", name: "Japanese Yen", symbol: "\u00A5" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
];

const isConfigured = () => Boolean(process.env.EXCHANGE_RATE_API_KEY);

// Fetches fresh rates from the live provider. Throws on any failure —
// callers decide whether to fall back to the DB cache.
const fetchLiveRates = async (base = DEFAULT_BASE) => {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "EXCHANGE_RATE_API_KEY is not set — live currency conversion is disabled.",
    );
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Exchange rate API HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.result !== "success" || !data.conversion_rates) {
    throw new Error(
      `Exchange rate API returned an error: ${data["error-type"] || "unknown error"}`,
    );
  }

  return data.conversion_rates;
};

// Fetches fresh rates and persists them to the DB cache. Called by the
// startup/cron refresh job and by the admin "Refresh Rates Now" endpoint.
export const refreshRates = async (base = DEFAULT_BASE) => {
  try {
    const rates = await fetchLiveRates(base);
    const [row] = await ExchangeRate.findOrCreate({
      where: { baseCurrency: base },
      defaults: { rates, fetchedAt: new Date(), source: "exchangerate-api.com" },
    });
    row.rates = rates;
    row.fetchedAt = new Date();
    row.source = "exchangerate-api.com";
    row.lastErrorMessage = null;
    await row.save();
    return { success: true, rates, fetchedAt: row.fetchedAt };
  } catch (err) {
    // Persist the failure reason without wiping out the last-known-good
    // rates, so convert() can still serve a (clearly flagged) stale value.
    const [row] = await ExchangeRate.findOrCreate({
      where: { baseCurrency: base },
      defaults: { rates: {}, fetchedAt: new Date(0) },
    });
    row.lastErrorMessage = err.message;
    await row.save();
    return { success: false, error: err.message };
  }
};

// Returns the cached rate row, refreshing it first if it's missing or stale.
const getRatesRow = async (base = DEFAULT_BASE) => {
  let row = await ExchangeRate.findOne({ where: { baseCurrency: base } });

  const isStale =
    !row || !row.fetchedAt || Date.now() - new Date(row.fetchedAt).getTime() > REFRESH_INTERVAL_MS;

  if (isStale && isConfigured()) {
    await refreshRates(base);
    row = await ExchangeRate.findOne({ where: { baseCurrency: base } });
  }

  return row;
};

// Converts `amount` from one ISO currency code to another using the latest
// real rates we have. Returns { convertedAmount, rate, stale, fetchedAt }.
// If no live rates are available at all (no API key configured yet, or the
// very first fetch hasn't succeeded), returns { success:false } rather than
// fabricating a rate — callers must handle that honestly in the UI.
export const convert = async (amount, from, to) => {
  const fromCode = (from || DEFAULT_BASE).toUpperCase();
  const toCode = (to || DEFAULT_BASE).toUpperCase();

  if (fromCode === toCode) {
    return {
      success: true,
      convertedAmount: Number(amount),
      rate: 1,
      stale: false,
      fetchedAt: new Date(),
    };
  }

  const row = await getRatesRow(DEFAULT_BASE);
  if (!row || !row.rates || Object.keys(row.rates).length === 0) {
    return {
      success: false,
      message: isConfigured()
        ? "Live exchange rates have not been fetched successfully yet."
        : "EXCHANGE_RATE_API_KEY is not configured on the server.",
    };
  }

  const rates = row.rates;
  if (!rates[fromCode] || !rates[toCode]) {
    return {
      success: false,
      message: `Currency ${!rates[fromCode] ? fromCode : toCode} is not in the latest live rate set.`,
    };
  }

  // rates are all relative to DEFAULT_BASE, so convert via that pivot.
  const amountInBase = Number(amount) / rates[fromCode];
  const convertedAmount = amountInBase * rates[toCode];
  const rate = rates[toCode] / rates[fromCode];

  const stale = Date.now() - new Date(row.fetchedAt).getTime() > REFRESH_INTERVAL_MS;

  return {
    success: true,
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    rate,
    stale,
    fetchedAt: row.fetchedAt,
  };
};

// Returns the full latest rate table (base + all rates + freshness info)
// for the currency selector / admin panel.
export const getLatestRates = async (base = DEFAULT_BASE) => {
  const row = await getRatesRow(base);
  if (!row || !row.rates || Object.keys(row.rates).length === 0) {
    return {
      success: false,
      configured: isConfigured(),
      message: row?.lastErrorMessage || "No live rates fetched yet.",
    };
  }
  return {
    success: true,
    base: row.baseCurrency,
    rates: row.rates,
    fetchedAt: row.fetchedAt,
    source: row.source,
    stale: Date.now() - new Date(row.fetchedAt).getTime() > REFRESH_INTERVAL_MS,
  };
};

export const startCurrencyRefreshScheduler = () => {
  if (!isConfigured()) {
    console.warn(
      "[currencyService] EXCHANGE_RATE_API_KEY not set — multi-currency conversion will stay disabled until it's added to backend/.env.",
    );
    return;
  }
  // Fetch once at startup, then every REFRESH_INTERVAL_MS.
  refreshRates(DEFAULT_BASE);
  setInterval(() => refreshRates(DEFAULT_BASE), REFRESH_INTERVAL_MS);
};
