import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/api/axiosInstance";
import { getSocketBaseUrl } from "@/lib/api-config";

const SOCKET_URL = getSocketBaseUrl();

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
