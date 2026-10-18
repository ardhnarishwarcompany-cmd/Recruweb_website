// Forwards website form submissions to HRMS "Website Forms" via the website-bridge.
//
// .env (this backend):
//   WB_BRIDGE_KEY=<same value as WB_BRIDGE_KEY in the HRMS backend .env>
//   HRMS_BRIDGE_URL=https://ardhnarishwar-adminhrms.recruweb.com/api/website-bridge
//
// sendToHrms() NEVER throws: if HRMS is down or the key is wrong, the website
// form still works and the problem is only logged.

const BASE = () =>
  (process.env.HRMS_BRIDGE_URL || "https://ardhnarishwar-adminhrms.recruweb.com/api/website-bridge").replace(/\/+$/, "");

export const sendToHrms = async (payload) => {
  const key = process.env.WB_BRIDGE_KEY;
  if (!key) {
    console.error("[hrms-bridge] WB_BRIDGE_KEY is not set - skipping HRMS sync");
    return false;
  }
  try {
    const r = await fetch(`${BASE()}/public/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bridge-key": key },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const json = await r.json().catch(() => null);
    if (!r.ok || !json?.success) {
      console.error("[hrms-bridge] HRMS rejected submission:", r.status, json?.message || "invalid response");
      return false;
    }
    return true;
  } catch (e) {
    console.error("[hrms-bridge] HRMS unreachable:", e.message);
    return false;
  }
};
