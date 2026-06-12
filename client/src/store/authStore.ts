import { create } from "zustand";
import { authApi } from "@/api/authApi";
import { setAccessToken } from "@/api/axiosInstance";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { PortalRole } from "@/lib/authRoles";

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  organizationId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null, token?: string) => void;
  clearUser: () => void;
  checkAuth: () => Promise<void>;
  login: (phone: string, password: string, portalRole?: PortalRole) => Promise<void>;
  register: (name: string, phone: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, token) => {
    if (token) {
      setAccessToken(token);
      connectSocket(token);
    }
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  clearUser: () => {
    setAccessToken(null);
    disconnectSocket();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const json = await authApi.refresh();
      const data = json.data as { accessToken: string; user: User };
      setAccessToken(data.accessToken);
      connectSocket(data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (phone, password, portalRole) => {
    const response = await authApi.login({ phone, password, portalRole });
    const data = response.data as { accessToken: string; user: User };
    setAccessToken(data.accessToken);
    connectSocket(data.accessToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  register: async (name, phone, password, email) => {
    const response = await authApi.register({ name, phone, password, email });
    const data = response.data as { accessToken: string; user: User };
    setAccessToken(data.accessToken);
    connectSocket(data.accessToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Proceed with local logout even if API fails
    }
    setAccessToken(null);
    disconnectSocket();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
