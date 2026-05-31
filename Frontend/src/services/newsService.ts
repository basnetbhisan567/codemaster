import { apiClient } from './apiClient';
import { NewsArticle, DailyUpdate, AITool } from '../types/news';

export const newsService = {
  async getLatest(): Promise<NewsArticle[]> {
    const response = await apiClient.get<NewsArticle[]>('/news/latest');
    return response.data || [];
  },

  async getByCategory(category: string): Promise<NewsArticle[]> {
    const response = await apiClient.get<NewsArticle[]>(`/news/category/${category}`);
    return response.data || [];
  },

  async getDailyUpdate(): Promise<DailyUpdate | null> {
    const response = await apiClient.get<DailyUpdate>('/news/daily');
    return response.data;
  },

  async getAITools(): Promise<AITool[]> {
    const response = await apiClient.get<AITool[]>('/news/ai-tools');
    return response.data || [];
  },
};