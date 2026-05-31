import { apiClient } from './apiClient';

export const settingsService = {
  async get() {
    const res = await apiClient.get('/settings/', { requiresAuth: true });
    return res.data;
  },
  async updateTheme(theme: string) {
    const res = await apiClient.put('/settings/theme', { theme }, { requiresAuth: true });
    return res.data;
  },
  async updateNotifications(data: any) {
    const res = await apiClient.put('/settings/notifications', data, { requiresAuth: true });
    return res.data;
  },
  async updateFocus(data: any) {
    const res = await apiClient.put('/settings/focus', data, { requiresAuth: true });
    return res.data;
  },
  async updateEditor(data: any) {
    const res = await apiClient.put('/settings/editor', data, { requiresAuth: true });
    return res.data;
  },
};