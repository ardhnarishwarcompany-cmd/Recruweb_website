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

export default function AdminCandidateChat() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    const onNew = (msg) => {
      if (msg.thread !== "candidate") return;
      if (selected && msg.threadId === selected.id) {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
      }
      loadThreads();
    };
    socket.on("chat:new_message", onNew);
    return () => socket.off("chat:new_message", onNew);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadThreads = async () => {
    setLoadingThreads(true);
    const res = await api.crmCandidateChat.getThreads();
    if (res?.success) setThreads(res.data || []);
    setLoadingThreads(false);
  };

  const openThread = async (candidate) => {
    setSelected(candidate);
    setLoadingMessages(true);
    const res = await api.crmCandidateChat.getThreadMessages(candidate.id);
    if (res?.success) setMessages(res.data || []);
    setLoadingMessages(false);
    const socket = getSocket();
    socket?.emit("join:thread", `candidate:${candidate.id}`);
  };

  const send = async () => {
    if (!text.trim() || !selected) return;
    setSending(true);
    const res = await api.crmCandidateChat.reply(selected.id, text.trim());
    setSending(false);
    if (res?.success) {
      setMessages((prev) => [...prev, res.data]);
      setText("");
    }
  };

  const startCall = async () => {
    if (!selected) return;
    const res = await api.crmCandidateChat.startCall(selected.id);
    if (res?.success) {
      setMessages((prev) => [...prev, res.data]);
      setActiveMeeting(res.data);
    }
  };

  return (
    <div className="light-chat-container">
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
      <div className="chat-marquee-banner">
        <div className="chat-marquee-track">
          <span>✨ Recruweb Enterprise Candidate Live Chat &amp; CRM Support Hub</span>
          <span>•</span>
          <span>💬 Real-time Conversational Interface with Instant Video Call Integration</span>
          <span>•</span>
          <span>⭐ Candidate Conversations &amp; Messaging</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Candidate Live Chat{" "}
            <span className="gradient-text">— CRM Support Hub</span>
          </h1>
          <p className="cand-subtitle">
            Real-time conversational interface with candidate support and video calls.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <div className="chat-layout-flex" style={{ position: 'relative', zIndex: 2 }}>
        {/* Sidebar: Conversations List */}
        <div className="chat-sidebar-card">
          <div className="sidebar-heading">💬 Candidate Conversations</div>
          {loadingThreads ? (
            <div className="chat-loading-state">Loading threads…</div>
          ) : !threads.length ? (
            <div className="chat-empty-sidebar">No conversations yet.</div>
          ) : (
            <div className="threads-list-wrap">
              {threads.map((c) => (
                <div
                  key={c.id}
                  className={`thread-item${selected?.id === c.id ? " active" : ""}`}
                  onClick={() => openThread(c)}
                >
                  <div className="thread-info">
                    <strong className="thread-name">
                      {c.firstName} {c.lastName}
                    </strong>
                    <span className="thread-code">{c.email}</span>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="unread-badge">{c.unreadCount}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="chat-conversation-card">
          {!selected ? (
            <div className="chat-empty-state">
              <span>👈</span> Select a candidate conversation from the left to start chatting.
            </div>
          ) : (
            <>
              <div className="active-chat-header">
                <div className="client-info-flex">
                  <div className="avatar-circle">
                    {(selected.firstName?.[0] || "C").toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ color: "#0f172a", fontWeight: "900" }}>
                      {selected.firstName} {selected.lastName}
                    </strong>
                    <span className="active-code-tag">
                      {selected.email || "Active Candidate"}
                    </span>
                  </div>
                </div>
                <button className="cv-action-btn primary glow-btn" onClick={startCall}>
                  <span>🎥 Start Video Call ✨</span>
                </button>
              </div>

              <div className="chat-messages-scroll">
                {loadingMessages ? (
                  <div className="chat-loading-state">
                    Loading conversation history…
                  </div>
                ) : !messages.length ? (
                  <div className="chat-empty-state">
                    No messages in this thread yet. Say hello!
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderRole === "staff";
                    const isAI = m.senderRole === "ai";
                    return (
                      <div
                        key={m.id}
                        className={`message-row ${mine ? "staff-row" : "client-row"}`}
                      >
                        <div
                          className={`message-bubble ${mine ? "staff-bubble" : "client-bubble"} ${isAI ? "ai-bubble" : ""}`}
                          style={isAI ? { background: "#f3e8ff", border: "1.5px solid #e9d5ff", color: "#9333ea" } : {}}
                        >
                          <div className="msg-footer-row" style={{ marginBottom: "4px", fontSize: "11px", fontWeight: "800", opacity: 0.8 }}>
                            {isAI
                              ? "🤖 AI Assistant"
                              : m.sender?.name || (mine ? "You" : "Candidate")}
                          </div>
                          <div className="msg-text">{m.message}</div>
                          {m.type === "call_invite" && m.meetingLink && (
                            <button
                              className="cv-action-btn primary"
                              style={{ padding: "6px 12px", fontSize: "12px", marginTop: "8px" }}
                              onClick={() => setActiveMeeting(m)}
                            >
                              🎥 Join Meeting Call
                            </button>
                          )}
                          <div className="msg-footer-row" style={{ marginTop: "6px", fontSize: "10.5px", opacity: 0.7, textAlign: "right" }}>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="chat-reply-form">
                <div className="input-btn-flex">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message or reply..."
                    className="cand-input"
                  />
                  <button
                    className="cv-action-btn primary glow-btn"
                    onClick={send}
                    disabled={sending || !text.trim()}
                  >
                    <span>{sending ? "Sending..." : "Send ✨"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {activeMeeting && (
        <MeetingRoom
          meetingLink={activeMeeting.meetingLink}
          displayName={user?.name || "Recruiter"}
          onClose={() => setActiveMeeting(null)}
        />
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-chat-container {
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
          background: linear-gradient(135deg, #0284c7, #6366f1);
          border-radius: 50%;
          opacity: 0.4;
          animation: floatCandParticle linear infinite;
          box-shadow: 0 0 8px rgba(2, 132, 199, 0.4);
        }

        @keyframes floatCandParticle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0.2; }
        }

        /* Marquee Ribbon */
        .chat-marquee-banner {
          background: linear-gradient(90deg, #0284c7, #6366f1);
          color: #ffffff;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.2);
          margin-bottom: 24px;
        }

        .chat-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .chat-marquee-track span {
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
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-header-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .card-bg-light-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-glow-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #0284c7, #6366f1);
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
          background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cand-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 600;
        }

        .cv-action-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .cv-action-btn.primary {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
        }

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chat-layout-flex {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: 620px;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
        }

        .chat-sidebar-card {
          border-right: 1.5px solid #e2e8f0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .sidebar-heading {
          padding: 18px;
          font-size: 13px;
          font-weight: 900;
          color: #0f172a;
          border-bottom: 1.5px solid #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f1f5f9;
        }

        .threads-list-wrap {
          display: flex;
          flex-direction: column;
        }

        .thread-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .thread-item:hover {
          background: #f1f5f9;
        }

        .thread-item.active {
          background: #e0f2fe;
          border-left: 4px solid #0284c7;
        }

        .thread-name {
          font-size: 14px;
          font-weight: 900;
          color: #0f172a;
          display: block;
          margin-bottom: 2px;
        }

        .acc-muted {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 700;
        }

        .unread-badge {
          background: #fef2f2;
          color: #dc2626;
          border: 1.5px solid #fecaca;
          border-radius: 12px;
          font-size: 11px;
          padding: 2px 8px;
          font-weight: 900;
        }

        .chat-conversation-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #ffffff;
        }

        .active-chat-header {
          padding: 16px 24px;
          border-bottom: 1.5px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .client-info-flex {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .active-code-tag {
          display: block;
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
        }

        .chat-messages-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #ffffff;
        }

        .message-row {
          display: flex;
          width: 100%;
        }

        .staff-row {
          justify-content: flex-end;
        }

        .client-row {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 70%;
          border-radius: 16px;
          padding: 12px 16px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.05);
        }

        .staff-bubble {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }

        .client-bubble {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          border-bottom-left-radius: 4px;
        }

        .msg-text {
          font-size: 14px;
          line-height: 1.4;
          word-break: break-word;
          font-weight: 700;
        }

        .chat-reply-form {
          border-top: 1.5px solid #e2e8f0;
          padding: 14px 16px;
          background: #f8fafc;
        }

        .input-btn-flex {
          display: flex;
          gap: 12px;
        }

        .cand-input {
          flex: 1;
          padding: 12px 16px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          outline: none;
        }

        .cand-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
        }

        .chat-loading-state, .chat-empty-state, .chat-empty-sidebar {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          padding: 20px;
        }

        @media (max-width: 768px) {
          .chat-layout-flex {
            grid-template-columns: 1fr;
            height: auto;
          }
          .chat-sidebar-card {
            max-height: 220px;
          }
        }
      `}</style>
    </div>
  );
}