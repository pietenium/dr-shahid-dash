import { io } from "socket.io-client";
import { useAuthStore } from "@store/auth.store";

/**
 * Socket.IO singleton connection manager
 * Handles connection, reconnection, authentication, and room management
 *
 * Features:
 * - JWT authentication on connect
 * - Auto-reconnect with exponential backoff
 * - Room join/leave management
 * - Token refresh handling
 */

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Get or create the Socket.IO connection
 * If socket exists and is connected, return it
 * Otherwise create a new connection with the current accessToken
 *
 * @returns {Object|null} Socket.IO instance or null if no token
 */
export function getSocket() {
  const { accessToken } = useAuthStore.getState();

  // If no token, can't connect
  if (!accessToken) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  // If socket exists and is connected, return it
  if (socket?.connected) {
    return socket;
  }

  // If socket exists but disconnected, reconnect
  if (socket && !socket.connected) {
    socket.auth = { token: accessToken };
    socket.connect();
    return socket;
  }

  // Create new connection
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  socket = io(baseUrl, {
    auth: { token: accessToken },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
    reconnectAttempts = 0;
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("🔌 Socket connection error:", error.message);
    reconnectAttempts++;

    // If authentication failed, try refreshing token
    if (error.message === "Authentication failed" && reconnectAttempts < 2) {
      const { accessToken: newToken } = useAuthStore.getState();
      if (newToken) {
        socket.auth = { token: newToken };
      }
    }
  });

  return socket;
}

/**
 * Disconnect and clean up the socket connection
 * Called on logout
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
    console.log("🔌 Socket disconnected and cleaned up");
  }
}

/**
 * Join a specific room (appointments or contacts)
 * @param {string} room - Room name ('appointments' or 'contacts')
 */
export function joinRoom(room) {
  const s = getSocket();
  if (s?.connected) {
    s.emit(`join:${room}`);
    console.log(`📢 Joined room: ${room}`);
  }
}

/**
 * Leave a specific room
 * @param {string} room - Room name ('appointments' or 'contacts')
 */
export function leaveRoom(room) {
  if (socket?.connected) {
    socket.emit(`leave:${room}`);
    console.log(`📢 Left room: ${room}`);
  }
}
