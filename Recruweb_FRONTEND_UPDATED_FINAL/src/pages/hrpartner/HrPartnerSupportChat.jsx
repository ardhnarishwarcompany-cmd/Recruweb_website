import { useEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import { getSocket } from "../../utils/socket";
import useAuth from "../../hooks/useAuth";
import ScrollIndicator from "../../components/ScrollIndicator";

export default function HrPartnerSupportChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const res = await api.supportChat.getMyMessages();
    if (res?.success) setMessages(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    if (!socket) return undefined;

    const onNew = (msg) => {
      if (Number(msg.threadId) !== Number(user?.id)) return;
      setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
    };
    socket.on("support:new_message", onNew);
    return () => socket.off("support:new_message", onNew);
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await api.supportChat.sendMyMessage(text.trim());
    if (res?.success) {
      setMessages((prev) => prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data]);
      setText("");
    }
    setSending(false);
  };

  return (
    <div className="light-sp-support-container">
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
      <div className="support-chat-marquee-banner">
        <div className="support-chat-marquee-track">
          <span>✨ Recruweb Enterprise Live Support Chat Suite</span>
          <span>•</span>
          <span>💬 Talk Directly with the Admin &amp; Support Team</span>
          <span>•</span>
          <span>⭐ 24/7 Priority Assistance &amp; Real-time Query Resolution</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d">
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            💬 Chat with <span className="gradient-text">Support</span>
          </h1>
          <p className="cand-subtitle">
            Talk directly with the Recruweb Admin &amp; Support team.
          </p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      {/* Chat Card */}
      <div className="cand-card-3d" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "680px" }}>
        <div className="card-bg-light-glow"></div>
        
        {/* Messages Thread Area */}
        <div className="sp-messages" style={{ position: 'relative', zIndex: 2 }}>
          {loading ? (
            <div className="sp-empty">Loading conversation…</div>
          ) : !messages.length ? (
            <div className="sp-empty">
              <strong>No support messages yet.</strong>
              <span>Send a message to start a real support conversation.</span>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.senderRole === "hr_partner";
              return (
                <div key={m.id} className={`sp-row ${mine ? "mine" : ""}`}>
                  <div className="sp-bubble">
                    <strong>{mine ? "You" : m.supportSender?.name || "Recruweb Support"}</strong>
                    <div>{m.message}</div>
                    <small>{new Date(m.createdAt).toLocaleString()}</small>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Row */}
        <div className="sp-input" style={{ position: 'relative', zIndex: 2 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your message to Support…"
            className="cand-input"
          />
          <button onClick={send} disabled={sending || !text.trim()} className="cv-action-btn primary glow-btn" style={{ padding: "0 24px" }}>
            {sending ? "Sending…" : "Send ✨"}
          </button>
        </div>

        <div className="card-glow-bar"></div>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-sp-support-container {
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
        .support-chat-marquee-banner {
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

        .support-chat-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .support-chat-marquee-track span {
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
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .sp-messages {
          flex: 1;
          overflow: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #ffffff;
        }

        .sp-row {
          display: flex;
          justify-content: flex-start;
        }

        .sp-row.mine {
          justify-content: flex-end;
        }

        .sp-bubble {
          max-width: 70%;
          padding: 14px 18px;
          border-radius: 16px;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.5;
        }

        .sp-row.mine .sp-bubble {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
        }

        .sp-bubble strong {
          display: block;
          font-size: 11.5px;
          margin-bottom: 4px;
          font-weight: 800;
          text-transform: uppercase;
          opacity: 0.85;
        }

        .sp-bubble small {
          display: block;
          margin-top: 6px;
          opacity: 0.65;
          font-size: 10.5px;
          font-weight: 700;
          text-align: right;
        }

        .sp-input {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1.5px solid #e2e8f0;
          background: #f8fafc;
        }

        .cand-input {
          flex: 1;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #0f172a;
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

        .sp-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: #64748b;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
        }

        .sp-empty strong {
          color: #0f172a;
          font-size: 16px;
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}