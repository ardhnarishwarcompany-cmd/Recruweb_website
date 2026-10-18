import { useEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import { getSocket } from "../../utils/socket";
import useAuth from "../../hooks/useAuth";
import MeetingRoom from "../../components/interview/MeetingRoom";
import ScrollIndicator from "../../components/ScrollIndicator";

const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export default function HrPartnerChat({ defaultTab = "candidate" }) {
  const { user } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [candidateThreads, setCandidateThreads] = useState([]);
  const [clientThreads, setClientThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const bottomRef = useRef(null);

  const threads = tab === "candidate" ? candidateThreads : clientThreads;

  const loadThreads = async (kind = tab) => {
    const res =
      kind === "candidate"
        ? await api.crmCandidateChat.getThreads()
        : await api.crmClientChat.getThreads();

    if (res?.success) {
      if (kind === "candidate") setCandidateThreads(res.data || []);
      else setClientThreads(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setSelected(null);
    setMessages([]);
    setText("");
    setLoading(true);
    loadThreads(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onNew = (msg) => {
      const expected = tab === "candidate" ? "candidate" : "client";
      if (msg.thread !== expected) return;

      if (selected && Number(msg.threadId) === Number(selected.id)) {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
      }
      loadThreads(tab);
    };

    socket.on("chat:new_message", onNew);
    return () => socket.off("chat:new_message", onNew);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, tab]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openThread = async (item) => {
    setSelected(item);
    setLoadingMessages(true);

    const res =
      tab === "candidate"
        ? await api.crmCandidateChat.getThreadMessages(item.id)
        : await api.crmClientChat.getThreadMessages(item.id);

    if (res?.success) setMessages(res.data || []);
    else setMessages([]);

    setLoadingMessages(false);

    const socket = getSocket();
    socket?.emit(
      "join:thread",
      `${tab === "candidate" ? "candidate" : "client"}:${item.id}`,
    );
  };

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !selected) return;

    setSending(true);
    const res =
      tab === "candidate"
        ? await api.crmCandidateChat.reply(selected.id, text.trim())
        : await api.crmClientChat.reply(selected.id, text.trim());

    if (res?.success) {
      setMessages((prev) =>
        prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data],
      );
      setText("");
      loadThreads(tab);
    }

    setSending(false);
  };

  const startCall = async () => {
    if (!selected) return;

    const res =
      tab === "candidate"
        ? await api.crmCandidateChat.startCall(selected.id)
        : await api.crmClientChat.startCall(selected.id);

    if (res?.success) {
      setMessages((prev) =>
        prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data],
      );
      setActiveMeeting(res.data);
    }
  };

  const displayName =
    tab === "candidate"
      ? `${selected?.firstName || ""} ${selected?.lastName || ""}`.trim()
      : selected?.name || "";

  return (
    <div className="light-hp-chat-container">
      {/* Live Floating Particles Background */}
      <div className="cand-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="cand-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Marquee Banner */}
      <div className="hp-marquee-banner">
        <div className="hp-marquee-track">
          <span>✨ Recruweb Live HR Communications &amp; CRM Suite</span>
          <span>•</span>
          <span>💬 Real-time Candidate &amp; Client Conversations</span>
          <span>•</span>
          <span>🎥 Secure Video Call Integration</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            💬 <span className="gradient-text">Communications</span>
          </h1>
          <p className="cand-subtitle">
            Real candidate and client conversations from Recruweb. No demo or placeholder chat data is shown.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <div className="hp-chat-tabs" style={{ position: 'relative', zIndex: 2 }}>
        <button
          className={tab === "candidate" ? "active" : ""}
          onClick={() => setTab("candidate")}
        >
          👤 Chat with Candidate
        </button>
        <button
          className={tab === "client" ? "active" : ""}
          onClick={() => setTab("client")}
        >
          🏢 Chat with Client
        </button>
      </div>

      <div className="hp-chat-layout" style={{ position: 'relative', zIndex: 2 }}>
        <aside className="hp-chat-list">
          <div className="hp-list-title">
            {tab === "candidate" ? "Candidate Conversations" : "Client Conversations"}
          </div>

          {loading ? (
            <div className="hp-empty">Loading…</div>
          ) : !threads.length ? (
            <div className="hp-empty">
              No real conversations yet. A candidate/client message will appear here automatically.
            </div>
          ) : (
            threads.map((item) => {
              const name =
                tab === "candidate"
                  ? `${item.firstName || ""} ${item.lastName || ""}`.trim()
                  : item.name;

              const sub =
                tab === "candidate"
                  ? item.email || "Candidate"
                  : item.clientCode || "Client";

              return (
                <button
                  key={item.id}
                  className={`hp-thread ${
                    selected?.id === item.id ? "active" : ""
                  }`}
                  onClick={() => openThread(item)}
                >
                  <span className="hp-avatar">
                    {(name?.[0] || "?").toUpperCase()}
                  </span>
                  <span className="hp-thread-copy">
                    <strong>{name || "Unnamed"}</strong>
                    <small>{sub}</small>
                  </span>
                  {item.unreadCount > 0 && (
                    <span className="hp-unread">{item.unreadCount}</span>
                  )}
                </button>
              );
            })
          )}
        </aside>

        <section className="hp-chat-window">
          {!selected ? (
            <div className="hp-empty-main">
              <div>💬</div>
              <strong>Select a conversation</strong>
              <span>
                Choose a candidate or client from the left to start chatting.
              </span>
            </div>
          ) : (
            <>
              <header className="hp-conversation-header">
                <div>
                  <strong>{displayName}</strong>
                  <span>
                    {tab === "candidate"
                      ? selected.email || "Candidate"
                      : selected.clientCode || "Client"}
                  </span>
                </div>
                <button onClick={startCall} className="cv-action-btn primary glow-btn" style={{ padding: '8px 16px', fontSize: '12.5px' }}>🎥 Start Video Call</button>
              </header>

              <div className="hp-messages">
                {loadingMessages ? (
                  <div className="hp-empty">Loading conversation…</div>
                ) : !messages.length ? (
                  <div className="hp-empty">
                    No messages yet. Send the first message.
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderRole === "staff";
                    return (
                      <div
                        key={m.id}
                        className={`hp-message-row ${mine ? "mine" : ""}`}
                      >
                        <div className="hp-bubble">
                          <small>
                            {m.sender?.name ||
                              (mine
                                ? user?.name || "You"
                                : tab === "candidate"
                                  ? "Candidate"
                                  : "Client")}
                          </small>
                          <div>{m.message}</div>

                          {m.type === "call_invite" && m.meetingLink && (
                            <button
                              className="hp-join"
                              onClick={() => setActiveMeeting(m)}
                            >
                              🎥 Join Call
                            </button>
                          )}

                          <time>{fmtTime(m.createdAt)}</time>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form className="hp-compose" onSubmit={send}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message ${tab === "candidate" ? "candidate" : "client"}…`}
                  className="cand-input"
                />
                <button disabled={sending || !text.trim()} className="cv-action-btn primary glow-btn" style={{ padding: '10px 20px' }}>
                  {sending ? "Sending…" : "Send"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      {activeMeeting && (
        <MeetingRoom
          meetingLink={activeMeeting.meetingLink}
          displayName={user?.name || "HR Partner"}
          onClose={() => setActiveMeeting(null)}
        />
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-hp-chat-container {
          position: relative;
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 3vw 80px;
          color: #0f172a;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        /* Live Floating Particles Background */
        .cand-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .cand-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.4;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        /* Marquee Ribbon */
        .hp-marquee-banner {
          background: linear-gradient(90deg, #4f46e5, #9333ea);
          color: #ffffff;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
          margin-bottom: 24px;
        }

        .hp-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .hp-marquee-track span {
          margin: 0 20px;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .cand-header-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          padding: 28px 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-header-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .cand-header-3d:hover .card-glow-bar {
          transform: scaleX(1);
        }

        .cand-title {
          font-size: 30px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .hp-chat-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }

        .hp-chat-tabs button {
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          border-radius: 16px;
          padding: 11px 20px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          transition: all 0.2s ease;
        }

        .hp-chat-tabs button.active {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
        }

        .hp-chat-tabs button:hover:not(.active) {
          background: #f1f5f9;
          color: #0f172a;
        }

        .hp-chat-layout {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 24px;
          height: 650px;
        }

        .hp-chat-list, .hp-chat-window {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .hp-chat-list { overflow-y: auto; }

        .hp-list-title {
          padding: 18px 20px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1.5px solid #e2e8f0;
          color: #64748b;
          background: #f8fafc;
        }

        .hp-thread {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 0;
          border-bottom: 1px solid #f1f5f9;
          background: transparent;
          color: inherit;
          padding: 14px 18px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
        }

        .hp-thread:hover { background: #f8fafc; }

        .hp-thread.active {
          background: #e0e7ff;
          box-shadow: inset 4px 0 #4f46e5;
        }

        .hp-avatar {
          flex: 0 0 40px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 900;
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .hp-thread-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .hp-thread-copy strong {
          font-size: 13.5px;
          font-weight: 800;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hp-thread-copy small {
          color: #64748b;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hp-unread {
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
        }

        .hp-conversation-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 24px;
          border-bottom: 1.5px solid #e2e8f0;
          background: #f8fafc;
        }

        .hp-conversation-header div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .hp-conversation-header strong {
          font-size: 15.5px;
          font-weight: 900;
          color: #0f172a;
        }

        .hp-conversation-header span {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .hp-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #ffffff;
        }

        .hp-message-row {
          display: flex;
          justify-content: flex-start;
        }

        .hp-message-row.mine {
          justify-content: flex-end;
        }

        .hp-bubble {
          max-width: 72%;
          padding: 14px 18px;
          border-radius: 16px;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          line-height: 1.5;
          font-size: 13.5px;
          color: #334155;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .hp-message-row.mine .hp-bubble {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
        }

        .hp-bubble small {
          display: block;
          opacity: 0.8;
          font-weight: 800;
          margin-bottom: 4px;
          font-size: 11px;
          text-transform: uppercase;
        }

        .hp-bubble time {
          display: block;
          margin-top: 6px;
          text-align: right;
          opacity: 0.6;
          font-size: 10.5px;
          font-weight: 700;
        }

        .hp-join {
          margin-top: 10px;
          border: 0;
          border-radius: 10px;
          padding: 8px 14px;
          background: #10b981;
          color: #fff;
          font-weight: 800;
          font-size: 12.5px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .hp-compose {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1.5px solid #e2e8f0;
          background: #f8fafc;
        }

        .cand-input {
          flex: 1;
          min-width: 0;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s;
        }

        .cand-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
        }

        .cv-action-btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
        }

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .hp-empty, .hp-empty-main {
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          padding: 40px 20px;
        }

        .hp-empty-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .hp-empty-main div { font-size: 38px; }
        .hp-empty-main strong { color: #0f172a; font-size: 16px; font-weight: 900; }
        .hp-empty-main span { color: #64748b; font-weight: 600; font-size: 13.5px; }

        @media (max-width: 900px) {
          .hp-chat-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .hp-chat-list { max-height: 280px; }
          .hp-chat-window { min-height: 560px; }
        }
      `}</style>
    </div>
  );
}