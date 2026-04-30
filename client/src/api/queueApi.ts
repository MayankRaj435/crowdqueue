import fetchClient from "./axiosInstance";

export const queueApi = {
  getNearby: (lng: number, lat: number, radius?: number, type?: string) =>
    fetchClient.get("/orgs/nearby", { lng, lat, radius, type }),

  getById: (id: string) => fetchClient.get(`/queues/${id}`),

  create: (data: { name: string; description?: string; maxCapacity?: number; notifyThreshold?: number }) =>
    fetchClient.post("/queues", data),

  update: (id: string, data: Record<string, unknown>) =>
    fetchClient.put(`/queues/${id}`, data),

  updateStatus: (id: string, status: string) =>
    fetchClient.patch(`/queues/${id}/status`, { status }),

  delete: (id: string) => fetchClient.delete(`/queues/${id}`),

  getOrgById: (id: string) => fetchClient.get(`/orgs/${id}`),
};
