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

export default function AdminClientChat() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const bottomRef = useRef(null);

  const loadThreads = async () => {
    const res = await api.crmClientChat.getThreads();
    if (res?.success) setThreads(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const openThread = async (client) => {
    setActiveClient(client);
    const res = await api.crmClientChat.getThreadMessages(client.id);
    if (res?.success) setMessages(res.data);
    loadThreads();
    const socket = getSocket();
    socket?.emit("join:thread", `client:${client.id}`);
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    const onNew = (msg) => {
      if (msg.thread !== "client") return;
      if (activeClient && msg.threadId === activeClient.id) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      loadThreads();
    };
    socket.on("chat:new_message", onNew);
    return () => socket.off("chat:new_message", onNew);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClient]);

  const startCall = async () => {
    if (!activeClient) return;
    const res = await api.crmClientChat.startCall(activeClient.id);
    if (res?.success) {
      setMessages((prev) => [...prev, res.data]);
      setActiveMeeting(res.data);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeClient) return;

    if (editingId) {
      if (api.crmClientChat.updateMessage) {
        await api.crmClientChat.updateMessage(editingId, {
          message: text.trim(),
        });
      }
      setEditingId(null);
    } else {
      await api.crmClientChat.reply(activeClient.id, text.trim());
    }

    setText("");
    openThread(activeClient);
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setText(m.message);
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    if (api.crmClientChat.deleteMessage) {
      const res = await api.crmClientChat.deleteMessage(id);
      if (res?.success) {
        openThread(activeClient);
        return;
      }
    }

    setMessages((prev) => prev.filter((m) => m.id !== id));
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
          <span>✨ Recruweb Enterprise Client Live Chat &amp; CRM Support Hub</span>
          <span>•</span>
          <span>💬 Real-time Conversational Interface with Seen Status, Edit &amp; Delete Support</span>
          <span>•</span>
          <span>⭐ Instant Video Call Integration &amp; Messaging</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            Client Live Chat{" "}
            <span className="gradient-text">— CRM Support Hub</span>
          </h1>
          <p className="cand-subtitle">
            Real-time conversational interface with seen status, edit, and
            delete support.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Main Chat Layout Area */}
      <div className="chat-layout-flex" style={{ position: 'relative', zIndex: 2 }}>
        {/* Sidebar Client List */}
        <div className="chat-sidebar-card">
          <div className="sidebar-heading">Conversations</div>
          {loading ? (
            <div className="chat-loading-state">Loading clients...</div>
          ) : !threads.length ? (
            <div className="chat-empty-sidebar">No active chat threads.</div>
          ) : (
            <div className="threads-list-wrap">
              {threads.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openThread(c)}
                  className={`thread-item${activeClient?.id === c.id ? " active" : ""}`}
                >
                  <div className="thread-name">{c.name}</div>
                  <div className="thread-code">{c.clientCode}</div>
                  {c.unreadCount > 0 && (
                    <span className="unread-badge">{c.unreadCount} new</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Conversation Box */}
        <div className="chat-conversation-card">
          {!activeClient ? (
            <div className="chat-empty-state">
              💬 Select a client from the left sidebar to start a conversation.
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="active-chat-header">
                <div className="client-info-flex">
                  <span className="status-dot"></span>
                  <div>
                    <strong style={{ color: "#0f172a", fontWeight: "900" }}>{activeClient.name}</strong>
                    <span className="active-code-tag">
                      ({activeClient.clientCode})
                    </span>
                  </div>
                </div>
                <button className="cv-action-btn primary glow-btn" onClick={startCall}>
                  <span>🎥 Start Video Call ✨</span>
                </button>
              </div>

              {/* Messages Scroll Area */}
              <div className="chat-messages-scroll">
                {messages.map((m) => {
                  const isStaff = m.senderRole === "staff";
                  return (
                    <div
                      key={m.id}
                      className={`message-row ${isStaff ? "staff-row" : "client-row"}`}
                    >
                      <div
                        className={`message-bubble ${isStaff ? "staff-bubble" : "client-bubble"}`}
                      >
                        <div className="msg-text">{m.message}</div>
                        {m.type === "call_invite" && m.meetingLink && (
                          <button className="cv-action-btn primary" style={{ padding: "6px 12px", fontSize: "12px", marginTop: "8px" }} onClick={() => setActiveMeeting(m)}>
                            🎥 Join Call
                          </button>
                        )}

                        <div className="msg-footer-row">
                          <span className="msg-meta">
                            {m.sender?.name ||
                              (isStaff ? "You" : activeClient.name)}{" "}
                            · {fmtTime(m.createdAt)}
                          </span>
                          {isStaff && (
                            <span
                              className="seen-status-tag"
                              title="Message Seen"
                            >
                              {m.isRead || m.readAt ? "✓✓ Read" : "✓ Sent"}
                            </span>
                          )}
                        </div>

                        {/* Edit / Delete Actions for Staff */}
                        {isStaff && (
                          <div className="msg-action-hover">
                            <button
                              onClick={() => startEdit(m)}
                              className="action-ic-btn"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteMessage(m.id)}
                              className="action-ic-btn"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply Input Form */}
              <form onSubmit={send} className="chat-reply-form">
                {editingId && (
                  <div className="editing-banner">
                    <span>Editing message...</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setText("");
                      }}
                      className="cancel-edit-btn"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="input-btn-flex">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      editingId ? "Edit your message..." : "Type a reply..."
                    }
                    className="cand-input"
                  />
                  <button className="cv-action-btn primary glow-btn" disabled={!text.trim()}>
                    <span>{editingId ? "Update ✨" : "Send ✨"}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

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

        .cand-header-3d:hover .card-glow-bar,
        .cand-card-3d:hover .card-glow-bar {
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

        .cv-action-btn.secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1.5px solid #cbd5e1;
        }

        .cv-action-btn.secondary:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .chat-layout-flex {
          display: flex;
          gap: 20px;
          height: 620px;
        }

        /* Sidebar */
        .chat-sidebar-card {
          width: 300px;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
        }

        .sidebar-heading {
          padding: 18px;
          font-size: 13px;
          font-weight: 900;
          color: #0f172a;
          border-bottom: 1.5px solid #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f8fafc;
        }

        .threads-list-wrap {
          display: flex;
          flex-direction: column;
        }

        .thread-item {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .thread-item:hover {
          background: #f8fafc;
        }

        .thread-item.active {
          background: #e0f2fe;
          border-left: 4px solid #0284c7;
        }

        .thread-name {
          font-weight: 900;
          color: #0f172a;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .thread-code {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
        }

        .unread-badge {
          display: inline-block;
          background: #fef2f2;
          color: #dc2626;
          border: 1.5px solid #fecaca;
          font-size: 11px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 10px;
          margin-top: 6px;
        }

        /* Conversation Window */
        .chat-conversation-card {
          flex: 1;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
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
          gap: 10px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          background: #059669;
          border-radius: 50%;
          box-shadow: 0 0 10px #059669;
        }

        .active-code-tag {
          font-size: 12px;
          color: #64748b;
          font-weight: 800;
          margin-left: 6px;
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
          position: relative;
          max-width: 70%;
          border-radius: 16px;
          padding: 12px 16px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.05);
        }

        .message-bubble:hover .msg-action-hover {
          opacity: 1;
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

        .msg-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 6px;
          font-size: 11px;
          font-weight: 700;
          opacity: 0.9;
        }

        .seen-status-tag {
          font-weight: 900;
          color: #bae6fd;
        }

        .msg-action-hover {
          position: absolute;
          top: -10px;
          right: 10px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          display: flex;
          gap: 4px;
          padding: 2px 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
        }

        .action-ic-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
        }

        /* Reply Form */
        .chat-reply-form {
          border-top: 1.5px solid #e2e8f0;
          padding: 14px 16px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .editing-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #0284c7;
          font-weight: 800;
          background: #e0f2fe;
          padding: 4px 10px;
          border-radius: 8px;
          border: 1.5px solid #bae6fd;
        }

        .cancel-edit-btn {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-weight: 900;
          font-size: 11px;
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
            flex-direction: column;
            height: auto;
          }
          .chat-sidebar-card {
            width: 100%;
            height: 200px;
          }
          .chat-conversation-card {
            height: 450px;
          }
        }
      `}</style>

      {activeMeeting && (
        <MeetingRoom meetingLink={activeMeeting.meetingLink} displayName={user?.name || "Staff"} onClose={() => setActiveMeeting(null)} />
      )}
    </div>
  );
}