import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../utils/api";

const SESSION_KEY = "rw_contact_chat";
const READ_KEY = "rw_contact_chat_read";
const POLL_MS = 4000;

const safeGet = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k) || "null");
  } catch {
    return null;
  }
};
const safeSet = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
};
const safeDel = (k) => {
  try {
    localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
};

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "HR";

const fmtTime = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === today.toDateString()
    ? t
    : `${d.toLocaleDateString([], { day: "2-digit", month: "short" })}, ${t}`;
};

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

// stage: "form" -> (Send Message) -> HR popup -> "chat"
// prefill  = values from an external form (Contact page): skips the built-in form and goes straight to the HR popup.
export default function ContactChat({ active, onUnread, prefill, onStarted, onCancel }) {
  const saved = useRef(prefill ? null : safeGet(SESSION_KEY));
  const pending = useRef(null);
  const autoStarted = useRef(false);
  const [stage, setStage] = useState(saved.current?.token ? "chat" : "form");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  // HR popup
  const [showHrs, setShowHrs] = useState(false);
  const [hrs, setHrs] = useState([]);
  const [hrsLoading, setHrsLoading] = useState(false);
  const [hrsError, setHrsError] = useState("");
  const [starting, setStarting] = useState(false);

  // chat
  const [token, setToken] = useState(saved.current?.token || "");
  const [hrName, setHrName] = useState(saved.current?.hrName || "");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(true);
  const [closed, setClosed] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const msgsRef = useRef([]);
  const endRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const markRead = useCallback((list) => {
    const maxId = list.reduce((m, x) => Math.max(m, x.id), 0);
    const prev = safeGet(READ_KEY) || 0;
    if (maxId > prev) safeSet(READ_KEY, maxId);
    onUnread?.(0);
  }, [onUnread]);

  const mergeMessages = useCallback(
    (incoming) => {
      if (!incoming.length) return;
      const prev = msgsRef.current;
      const seen = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !seen.has(m.id));
      if (!fresh.length) return;
      const next = [...prev, ...fresh];
      msgsRef.current = next;
      lastId.current = next.reduce((m, x) => Math.max(m, x.id), 0);
      setMessages(next);
      if (activeRef.current && !document.hidden) {
        markRead(next);
      } else {
        const readUpTo = safeGet(READ_KEY) || 0;
        onUnread?.(next.filter((m) => m.from === "staff" && m.id > readUpTo).length);
      }
    },
    [markRead, onUnread],
  );

  const poll = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.websiteChat.getMessages(token, lastId.current);
      if (res?.success) {
        setConnected(true);
        if (res.data?.hr?.name) setHrName(res.data.hr.name);
        setClosed(res.data?.status === "closed");
        mergeMessages(res.data?.messages || []);
      } else if (res && /not found/i.test(res.message || "")) {
        // chat no longer exists on the HRMS
        safeDel(SESSION_KEY);
        safeDel(READ_KEY);
        setToken("");
        setMessages([]);
        msgsRef.current = [];
        lastId.current = 0;
        setStage("form");
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
  }, [token, mergeMessages]);

  // Poll while a chat exists (keeps running when the Contact tab is in the background)
  useEffect(() => {
    if (stage !== "chat" || !token) return undefined;
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [stage, token, poll]);

  // Opening the tab clears unread
  useEffect(() => {
    if (active && stage === "chat") markRead(messages);
  }, [active, stage, messages, markRead]);

  useEffect(() => {
    if (active) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, active, stage]);

  const onField = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const startFlow = async (values) => {
    setError("");
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setError("Please fill in your name, email and message.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    pending.current = values;
    setShowHrs(true);
    setHrsLoading(true);
    setHrsError("");
    try {
      const res = await api.websiteChat.getHrs();
      if (res?.success) setHrs(res.data || []);
      else setHrsError(res?.message || "Could not load the HR team.");
    } catch {
      setHrsError("Could not load the HR team. Please try again.");
    }
    setHrsLoading(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    startFlow(form);
  };

  const closeHrPopup = () => {
    if (starting) return;
    setShowHrs(false);
    if (prefill && stage === "form") onCancel?.();
  };

  // Started from the Contact page form
  useEffect(() => {
    if (prefill && !autoStarted.current) {
      autoStarted.current = true;
      startFlow(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  // Another instance (e.g. the Contact page) started a chat -> follow it
  useEffect(() => {
    if (prefill) return undefined;
    const sync = () => {
      const sess = safeGet(SESSION_KEY);
      if (sess?.token && sess.token !== tokenRef.current) {
        lastId.current = 0;
        msgsRef.current = [];
        setMessages([]);
        setClosed(false);
        setToken(sess.token);
        setHrName(sess.hrName || "");
        setStage("chat");
      }
    };
    window.addEventListener("rw-chat-session", sync);
    return () => window.removeEventListener("rw-chat-session", sync);
  }, [prefill]);

  const pickHr = async (hr) => {
    if (starting) return;
    setStarting(true);
    setHrsError("");
    try {
      const res = await api.websiteChat.submit({ ...(pending.current || form), hrId: hr.id });
      if (res?.success && res.data?.token) {
        const s = { token: res.data.token, hrName: res.data.hr?.name || hr.name };
        safeSet(SESSION_KEY, s);
        safeDel(READ_KEY);
        lastId.current = 0;
        msgsRef.current = [];
        setMessages([]);
        setClosed(false);
        setToken(s.token);
        setHrName(s.hrName);
        setForm(EMPTY);
        setShowHrs(false);
        setStage("chat");
        window.dispatchEvent(new Event("rw-chat-session"));
        onStarted?.();
      } else {
        setHrsError(res?.message || "Could not start the chat. Please pick again.");
      }
    } catch {
      setHrsError("Could not reach the server. Please try again.");
    }
    setStarting(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending || closed) return;
    setSending(true);
    try {
      const res = await api.websiteChat.send(token, text);
      if (res?.success) {
        setDraft("");
        setConnected(true);
        poll();
      } else {
        setConnected(false);
        if (/closed/i.test(res?.message || "")) setClosed(true);
      }
    } catch {
      setConnected(false);
    }
    setSending(false);
  };

  const newConversation = () => {
    safeDel(SESSION_KEY);
    safeDel(READ_KEY);
    lastId.current = 0;
    msgsRef.current = [];
    setToken("");
    setMessages([]);
    setClosed(false);
    onUnread?.(0);
    setStage("form");
  };

  return (
    <div className="cc-root">
      {stage === "form" && prefill && <div className="cc-empty">Choose an HR to continue…</div>}

      {stage === "form" && !prefill && (
        <form className="cc-form" onSubmit={handleSendMessage}>
          <p className="cc-intro">Share your details and we'll connect you with our HR team.</p>
          <input name="name" placeholder="Your name *" value={form.name} onChange={onField} maxLength={150} />
          <input name="email" type="email" placeholder="Email *" value={form.email} onChange={onField} maxLength={150} />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={onField} maxLength={30} />
          <input name="subject" placeholder="Subject" value={form.subject} onChange={onField} maxLength={200} />
          <textarea
            name="message"
            placeholder="Your inquiry *"
            rows={4}
            value={form.message}
            onChange={onField}
            maxLength={2000}
          />
          {error && <div className="cc-error">{error}</div>}
          <button type="submit" className="cc-primary">Send Message</button>
        </form>
      )}

      {stage === "chat" && (
        <div className="cc-chat">
          <div className="cc-chat-head">
            <div className="cc-avatar">{initials(hrName)}</div>
            <div className="cc-chat-title">
              <strong>{hrName || "HR Team"}</strong>
              <span className={connected ? "cc-on" : "cc-off"}>
                <i /> {closed ? "Chat closed" : connected ? "Connected" : "Reconnecting…"}
              </span>
            </div>
            <button type="button" className="cc-link" onClick={newConversation}>New chat</button>
          </div>

          <div className="cc-msgs">
            {messages.length === 0 && <div className="cc-empty">Loading conversation…</div>}
            {messages.map((m) => (
              <div key={m.id} className={`cc-msg ${m.from === "me" ? "me" : "staff"}`}>
                {m.from !== "me" && <span className="cc-name">{m.name}</span>}
                <div className="cc-bubble">{m.text}</div>
                <span className="cc-time">{fmtTime(m.at)}</span>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {closed ? (
            <div className="cc-closed">
              This chat was closed by the HR team.{" "}
              <button type="button" className="cc-link" onClick={newConversation}>Start a new conversation</button>
            </div>
          ) : (
            <form className="cc-send" onSubmit={sendMessage}>
              <input
                placeholder="Type your message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={2000}
              />
              <button type="submit" disabled={!draft.trim() || sending} className="cc-send-btn">
                Send
              </button>
            </form>
          )}
        </div>
      )}

      {showHrs && (
        <div className="cc-overlay" role="dialog" aria-label="Select HR">
          <div className="cc-popup">
            <div className="cc-popup-head">
              <strong>Choose an HR to chat with</strong>
              <button type="button" className="cc-x" onClick={closeHrPopup} aria-label="Close">×</button>
            </div>
            <div className="cc-popup-body">
              {hrsLoading && <div className="cc-empty">Loading HR team…</div>}
              {!hrsLoading && hrsError && <div className="cc-error">{hrsError}</div>}
              {!hrsLoading && !hrsError && hrs.length === 0 && (
                <div className="cc-empty">No HR is available right now. Please try again later.</div>
              )}
              {hrs.map((hr) => (
                <button key={hr.id} type="button" className="cc-hr" disabled={starting} onClick={() => pickHr(hr)}>
                  <span className="cc-avatar">{initials(hr.name)}</span>
                  <span className="cc-hr-info">
                    <strong>{hr.name}</strong>
                    <small>{hr.designation || "HR"}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cc-root{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:#fff}
        .cc-form{flex:1;overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:10px}
        .cc-intro{margin:0 0 4px;font-size:13px;color:#64748b}
        .cc-form input,.cc-form textarea,.cc-send input{border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 12px;font:inherit;font-size:14px;outline:none;width:100%;box-sizing:border-box}
        .cc-form input:focus,.cc-form textarea:focus,.cc-send input:focus{border-color:#667eea}
        .cc-form textarea{resize:none}
        .cc-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:0;border-radius:12px;padding:11px;font-weight:600;cursor:pointer}
        .cc-error{background:#fef2f2;color:#b91c1c;border-radius:10px;padding:8px 10px;font-size:13px}
        .cc-chat{flex:1;min-height:0;display:flex;flex-direction:column}
        .cc-chat-head{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #eef2f7}
        .cc-chat-title{flex:1;display:flex;flex-direction:column;font-size:14px}
        .cc-chat-title span{font-size:11px;display:flex;align-items:center;gap:5px}
        .cc-chat-title i{width:7px;height:7px;border-radius:50%;display:inline-block;background:currentColor}
        .cc-on{color:#16a34a}.cc-off{color:#d97706}
        .cc-link{background:none;border:0;color:#667eea;cursor:pointer;font-size:12px;padding:0}
        .cc-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex:none}
        .cc-msgs{flex:1;min-height:0;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px;background:#f8fafc}
        .cc-empty{color:#94a3b8;font-size:13px;text-align:center;padding:14px}
        .cc-msg{display:flex;flex-direction:column;max-width:82%;gap:2px}
        .cc-msg.me{align-self:flex-end;align-items:flex-end}
        .cc-msg.staff{align-self:flex-start}
        .cc-name{font-size:11px;color:#64748b}
        .cc-bubble{padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.4;white-space:pre-wrap;word-break:break-word}
        .cc-msg.me .cc-bubble{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-bottom-right-radius:4px}
        .cc-msg.staff .cc-bubble{background:#fff;color:#1e293b;border:1px solid #e2e8f0;border-bottom-left-radius:4px}
        .cc-time{font-size:10px;color:#94a3b8}
        .cc-send{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #eef2f7}
        .cc-send-btn{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:0;border-radius:12px;padding:0 16px;font-weight:600;cursor:pointer}
        .cc-send-btn:disabled{opacity:.5;cursor:default}
        .cc-closed{padding:12px;text-align:center;font-size:13px;color:#64748b;border-top:1px solid #eef2f7}
        .cc-overlay{position:absolute;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:flex-end;z-index:5}
        .cc-popup{background:#fff;width:100%;max-height:85%;display:flex;flex-direction:column;border-radius:20px 20px 0 0}
        .cc-popup-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eef2f7;font-size:14px}
        .cc-x{background:none;border:0;font-size:22px;line-height:1;cursor:pointer;color:#64748b}
        .cc-popup-body{overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
        .cc-hr{display:flex;align-items:center;gap:12px;text-align:left;background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:10px 12px;cursor:pointer;font:inherit}
        .cc-hr:hover:not(:disabled){border-color:#667eea;background:#f5f7ff}
        .cc-hr:disabled{opacity:.6;cursor:default}
        .cc-hr-info{display:flex;flex-direction:column}
        .cc-hr-info small{color:#64748b;font-size:12px}
      `}</style>
    </div>
  );
}
