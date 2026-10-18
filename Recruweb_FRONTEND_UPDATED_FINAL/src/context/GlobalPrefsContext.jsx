import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { getToken } from "../utils/api";
import { detectBrowserTimezone } from "../utils/globalFormat";

// Phase 6 — Global Features. Holds the user's chosen (or auto-detected)
// timezone + currency, and the live currency list/rates fetched from the
// real backend (/api/global/*). Nothing here is hardcoded sample data —
// on failure we surface `ratesAvailable:false` rather than pretending.

const GlobalPrefsContext = createContext(null);

const LOCAL_TZ_KEY = "recruweb_timezone";
const LOCAL_CCY_KEY = "recruweb_currency";

export const GlobalPrefsProvider = ({ children }) => {
  const [timezone, setTimezoneState] = useState(
    localStorage.getItem(LOCAL_TZ_KEY) || detectBrowserTimezone(),
  );
  const [currency, setCurrencyState] = useState(
    localStorage.getItem(LOCAL_CCY_KEY) || "USD",
  );
  const [currencyList, setCurrencyList] = useState([]);
  const [ratesAvailable, setRatesAvailable] = useState(false);
  const [ratesFetchedAt, setRatesFetchedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the real supported-currency list + live rate freshness once.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/global/currencies");
        setCurrencyList(data.currencies || []);
        setRatesAvailable(Boolean(data.rates?.success));
        setRatesFetchedAt(data.rates?.fetchedAt || null);
      } catch {
        // Backend not reachable / route missing — degrade silently, the
        // rest of the app must keep working without currency conversion.
        setRatesAvailable(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // If logged in, pull the user's saved preference from the DB (source of
  // truth) and reconcile with what's cached locally.
  useEffect(() => {
    if (!getToken()) return;
    (async () => {
      try {
        const { data } = await api.get("/global/preferences");
        if (data?.preferences?.timezone) {
          setTimezoneState(data.preferences.timezone);
          localStorage.setItem(LOCAL_TZ_KEY, data.preferences.timezone);
        }
        if (data?.preferences?.preferredCurrency) {
          setCurrencyState(data.preferences.preferredCurrency);
          localStorage.setItem(LOCAL_CCY_KEY, data.preferences.preferredCurrency);
        }
      } catch {
        // Not logged in yet, or route unreachable — keep local/detected values.
      }
    })();
  }, []);

  const persist = useCallback(async (patch) => {
    if (!getToken()) return; // Guest — local-only preference, nothing to save server-side.
    try {
      await api.put("/global/preferences", patch);
    } catch {
      // Non-fatal — the UI already updated optimistically below.
    }
  }, []);

  const setTimezone = useCallback(
    (tz) => {
      setTimezoneState(tz);
      localStorage.setItem(LOCAL_TZ_KEY, tz);
      persist({ timezone: tz });
    },
    [persist],
  );

  const setCurrency = useCallback(
    (code) => {
      setCurrencyState(code);
      localStorage.setItem(LOCAL_CCY_KEY, code);
      persist({ preferredCurrency: code });
    },
    [persist],
  );

  return (
    <GlobalPrefsContext.Provider
      value={{
        timezone,
        setTimezone,
        currency,
        setCurrency,
        currencyList,
        ratesAvailable,
        ratesFetchedAt,
        loading,
      }}
    >
      {children}
    </GlobalPrefsContext.Provider>
  );
};

export const useGlobalPrefs = () => {
  const ctx = useContext(GlobalPrefsContext);
  if (!ctx) {
    throw new Error("useGlobalPrefs must be used within a GlobalPrefsProvider");
  }
  return ctx;
};
