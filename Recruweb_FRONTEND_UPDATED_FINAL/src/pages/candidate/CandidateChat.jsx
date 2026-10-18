import { useEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import { getSocket } from "../../utils/socket";
import useAuth from "../../hooks/useAuth";
import MeetingRoom from "../../components/interview/MeetingRoom";
import ScrollIndicator from "../../components/ScrollIndicator";

export default function CandidateChat() {
  const { user } = useAuth();
  const [candidateId, setCandidateId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!candidateId) return undefined;
    const socket = getSocket();
    if (!socket) return undefined;
    socket.emit("join:candidate", candidateId);

    const onNew = (msg) => {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
    };
    socket.on("chat:new_message", onNew);
    return () => socket.off("chat:new_message", onNew);
  }, [candidateId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const load = async () => {
    setLoading(true);
    const [profileRes, msgRes] = await Promise.all([
      api.candidatePortal.getProfile(),
      api.candidatePortal.getMessages(),
    ]);
    if (profileRes?.success) setCandidateId(profileRes.data.id);
    if (msgRes?.success) setMessages(msgRes.data);
    setLoading(false);
  };

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    const res = await api.candidatePortal.sendMessage(text.trim());
    setSending(false);
    if (res?.success) {
      setMessages((prev) =>
        prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data],
      );
      setText("");
    }
  };

  const startCall = async () => {
    const res = await api.candidatePortal.startCall();
    if (res?.success) {
      setMessages((prev) => [...prev, res.data]);
      setActiveMeeting(res.data);
    }
  };

  return (
    <div className="cc-page-light">
      {/* Live Floating Particles Background */}
      <div className="cc-particles-container">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="cc-particle"
            style={{
              left: `${(i * 7.5) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${12 + (i % 6)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Marquee Ribbon */}
      <div className="cc-marquee-banner">
        <div className="cc-marquee-track">
          <span>✨ Recruweb Live Recruiter Chat Suite</span>
          <span>•</span>
          <span>💬 Direct Communication with Hiring Managers</span>
          <span>•</span>
          <span>🎥 Instant Secure Video Call Integration</span>
        </div>
      </div>

      <div className="cc-container">
        <div className="cc-header">
          <h2>💬 Chat With Your Recruiter</h2>
          <div className="cc-actions">
            <button className="cv-action-btn primary glow-btn" onClick={startCall} style={{ padding: '10px 18px', fontSize: '13px' }}>
              🎥 Start Video Call
            </button>
          </div>
        </div>

        <div className="cc-thread">
          {loading ? (
            <p className="cc-muted">Loading conversation…</p>
          ) : messages.length === 0 ? (
            <p className="cc-muted">
              No messages yet — say hello, or start a video call.
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.senderRole === "candidate";
              const isAI = m.senderRole === "ai";
              return (
                <div
                  key={m.id}
                  className={`cc-bubble-row ${mine ? "mine" : ""} ${isAI ? "ai" : ""}`}
                >
                  <div className="cc-bubble">
                    <div className="cc-bubble-sender">
                      {isAI
                        ? "🤖 AI Assistant"
                        : m.sender?.name || (mine ? "You" : "Recruiter")}
                    </div>
                    <div>{m.message}</div>
                    {m.type === "call_invite" && m.meetingLink && (
                      <button
                        className="cc-join-btn"
                        onClick={() => setActiveMeeting(m)}
                      >
                        🎥 Join Call
                      </button>
                    )}
                    <div className="cc-bubble-time">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="cc-input-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
          />
          <button
            className="cv-action-btn primary glow-btn"
            onClick={send}
            disabled={sending || !text.trim()}
            style={{ padding: '10px 22px' }}
          >
            Send
          </button>
        </div>
      </div>

      {activeMeeting && (
        <MeetingRoom
          meetingLink={activeMeeting.meetingLink}
          displayName={user?.name || "Candidate"}
          onClose={() => setActiveMeeting(null)}
        />
      )}

      <ScrollIndicator />

      {/* Embedded Light Theme & 3D CSS */}
      <style>{`
        .cc-page-light {
          position: relative;
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 3vw 80px;
          color: #0f172a;
          font-family: var(--font-body);
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .cc-container {
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 180px);
          position: relative;
          z-index: 2;
        }

        /* Particles Background */
        .cc-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .cc-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          opacity: 0.6;
          animation: floatCcParticle linear infinite;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        @keyframes floatCcParticle {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }

        /* Marquee Ribbon */
        .cc-marquee-banner {
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

        .cc-marquee-track {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .cc-marquee-track span {
          margin: 0 20px;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .cc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          padding: 20px 24px;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          transform: perspective(1000px) rotateX(1deg);
        }

        .cc-header h2 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .cc-actions {
          display: flex;
          gap: 10px;
        }

        .cc-thread {
          flex: 1;
          overflow-y: auto;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
        }

        .cc-muted {
          color: #64748b;
          text-align: center;
          margin-top: 40px;
          font-size: 14px;
          font-weight: 700;
        }

        .cc-bubble-row {
          display: flex;
        }

        .cc-bubble-row.mine {
          justify-content: flex-end;
        }

        .cc-bubble {
          max-width: 72%;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          border-radius: 16px;
          padding: 14px 18px;
          color: #334155;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .cc-bubble-row.mine .cc-bubble {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
        }

        .cc-bubble-row.ai .cc-bubble {
          background: #e0e7ff;
          border: 1.5px solid #c7d2fe;
          color: #3730a3;
        }

        .cc-bubble-sender {
          font-size: 11px;
          font-weight: 800;
          opacity: 0.8;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cc-bubble-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 6px;
          text-align: right;
          font-weight: 600;
        }

        .cc-join-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          background: #10b981;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          transition: opacity 0.2s;
        }

        .cc-join-btn:hover {
          opacity: 0.9;
        }

        .cc-input-row {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border: 1.5px solid #cbd5e1;
          padding: 14px;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
        }

        .cc-input-row input {
          flex: 1;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: #0f172a;
          font-weight: 600;
          outline: none;
          transition: all 0.2s ease;
        }

        .cc-input-row input:focus {
          border-color: #6366f1;
          background: #ffffff;
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
      `}</style>
    </div>
  );
}