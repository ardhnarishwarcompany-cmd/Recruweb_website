// Phase 6 — Global Features: multi-currency / multi-timezone formatting.
// Every function here uses the browser's built-in Intl API — no hardcoded
// symbol tables, no fake offset lists.

// Formats a numeric amount as currency using the ISO 4217 code, e.g.
// formatCurrency(1234.5, "INR") -> "\u20B91,234.50"
export const formatCurrency = (amount, currencyCode = "USD") => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return "\u2014";
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "symbol",
    }).format(Number(amount));
  } catch {
    // Unknown/unsupported code — fall back to a plain labelled number
    // rather than crash the UI.
    return `${currencyCode} ${Number(amount).toFixed(2)}`;
  }
};

// Formats a date/ISO string in a specific IANA timezone, e.g. for showing
// each participant's interview time correctly in their own zone.
export const formatInTimezone = (
  date,
  timeZone = "UTC",
  { dateStyle = "medium", timeStyle = "short" } = {},
) => {
  if (!date) return "\u2014";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "\u2014";
  try {
    return new Intl.DateTimeFormat(undefined, { timeZone, dateStyle, timeStyle }).format(d);
  } catch {
    return d.toLocaleString();
  }
};

// The browser's own real timezone (never guessed) — used once on first
// login to seed the user's preference before they've explicitly chosen one.
export const detectBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};
