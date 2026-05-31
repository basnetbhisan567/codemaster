import { apiClient } from './apiClient';

export const projectService = {
  async getAll(level?: number, category?: string) {
    const params = new URLSearchParams();
    if (level) params.append('level', level.toString());
    if (category) params.append('category', category);
    const query = params.toString();
    const res = await apiClient.get(`/projects/${query ? '?' + query : ''}`);
    return res.data;
  },
  async getBySlug(slug: string) {
    const res = await apiClient.get(`/projects/${slug}`);
    return res.data;
  },
  async submit(slug: string, code: string, demoUrl: string, repoUrl: string) {
    const res = await apiClient.post(`/projects/${slug}/submit`, { code, demo_url: demoUrl, repo_url: repoUrl }, { requiresAuth: true });
    return res.data;
  },
  async getMySubmissions() {
    const res = await apiClient.get('/projects/my/submissions', { requiresAuth: true });
    return res.data;
  },
};