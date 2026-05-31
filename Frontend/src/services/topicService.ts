import { apiClient } from './apiClient';

export const topicService = {
  async getAll(language?: string, category?: string, difficulty?: string) {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);

    const query = params.toString();
    const url = query ? `/topics?${query}` : '/topics';

    const res = await apiClient.get<any>(url);
    return res.data;
  },

  async getBySlug(slug: string) {
    const res = await apiClient.get<any>(`/topics/${slug}`);
    return res.data;
  },

  async getLanguages() {
    const res = await apiClient.get<any>('/topics/languages');
    return res.data;
  },

  async getCategories() {
    const res = await apiClient.get<any>('/topics/categories');
    return res.data;
  },

  async getProgress() {
    const res = await apiClient.get<any>('/learning/progress', { requiresAuth: true });
    return res.data;
  },
};