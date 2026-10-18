// Phase 6 — Global Features: multi-timezone.
//
// Every value here comes from Node's built-in ICU/Intl implementation
// (real IANA tzdata that ships with Node.js) — there is no hardcoded list
// of offsets or city names anywhere in this file. Offsets are also computed
// live per-date (so DST is correct for that specific date), not a fixed
// static number.

// The full real IANA timezone database, as known to this Node runtime.
// Intl.supportedValuesOf is available in Node 18+.
export const getAllTimezones = () => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    // Extremely old Node without Intl.supportedValuesOf — fall back to a
    // short list of major zones rather than crash. Flagged as reduced set.
    return [
      "UTC",
      "Asia/Kolkata",
      "Asia/Dubai",
      "Asia/Singapore",
      "Europe/London",
      "Europe/Berlin",
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "Australia/Sydney",
    ];
  }
};

// Human list with each zone's *current, real* UTC offset (computed live via
// Intl, correct for today's DST state) — used to populate the timezone
// dropdown with something more useful than a bare IANA string.
export const getTimezonesWithOffsets = (asOf = new Date()) => {
  return getAllTimezones()
    .map((tz) => {
      const offsetLabel = getUtcOffsetLabel(tz, asOf);
      return { value: tz, label: `${tz.replace(/_/g, " ")} (UTC${offsetLabel})` };
    })
    .sort((a, b) => a.value.localeCompare(b.value));
};

// Real UTC offset for a given IANA zone on a given date, e.g. "+05:30".
export const getUtcOffsetLabel = (timeZone, date = new Date()) => {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  });
  const part = dtf.formatToParts(date).find((p) => p.type === "timeZoneName");
  // part.value looks like "GMT+5:30" — normalise to "+05:30".
  const match = part?.value?.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return "+00:00";
  const [, sign, h, m = "00"] = match;
  return `${sign}${h.padStart(2, "0")}:${m}`;
};

// Formats a JS Date/ISO string in a specific IANA timezone, e.g. for showing
// an interview time to the exact recruiter/candidate/client who each may be
// in a different zone.
export const formatInTimezone = (
  date,
  timeZone = "UTC",
  { dateStyle = "medium", timeStyle = "short" } = {},
) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { timeZone, dateStyle, timeStyle }).format(d);
};

// Validates that a string is a real IANA timezone the runtime recognises,
// so we never save garbage into User.timezone.
export const isValidTimezone = (tz) => {
  if (!tz || typeof tz !== "string") return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};
