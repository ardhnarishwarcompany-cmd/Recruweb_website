import { Server } from "socket.io";
import { verifyAccessToken } from "./utils/tokens.js";
import { User } from "./models/index.js";

let io = null;

// Rooms:
//   "staff"                — every logged-in staff member (recruiter/admin/etc), for the unified inbox badge
//   "client:<clientId>"    — a specific client account's chat + call channel
//   "candidate:<candId>"   — a specific candidate account's chat + call channel
export const initSocket = (httpServer) => {
  const socketCorsOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.FRONTEND_URLS || "").split(","),
    ...(process.env.CORS_ORIGINS || "").split(","),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ]
    .map((value) => String(value || "").trim().replace(/\/$/, ""))
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const normalized = String(origin).replace(/\/$/, "");
        return callback(null, socketCorsOrigins.includes(normalized));
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("No auth token provided"));
      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.id, { attributes: ["id", "name", "role"] });
      if (!user) return next(new Error("User not found"));
      socket.user = { id: user.id, name: user.name, role: user.role };
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const STAFF_ROLES = ["superadmin", "admin", "recruitment_manager", "hr_manager", "recruiter", "hr", "sales", "finance"];
    if (STAFF_ROLES.includes(socket.user.role)) {
      socket.join("staff");
    }
    if (["superadmin", "admin"].includes(socket.user.role)) {
      socket.join("support:staff");
    }

    // Every authenticated user gets a private room. Chat controllers use it
    // for targeted real-time updates without exposing another user's threads.
    socket.join(`user:${socket.user.id}`);

    // Client/Candidate frontends call this right after connecting, passing
    // their own portal record id, so they only receive their own messages.
    socket.on("join:client", (clientId) => socket.join(`client:${clientId}`));
    socket.on("join:candidate", (candidateId) => socket.join(`candidate:${candidateId}`));

    // Staff opening a specific thread in the admin inbox joins it too, so
    // multiple staff viewing the same thread all get live updates.
    socket.on("join:thread", (room) => socket.join(room));
    socket.on("leave:thread", (room) => socket.leave(room));

    // Lightweight "X is typing…" indicator, relayed to the other party only.
    socket.on("typing", ({ room, isTyping }) => {
      socket.to(room).emit("typing", { room, isTyping, from: socket.user });
    });
  });

  return io;
};

export const getIO = () => io;

// Emits a real-time event to everyone in a room (no-ops safely if the
// socket server hasn't been initialized, e.g. in a test/CLI script context).
export const emitToRoom = (room, event, payload) => {
  if (!io) return;
  io.to(room).emit(event, payload);
};
