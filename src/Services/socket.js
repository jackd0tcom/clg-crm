import { io } from "socket.io-client";

/**
 * Same origin as the page (ViteExpress on :5050 in dev, built app in prod).
 * Do not pass a hard-coded localhost URL unless the app is actually served from another origin.
 */
export const socket = io({
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
  transports: ["websocket", "polling"],
});

export function connectSocket() {
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  socket.disconnect();
}