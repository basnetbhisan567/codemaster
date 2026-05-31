export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: AIModel;
  tokens?: number;
};

export type AIModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'claude-3-haiku' | 'mistral-small';

export type ChatSession = {
  id: string;
  topic: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};