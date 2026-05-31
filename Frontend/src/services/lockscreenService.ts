import { apiClient } from './apiClient';

export const lockscreenService = {
  async startFocus(targetMinutes: number) {
    const res = await apiClient.post('/lockscreen/focus/start', { target_minutes: targetMinutes }, { requiresAuth: true });
    return res.data;
  },
  async endFocus(actualMinutes: number) {
    const res = await apiClient.post('/lockscreen/focus/end', { actual_minutes: actualMinutes }, { requiresAuth: true });
    return res.data;
  },
  async getActiveFocus() {
    const res = await apiClient.get('/lockscreen/focus/active', { requiresAuth: true });
    return res.data;
  },
  async getFocusStats() {
    const res = await apiClient.get('/lockscreen/focus/stats', { requiresAuth: true });
    return res.data;
  },
  async getLockdownStatus() {
    const res = await apiClient.get('/lockscreen/lockdown/status', { requiresAuth: true });
    return res.data;
  },
  async attemptUnlock(answer: string) {
    const res = await apiClient.post('/lockscreen/lockdown/unlock', { answer }, { requiresAuth: true });
    return res.data;
  },
};