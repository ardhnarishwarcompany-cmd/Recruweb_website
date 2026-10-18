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

export default function ClientChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const bottomRef = useRef(null);

  const load = async () => {
    const res = await api.clientPortal.getMessages();
    if (res?.success) setMessages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    const onNew = (msg) => setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    socket.on("chat:new_message", onNew);
    return () => socket.off("chat:new_message", onNew);
  }, []);

  const startCall = async () => {
    const res = await api.clientPortal.startCall();
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
    if (!text.trim()) return;
    setSending(true);
    const res = await api.clientPortal.sendMessage(text.trim());
    if (res?.success) {
      setText("");
      load();
    }
    setSending(false);
  };

  return (
    <div className="light-cchat-container">
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
      <div className="cchat-marquee-banner">
        <div className="cchat-marquee-track">
          <span>✨ Recruweb Corporate Client &amp; Recruiter Live Communications</span>
          <span>•</span>
          <span>💬 Real-time Messaging &amp; Assigned Account Management</span>
          <span>•</span>
          <span>⭐ Secure Video Calls &amp; Instant Collaboration</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="cand-title">
              Chat With Recruiter{" "}
              <span className="gradient-text">— Support Portal</span>
            </h1>
            <p className="cand-subtitle">
              Communicate directly in real-time with your assigned recruiter or account manager.
            </p>
          </div>
          <button className="cv-action-btn primary glow-btn" onClick={startCall} style={{ padding: "10px 20px" }}>
            🎥 Start Video Call ✨
          </button>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Main Glass Chat Box */}
      <div className="cand-card-3d" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "580px" }}>
        <div className="card-bg-light-glow"></div>
        
        <div className="cchat-messages-scroll" style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="cchat-loading-state">
              <span className="cand-loader"></span> Loading messages...
            </div>
          ) : !messages.length ? (
            <div className="cchat-empty-state">
              💬 No messages yet. Say hello to your recruiter below.
            </div>
          ) : (
            messages.map((m) => {
              const isClient = m.senderRole === "client";
              return (
                <div
                  key={m.id}
                  className={`message-row ${isClient ? "client-row" : "recruiter-row"}`}
                >
                  <div
                    className={`message-bubble ${isClient ? "client-bubble" : "recruiter-bubble"}`}
                  >
                    <div className="msg-text">{m.message}</div>
                    {m.type === "call_invite" && m.meetingLink && (
                      <button className="cchat-join-btn" onClick={() => setActiveMeeting(m)}>
                        🎥 Join Call
                      </button>
                    )}
                    <div className="msg-meta">
                      {m.sender?.name || (isClient ? "You" : "Recruiter")} ·{" "}
                      {fmtTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply Input Form */}
        <form onSubmit={send} className="cchat-reply-form" style={{ position: 'relative', zIndex: 2 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message to your recruiter..."
            className="cand-input"
          />
          <button className="cv-action-btn primary glow-btn" disabled={sending || !text.trim()} style={{ padding: "12px 24px" }}>
            {sending ? "Sending..." : "Send Message ✨"}
          </button>
        </form>

        <div className="card-glow-bar"></div>
      </div>

      {activeMeeting && (
        <MeetingRoom meetingLink={activeMeeting.meetingLink} displayName={user?.name || "Client"} onClose={() => setActiveMeeting(null)} />
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-cchat-container {
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
        .cchat-marquee-banner {
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

        .cchat-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .cchat-marquee-track span {
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

        .cand-card-3d {
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: perspective(1000px) rotateX(1.5deg);
        }

        .cand-card-3d:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.4);
        }

        .cchat-messages-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #ffffff;
        }

        .message-row {
          display: flex;
          width: 100%;
        }

        .client-row {
          justify-content: flex-end;
        }

        .recruiter-row {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 70%;
          border-radius: 16px;
          padding: 14px 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .client-bubble {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #ffffff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
        }

        .recruiter-bubble {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          font-weight: 600;
          border-bottom-left-radius: 4px;
        }

        .msg-text {
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }

        .msg-meta {
          font-size: 11px;
          margin-top: 6px;
          opacity: 0.75;
          text-align: right;
          font-weight: 700;
        }

        .cchat-reply-form {
          border-top: 1.5px solid #e2e8f0;
          padding: 16px 20px;
          background: #f8fafc;
          display: flex;
          gap: 12px;
        }

        .cand-input {
          flex: 1;
          padding: 12px 16px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s;
        }

        .cand-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15);
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
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          box-shadow: 0 6px 18px rgba(2, 132, 199, 0.25);
        }

        .cv-action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(2, 132, 199, 0.4);
        }

        .cv-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cchat-join-btn {
          display: block;
          margin: 8px 0;
          background: #10b981;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .cchat-loading-state, .cchat-empty-state {
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

        .cand-loader {
          width: 22px;
          height: 22px;
          border: 3px solid #0284c7;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}