import { apiClient } from './apiClient';

export const communityService = {
  async getForums(category?: string, page = 1) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('page', page.toString());
    const res = await apiClient.get(`/community/forums?${params}`);
    return res.data;
  },
  async createTopic(title: string, content: string, category = 'general', tags: string[] = []) {
    const res = await apiClient.post('/community/forums', { title, content, category, tags }, { requiresAuth: true });
    return res.data;
  },
  async getTopic(topicId: number) {
    const res = await apiClient.get(`/community/forums/${topicId}`);
    return res.data;
  },
  async replyToTopic(topicId: number, content: string) {
    const res = await apiClient.post(`/community/forums/${topicId}/replies`, { content }, { requiresAuth: true });
    return res.data;
  },
  async getChat(room = 'global') {
    const res = await apiClient.get(`/community/chat/${room}`);
    return res.data;
  },
  async sendMessage(content: string, room = 'global') {
    const res = await apiClient.post('/community/chat/send', { content, room }, { requiresAuth: true });
    return res.data;
  },
  async getGroups() {
    const res = await apiClient.get('/community/groups');
    return res.data;
  },
  async createGroup(name: string, description: string, topic = 'general') {
    const res = await apiClient.post('/community/groups', { name, description, topic }, { requiresAuth: true });
    return res.data;
  },
  async joinGroup(groupId: number) {
    const res = await apiClient.post(`/community/groups/${groupId}/join`, {}, { requiresAuth: true });
    return res.data;
  },
};