import { apiClient } from './apiClient';
import { UserProgress, DailyStats } from '../types/progress';

export const progressService = {
  async getUserProgress(): Promise<UserProgress | null> {
    const response = await apiClient.get<UserProgress>('/progress');
    return response.data;
  },

  async updateTopicProgress(topicId: string, progress: number): Promise<void> {
    await apiClient.post('/progress/topic', { topicId, progress });
  },

  async updateStreak(): Promise<{ streak: number }> {
    const response = await apiClient.post<{ streak: number }>('/progress/streak', {});
    return response.data || { streak: 0 };
  },

  async getDailyStats(): Promise<DailyStats | null> {
    const response = await apiClient.get<DailyStats>('/progress/daily');
    return response.data;
  },
};