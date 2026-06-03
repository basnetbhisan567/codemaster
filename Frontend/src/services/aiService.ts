import { apiClient } from './apiClient';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  provider?: string;
  model?: string;
  temperature?: number;
}

interface ChatResponse {
  response: string;
  provider: string;
  model: string;
}

export const aiService = {
  async chat(data: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.request<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });

    if (response.error) {
      throw new Error(response.error.message || 'AI request failed');
    }

    return response.data!;
  },

  async getProviders() {
    const response = await apiClient.get('/ai/providers');
    return response.data;
  },
};