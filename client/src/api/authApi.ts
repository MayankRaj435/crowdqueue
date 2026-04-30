import fetchClient from "./axiosInstance";

export const authApi = {
  register: (data: { name: string; phone: string; email?: string; password: string }) =>
    fetchClient.post("/auth/register", data),

  login: (data: { phone: string; password: string }) =>
    fetchClient.post("/auth/login", data),

  logout: () => fetchClient.post("/auth/logout"),

  refresh: () => fetchClient.post("/auth/refresh"),

  getMe: () => fetchClient.get("/auth/me"),

  verifyPhone: (code: string) => fetchClient.post("/auth/verify-phone", { code }),
};
