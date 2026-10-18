import { useEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import { getSocket } from "../../utils/socket";
import ScrollIndicator from "../../components/ScrollIndicator";

export default function AdminSupportChat() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadThreads = async () => {
    const res = await api.supportChat.getThreads();
    if (res?.success) setThreads(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadThreads();
    const socket = getSocket();
    if (!socket) return undefined;
    const onNew = (msg) => {
      loadThreads();
      if (selected && Number(msg.threadId) === Number(selected.id)) {
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      }
    };
    socket.on("support:new_message", onNew);
    return () => socket.off("support:new_message", onNew);
  }, [selected?.id]);

  const openThread = async (hr) => {
    setSelected(hr);
    const res = await api.supportChat.getMessages(hr.id);
    if (res?.success) setMessages(res.data || []);
    const socket = getSocket();
    socket?.emit("join:thread", `support:${hr.id}`);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !selected) return;
    const res = await api.supportChat.sendMessage(selected.id, text.trim());
    if (res?.success) {
      setMessages((prev) => prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data]);
      setText("");
      loadThreads();
    }
  };

  return (
    <div className="light-asp-container">
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
      <div className="asp-marquee-banner">
        <div className="asp-marquee-track">
          <span>✨ Recruweb Enterprise HR Partner Support &amp; Helpdesk</span>
          <span>•</span>
          <span>🛟 Real Conversations from HR Partners — No Demo or Seeded Data</span>
          <span>•</span>
          <span>⭐ Real-time Messaging &amp; Support Queue</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="cand-header-3d" style={{ marginBottom: "24px" }}>
        <div className="card-bg-light-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="cand-title">
            HR Partner <span className="gradient-text">Support</span>
          </h1>
          <p className="cand-subtitle">Real conversations from HR Partners. No demo or seeded chat data.</p>
        </div>
        <div className="card-glow-bar"></div>
      </div>

      <div className="asp-layout" style={{ position: 'relative', zIndex: 2 }}>
        <aside className="asp-list">
          <div className="asp-list-title">HR Partner Conversations</div>
          {loading ? <div className="asp-empty">Loading…</div> : !threads.length ? (
            <div className="asp-empty">No support conversations yet.</div>
          ) : threads.map((hr) => (
            <button key={hr.id} onClick={() => openThread(hr)} className={`asp-thread ${selected?.id === hr.id ? "active" : ""}`}>
              <span className="asp-avatar">{(hr.name || "H")[0].toUpperCase()}</span>
              <span><strong>{hr.name || "HR Partner"}</strong><small>{hr.email}</small></span>
              {hr.unreadCount > 0 && <b>{hr.unreadCount}</b>}
            </button>
          ))}
        </aside>
        <section className="asp-chat">
          {!selected ? <div className="asp-empty">Select an HR Partner conversation.</div> : (
            <>
              <header><strong>{selected.name}</strong><span>{selected.email}</span></header>
              <div className="asp-messages">
                {messages.map((m) => {
                  const mine = m.senderRole === "support";
                  return <div key={m.id} className={`asp-row ${mine ? "mine" : ""}`}>
                    <div className="asp-bubble">
                      <strong>{mine ? "Support" : selected.name}</strong>
                      <div>{m.message}</div>
                      <small>{new Date(m.createdAt).toLocaleString()}</small>
                    </div>
                  </div>;
                })}
                <div ref={bottomRef}/>
              </div>
              <form className="asp-input" onSubmit={(e) => {e.preventDefault(); send();}}>
                <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Reply to HR Partner…" className="cand-input" />
                <button className="cv-action-btn primary glow-btn" disabled={!text.trim()}>
                  <span>Send ✨</span>
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .light-asp-container {
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
        .asp-marquee-banner {
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

        .asp-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .asp-marquee-track span {
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

        .asp-layout {
          height: 700px;
          display: flex;
          gap: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
        }

        .asp-list {
          width: 320px;
          display: flex;
          flex-direction: column;
          border-right: 1.5px solid #e2e8f0;
          background: #f8fafc;
          overflow-y: auto;
        }

        .asp-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        .asp-list-title {
          padding: 18px;
          font-weight: 900;
          font-size: 13px;
          color: #0f172a;
          border-bottom: 1.5px solid #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f1f5f9;
        }

        .asp-thread {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          padding: 14px 16px;
          background: transparent;
          color: #0f172a;
          border: 0;
          border-bottom: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .asp-thread:hover {
          background: #f1f5f9;
        }

        .asp-thread.active {
          background: #e0f2fe;
          border-left: 4px solid #0284c7;
        }

        .asp-thread span:nth-child(2) {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .asp-thread strong {
          font-size: 14px;
          font-weight: 900;
          color: #0f172a;
        }

        .asp-thread small {
          color: #64748b;
          font-weight: 700;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .asp-thread b {
          margin-left: auto;
          background: #fef2f2;
          color: #dc2626;
          border: 1.5px solid #fecaca;
          border-radius: 12px;
          font-size: 11px;
          padding: 2px 8px;
          font-weight: 900;
        }

        .asp-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0284c7, #6366f1);
          color: #fff;
          font-weight: 900;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
          flex-shrink: 0;
        }

        .asp-chat > header {
          padding: 18px 24px;
          border-bottom: 1.5px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .asp-chat > header strong {
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
        }

        .asp-chat > header span {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          margin-top: 2px;
        }

        .asp-messages {
          flex: 1;
          overflow: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #ffffff;
        }

        .asp-row {
          display: flex;
        }

        .asp-row.mine {
          justify-content: flex-end;
        }

        .asp-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.05);
        }

        .asp-row.mine .asp-bubble {
          background: linear-gradient(135deg, #0284c7, #6366f1);
          border-color: transparent;
          color: #fff;
        }

        .asp-bubble strong {
          font-size: 11px;
          font-weight: 800;
          display: block;
          margin-bottom: 4px;
          opacity: 0.9;
        }

        .asp-bubble div {
          font-size: 14px;
          line-height: 1.4;
          word-break: break-word;
          font-weight: 700;
        }

        .asp-bubble small {
          display: block;
          margin-top: 6px;
          opacity: 0.8;
          font-size: 10.5px;
          font-weight: 700;
          text-align: right;
        }

        .asp-input {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          border-top: 1.5px solid #e2e8f0;
          background: #f8fafc;
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

        .asp-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-weight: 700;
          padding: 20px;
          text-align: center;
        }

        @media(max-width: 800px) {
          .asp-layout {
            height: auto;
            flex-direction: column;
          }
          .asp-list {
            width: 100%;
            min-height: 220px;
          }
          .asp-chat {
            height: 550px;
          }
        }
      `}</style>
    </div>
  );
}