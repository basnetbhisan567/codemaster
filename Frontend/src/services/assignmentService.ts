import { apiClient } from './apiClient';

export const assignmentService = {
  async getAll(status?: string) {
    const params = status ? `?status=${status}` : '';
    const res = await apiClient.get(`/assignments/${params}`, { requiresAuth: true });
    return res.data;
  },
  async create(data: { title: string; description?: string; priority?: string; tags?: string[]; xp_reward?: number }) {
    const res = await apiClient.post('/assignments/', data, { requiresAuth: true });
    return res.data;
  },
  async update(id: number, data: any) {
    const res = await apiClient.put(`/assignments/${id}`, data, { requiresAuth: true });
    return res.data;
  },
  async delete(id: number) {
    const res = await apiClient.delete(`/assignments/${id}`, { requiresAuth: true });
    return res.data;
  },
};