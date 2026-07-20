import fetchClient, { setAccessToken } from "./axiosInstance";
import type { PortalRole } from "@/lib/authRoles";
import { getApiBaseUrl } from "@/lib/api-config";

const API_URL = getApiBaseUrl();

export const authApi = {
  register: (data: { name: string; phone: string; email?: string; password: string }) =>
    fetchClient.post("/auth/register", data),

  login: (data: { phone: string; password: string; portalRole?: PortalRole }) =>
    fetchClient.post("/auth/login", data),

  logout: () => fetchClient.post("/auth/logout"),

  // Uses raw fetch to bypass the fetchClient 401 interceptor — prevents infinite refresh loop
  refresh: async () => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Refresh failed");
    const json = await res.json();
    setAccessToken(json.data?.accessToken ?? null);
    return json;
  },

  getMe: () => fetchClient.get("/auth/me"),

  verifyPhone: (code: string) => fetchClient.post("/auth/verify-phone", { code }),
};

