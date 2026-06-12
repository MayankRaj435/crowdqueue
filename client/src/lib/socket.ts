import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/api/axiosInstance";

function resolveSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api) {
    return api.replace(/\/api\/v1\/?$/, "");
  }
  return "http://localhost:5000";
}

const SOCKET_URL = resolveSocketUrl();

let socket: Socket | null = null;

function applyAuth(token: string | null | undefined) {
  if (!socket) return;
  socket.auth = token ? { token } : {};
}

export const getSocket = (token?: string): Socket => {
  const authToken = token !== undefined ? token : getAccessToken();

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      auth: authToken ? { token: authToken } : {},
    });
  } else {
    applyAuth(authToken);
  }

  return socket;
};

export const connectSocket = (token?: string): Socket => {
  const s = getSocket(token);
  const authToken = token !== undefined ? token : getAccessToken();
  if (authToken) {
    s.auth = { token: authToken };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }
};
