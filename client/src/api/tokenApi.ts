import fetchClient from "./axiosInstance";

export const tokenApi = {
  join: (queueId: string) => fetchClient.post(`/tokens/join/${queueId}`),

  getMyTokens: (status?: "active" | "past") =>
    fetchClient.get("/tokens/my", status ? { status } : undefined),

  getById: (id: string) => fetchClient.get(`/tokens/${id}`),

  cancel: (id: string, reason?: string) =>
    fetchClient.patch(`/tokens/${id}/cancel`, { reason }),

  rate: (id: string, rating: number, feedback?: string) =>
    fetchClient.patch(`/tokens/${id}/rate`, { rating, feedback }),
};
