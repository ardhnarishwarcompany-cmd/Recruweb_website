import { useEffect, useState } from "react";
import { getSocket } from "../utils/socket";
import { api } from "../utils/api";
import useAuth from "../hooks/useAuth";
import MeetingRoom from "./interview/MeetingRoom";

// Mounted once near the app root. Connects the shared socket, joins the
// right room for the logged-in user's role, and shows a real ringing popup
// whenever the backend emits a genuine call:incoming event (from Phase 4's
// chat "Start Call" buttons) — not a demo/simulated notification.
export default function IncomingCallListener() {
  const { user, isAuthenticated } = useAuth();
  const [incoming, setIncoming] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return undefined;
    let cancelled = false;

    const setup = async () => {
      const socket = getSocket();
      if (!socket) return;

      try {
        if (user.role === "candidate") {
          const res = await api.candidatePortal.getProfile();
          if (res?.success && !cancelled) socket.emit("join:candidate", res.data.id);
        } else if (user.role === "client") {
          const res = await api.clientPortal.getProfile();
          if (res?.success && !cancelled) socket.emit("join:client", res.data.id);
        }
        // Staff roles are auto-joined to the "staff" room server-side on connect.
      } catch {
        // If the profile fetch fails, calling still works for staff (staff
        // room join is automatic); candidate/client just won't get pushed
        // incoming-call rings until their next successful connection.
      }

      const onIncoming = (payload) => setIncoming(payload);
      socket.on("call:incoming", onIncoming);
      socket.__incomingCallHandler = onIncoming;
    };
    setup();

    return () => {
      cancelled = true;
      const socket = getSocket();
      if (socket && socket.__incomingCallHandler) {
        socket.off("call:incoming", socket.__incomingCallHandler);
      }
    };
  }, [isAuthenticated, user]);

  if (activeCall) {
    return (
      <MeetingRoom
        meetingLink={activeCall.meetingLink}
        displayName={user?.name || "Guest"}
        onClose={() => setActiveCall(null)}
      />
    );
  }

  if (!incoming) return null;

  return (
    <div className="icall-overlay">
      <div className="icall-card">
        <div className="icall-avatar">📞</div>
        <h3>Incoming Video Call</h3>
        <p>{incoming.from || "Someone"} is calling you now…</p>
        <div className="icall-actions">
          <button className="icall-decline" onClick={() => setIncoming(null)}>Decline</button>
          <button
            className="icall-accept"
            onClick={() => {
              setActiveCall(incoming);
              setIncoming(null);
            }}
          >
            Accept
          </button>
        </div>
      </div>
      <style>{`
        .icall-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .icall-card { background: #fff; border-radius: 18px; padding: 32px 36px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.35); animation: icall-pop 0.25s ease; }
        @keyframes icall-pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .icall-avatar { font-size: 2.6rem; animation: icall-ring 1s infinite; }
        @keyframes icall-ring { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } }
        .icall-card h3 { margin: 10px 0 4px; }
        .icall-card p { color: #666; margin-bottom: 20px; }
        .icall-actions { display: flex; gap: 14px; justify-content: center; }
        .icall-decline { background: #dc2626; color: #fff; border: none; border-radius: 50px; padding: 12px 28px; font-weight: 700; cursor: pointer; }
        .icall-accept { background: #16a34a; color: #fff; border: none; border-radius: 50px; padding: 12px 28px; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
}
