import { useEffect, useState } from "react";
import api from "../api/axios";
import { useGlobalPrefs } from "../context/GlobalPrefsContext";
import { formatInTimezone } from "../utils/globalFormat";

// Phase 6 — Global Features. Drop this into any Settings/Profile page
// (Admin, Candidate, Client) to let the logged-in user pick their own
// timezone + display currency. Timezones come live from the backend's
// real IANA list (Intl.supportedValuesOf under the hood) — nothing here
// is a hardcoded dropdown of city names.
const GlobalPreferences = () => {
  const { timezone, setTimezone, currency, setCurrency, currencyList, ratesAvailable, ratesFetchedAt } =
    useGlobalPrefs();
  const [timezones, setTimezones] = useState([]);
  const [loadingTz, setLoadingTz] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/global/timezones");
        setTimezones(data.timezones || []);
      } catch {
        setTimezones([]);
      } finally {
        setLoadingTz(false);
      }
    })();
  }, []);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="global-prefs-card" style={{ maxWidth: 520 }}>
      <h3 style={{ marginBottom: 4 }}>Region &amp; Currency</h3>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
        Controls the timezone your interview/calendar times are shown in, and
        the currency salaries/invoices/revenue are displayed in.
      </p>

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        Timezone
      </label>
      <select
        value={timezone}
        disabled={loadingTz}
        onChange={(e) => {
          setTimezone(e.target.value);
          flashSaved();
        }}
        style={{ width: "100%", padding: "8px 10px", marginBottom: 4, borderRadius: 6 }}
      >
        {!timezones.find((t) => t.value === timezone) && (
          <option value={timezone}>{timezone}</option>
        )}
        {timezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
        Right now: {formatInTimezone(new Date(), timezone)}
      </div>

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        Display Currency
      </label>
      <select
        value={currency}
        onChange={(e) => {
          setCurrency(e.target.value);
          flashSaved();
        }}
        style={{ width: "100%", padding: "8px 10px", marginBottom: 4, borderRadius: 6 }}
      >
        {currencyList.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.name} ({c.symbol})
          </option>
        ))}
      </select>

      {ratesAvailable ? (
        <div style={{ fontSize: 12, color: "#16a34a" }}>
          Live exchange rates last updated{" "}
          {ratesFetchedAt ? formatInTimezone(ratesFetchedAt, timezone) : "recently"}.
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#b45309" }}>
          Live currency conversion isn't configured on this server yet
          (EXCHANGE_RATE_API_KEY missing) — amounts will show in their
          original currency until it's added.
        </div>
      )}

      {saved && <div style={{ fontSize: 12, color: "#2563eb", marginTop: 8 }}>Saved ✓</div>}
    </div>
  );
};

export default GlobalPreferences;
