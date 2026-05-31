import { apiClient } from './apiClient';

export const contentService = {
  async getBlogs(search?: string, category?: string, tag?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);
    const query = params.toString();
    const res = await apiClient.get(`/content/blogs${query ? '?' + query : ''}`);
    return res.data;
  },
  async getTools(search?: string, category?: string, pricing?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (pricing) params.append('pricing', pricing);
    const query = params.toString();
    const res = await apiClient.get(`/content/tools${query ? '?' + query : ''}`);
    return res.data;
  },
  async getNews(search?: string, category?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const query = params.toString();
    const res = await apiClient.get(`/content/news${query ? '?' + query : ''}`);
    return res.data;
  },
};