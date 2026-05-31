import { apiClient } from './apiClient';

export const problemService = {
  async getAll(difficulty?: string, category?: string, language?: string) {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (category) params.append('category', category);
    if (language) params.append('language', language);
    const query = params.toString();
    const res = await apiClient.get(`/problems/${query ? '?' + query : ''}`);
    return res.data;
  },
  async getBySlug(slug: string) {
    const res = await apiClient.get(`/problems/${slug}`);
    return res.data;
  },
  async getHint(slug: string, hintIndex: number) {
    const res = await apiClient.get(`/problems/${slug}/hints?hint_index=${hintIndex}`);
    return res.data;
  },
  async submit(slug: string, code: string, language: string) {
    const res = await apiClient.post(`/problems/${slug}/submit`, { code, language }, { requiresAuth: true });
    return res.data;
  },
  async getSubmissions(slug: string) {
    const res = await apiClient.get(`/problems/${slug}/submissions`, { requiresAuth: true });
    return res.data;
  },
};