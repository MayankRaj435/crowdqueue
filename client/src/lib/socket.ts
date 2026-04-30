import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost", {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
    });
  }
  return socket;
};

export const connectSocket = (token: string) => {
  const s = getSocket(token);
  s.auth = { token };
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
