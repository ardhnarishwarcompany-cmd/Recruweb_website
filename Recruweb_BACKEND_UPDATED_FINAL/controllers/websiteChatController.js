// Recruweb website  ->  HRMS "website-bridge" (already live on the HRMS VPS).
// The browser never sees the bridge key: it talks to these routes, and this
// server forwards to  <HRMS_BRIDGE_URL>/public/*  with the x-bridge-key header.
//
// .env (this backend):
//   WB_BRIDGE_KEY=<same value as WB_BRIDGE_KEY in the HRMS backend .env>
//   HRMS_BRIDGE_URL=https://ardhnarishwar-hrms-backend.recruweb.com/api/website-bridge   (optional, this is the default)

const BASE = () =>
  (process.env.HRMS_BRIDGE_URL || "https://ardhnarishwar-adminhrms.recruweb.com/api/website-bridge").replace(/\/+$/, "");

const TOKEN_RE = /^[a-f0-9]{48}$/;
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

const forward = async (res, path, { method = "GET", body } = {}) => {
  const key = process.env.WB_BRIDGE_KEY;
  if (!key) {
    return res.status(503).json({ success: false, message: "Live chat is not configured yet." });
  }
  try {
    const r = await fetch(`${BASE()}${path}`, {
      method,
      headers: { "Content-Type": "application/json", "x-bridge-key": key },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const json = await r.json().catch(() => null);
    if (!json) return res.status(502).json({ success: false, message: "Chat service returned an invalid response." });
    // Never relay bridge auth/config errors (401/503) to visitors as-is.
    if (r.status === 401 || r.status === 503) {
      console.error("[website-chat] bridge rejected request:", r.status, json.message);
      return res.status(502).json({ success: false, message: "Chat service is temporarily unavailable." });
    }
    return res.status(r.status).json(json);
  } catch (e) {
    console.error("[website-chat] bridge unreachable:", e.message);
    return res.status(502).json({ success: false, message: "Could not reach the HR team right now. Please try again." });
  }
};

// GET /api/website-chat/hrs  -> live list of active HR employees from the HRMS
export const listHrs = (req, res) => forward(res, "/public/hrs");

// POST /api/website-chat/contact  -> saves the form in HRMS, assigned to the chosen HR, returns chat token
export const submitContact = (req, res) => {
  const b = req.body || {};
  const payload = {
    name: clean(b.name, 150),
    email: clean(b.email, 150),
    phone: clean(b.phone, 30),
    subject: clean(b.subject, 200),
    message: clean(b.message, 2000),
    hrId: clean(b.hrId, 40),
  };
  if (!payload.name || !payload.email || !payload.message || !payload.hrId) {
    return res.status(400).json({ success: false, message: "Name, email, message and HR selection are required." });
  }
  return forward(res, "/public/contacts", { method: "POST", body: payload });
};

// GET /api/website-chat/chat/:token?after=<lastMessageId>
export const getChat = (req, res) => {
  if (!TOKEN_RE.test(req.params.token)) return res.status(404).json({ success: false, message: "Chat not found." });
  const after = Math.max(0, parseInt(req.query.after, 10) || 0);
  return forward(res, `/public/chat/${req.params.token}?after=${after}`);
};

// POST /api/website-chat/chat/:token   { text }
export const sendChat = (req, res) => {
  if (!TOKEN_RE.test(req.params.token)) return res.status(404).json({ success: false, message: "Chat not found." });
  const text = clean(req.body?.text, 2000);
  if (!text) return res.status(400).json({ success: false, message: "Message is empty." });
  return forward(res, `/public/chat/${req.params.token}`, { method: "POST", body: { text } });
};
