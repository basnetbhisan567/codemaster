import { apiClient } from './apiClient';
import { Notification } from '../types/notification';

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data || [];
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async updatePreferences(preferences: any): Promise<void> {
    await apiClient.put('/notifications/preferences', preferences);
  },
};