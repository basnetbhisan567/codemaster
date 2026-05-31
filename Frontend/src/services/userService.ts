import { apiClient } from './apiClient';
import { User, UserSettings } from '../types/user';

export const userService = {
  async getProfile(): Promise<User | null> {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User | null> {
    const response = await apiClient.put<User>('/users/profile', data);
    return response.data;
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    await apiClient.put('/users/settings', settings);
  },

  async getStats(): Promise<any> {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },
};