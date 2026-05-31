import { apiClient } from './apiClient';

export const roadmapService = {
  async get() {
    const res = await apiClient.get('/roadmap/', { requiresAuth: true });
    return res.data;
  },
  async generate(language: string, topic: string, duration = 7, intensity = 'basic-advanced') {
    const res = await apiClient.post('/roadmap/generate', { language, topic, duration, intensity }, { requiresAuth: true });
    return res.data;
  },
  async completeDay(dayId: number) {
    const res = await apiClient.post(`/roadmap/complete/${dayId}`, {}, { requiresAuth: true });
    return res.data;
  },
};