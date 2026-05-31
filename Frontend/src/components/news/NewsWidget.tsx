import { Newspaper, ExternalLink, TrendingUp, Clock } from 'lucide-react';
import { NewsCard } from './NewsCard';

export const NewsWidget = () => {
  const news = [
    { id: '1', title: 'React 19 Beta Released', summary: 'New features including React Compiler and Server Components improvements', source: 'React Blog', url: '#', readTime: '5 min' },
    { id: '2', title: 'TypeScript 5.5 Announced', summary: 'Performance improvements and new syntax features', source: 'Microsoft', url: '#', readTime: '3 min' },
    { id: '3', title: 'AI Tools for Developers', summary: 'Top 10 AI coding assistants to boost your productivity', source: 'TechCrunch', url: '#', readTime: '7 min' },
    { id: '4', title: 'Vite 6.0 Coming Soon', summary: 'Next-gen build tool with major updates', source: 'Vite Team', url: '#', readTime: '4 min' },
  ];

  const trendingTopics = ['#ReactJS', '#TypeScript', '#AI', '#WebDev', '#Coding'];

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Tech News</h2>
        </div>
        <a href="/news" className="text-sm text-primary hover:underline flex items-center gap-1">
          View all <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Trending Topics */}
      <div className="flex flex-wrap gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-orange-400" />
        {trendingTopics.map((topic, i) => (
          <span key={i} className="text-xs px-2 py-1 glass rounded-full text-muted-foreground">
            {topic}
          </span>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-3">
        {news.slice(0, 3).map((item) => (
          <NewsCard key={item.id} {...item} />
        ))}
      </div>

      {/* Latest Update Time */}
      <div className="flex items-center gap-1 mt-4 pt-4 border-t border-white/10">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Updated 2 hours ago</span>
      </div>
    </div>
  );
};