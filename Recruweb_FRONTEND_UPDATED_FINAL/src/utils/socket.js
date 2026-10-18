import { io } from "socket.io-client";
import { getToken } from "./api";

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "https://recruweb.com")).replace(/\/+$/, "");

let socket = null;

// Lazily creates a single shared socket connection, authenticated with the
// same JWT used for REST calls. Reused across every chat/call component so
// we don't open a new connection per page.
export const getSocket = () => {
  const token = getToken();
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  } else if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
