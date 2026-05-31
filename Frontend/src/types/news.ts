export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  author: string;
  url: string;
  imageUrl?: string;
  category: NewsCategory;
  tags: string[];
  publishedAt: string;
  readTime: number;
};

export type NewsCategory = 'AI' | 'Web' | 'Mobile' | 'DevOps' | 'Programming' | 'Tech' | 'Tools' | 'Data Science' | 'cloud' | 'Security' | 'other';

export type DailyUpdate = {
  date: string;
  articles: NewsArticle[];
  aiTools: AITool[];
  trendingTopics: string[];
};

export type AITool = {
  name: string;
  description: string;
  url: string;
  category: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  rating: number;
};