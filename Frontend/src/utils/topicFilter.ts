import { ALLOWED_TOPICS, BLOCKED_TOPICS } from '../config/topics';

export const isTopicAllowed = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  
  if (BLOCKED_TOPICS.some(topic => lowerMessage.includes(topic.toLowerCase()))) {
    return false;
  }
  
  return ALLOWED_TOPICS.some(topic => lowerMessage.includes(topic.toLowerCase()));
};

export const extractTopics = (message: string): string[] => {
  const lowerMessage = message.toLowerCase();
  return ALLOWED_TOPICS.filter(topic => lowerMessage.includes(topic.toLowerCase()));
};

export const filterNonCSTopics = (messages: string[]): string[] => {
  return messages.filter(isTopicAllowed);
};

export const getTopicCategory = (topic: string): string => {
  const categories: Record<string, string> = {
    'variables': 'Fundamentals',
    'functions': 'Fundamentals',
    'arrays': 'Data Structures',
    'linked lists': 'Data Structures',
    'react': 'Frontend',
    'node': 'Backend',
    'sql': 'Database',
  };
  
  return categories[topic.toLowerCase()] || 'General';
};