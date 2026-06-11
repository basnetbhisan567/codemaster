import { apiClient } from './apiClient';

interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: string;
  level: number;
  avatar: string;
  bio?: string;
  phone?: string;
  created_at?: string;
}

interface UserSettings {
  theme?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  daily_goal_minutes?: number;
  focus_start_time?: string;
  focus_end_time?: string;
  editor_font_size?: number;
  editor_tab_size?: number;
  preferred_language?: string;
}

export const userService = {
  async getProfile(): Promise<User | null> {
    const response = await apiClient.get('/profile/', { requiresAuth: true });
    return response.data as User | null;
  },

  async updateProfile(data: Partial<User>): Promise<User | null> {
    const response = await apiClient.put('/profile/', data, { requiresAuth: true });
    return response.data as User | null;
  },

  async getSettings(): Promise<UserSettings | null> {
    const response = await apiClient.get('/settings/', { requiresAuth: true });
    return response.data as UserSettings | null;
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
    const response = await apiClient.put('/settings/', settings, { requiresAuth: true });
    return response.data as UserSettings | null;
  },

  async getStats(): Promise<any> {
    const response = await apiClient.get('/profile/stats', { requiresAuth: true });
    return response.data;
  },
};