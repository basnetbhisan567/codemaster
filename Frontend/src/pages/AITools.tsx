import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Search, Loader2, AlertCircle, ExternalLink,
  Star, Clock, Globe, Tag, ChevronRight, Wand2,
  Code, Brain, MessageSquare, Bug, Lightbulb
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface AITool {
  id: number;
  name: string;
  description: string;
  category: string;
  url: string;
  github_url: string;
  pricing: string;
  features: string[];
  tags: string[];
  stars: number;
  rating: number;
  logo_url: string;
  is_open_source: boolean;
  view_count: number;
}

export default function AITools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const categories = ['all', 'code', 'chat', 'image', 'audio', 'productivity'];

  const fetchTools = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (activeCategory && activeCategory !== 'all') params.append('category', activeCategory);

      // Use correct URL — no double /v1
      const response = await fetch(`http://localhost:5000/api/v1/content/tools?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch tools');
      
      const data = await response.json();
      setTools(data.tools || []);
    } catch (err: any) {
      setError(err.message);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [activeCategory]);

  const handleSearch = () => {
    fetchTools();
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      code: Code,
      chat: MessageSquare,
      image: Sparkles,
      audio: Sparkles,
      productivity: Brain,
    };
    return icons[category] || Wand2;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          AI Tools
        </h1>
        <p className="text-muted-foreground mt-1">Discover the best AI tools for developers</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search AI tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === 'all' ? '' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                (cat === 'all' && !activeCategory) || activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-slate-400">Loading AI tools...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Card variant="glass" className="p-6 text-center border-red-500/30">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchTools}>Retry</Button>
        </Card>
      )}

      {/* Tools Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Wand2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No AI tools found</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search or run the content fetcher</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                fetch('http://localhost:5000/api/v1/content/tools').then(r => r.json()).then(d => {
                  if (d.tools?.length > 0) {
                    setTools(d.tools);
                  }
                });
              }}>
                Refresh
              </Button>
            </div>
          ) : (
            tools.map(tool => (
              <motion.div key={tool.id} whileHover={{ y: -4 }}>
                <Card variant="glass" className="p-5 h-full hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                      {React.createElement(getCategoryIcon(tool.category), { className: "w-5 h-5 text-white" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{tool.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{tool.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="info" size="sm" className="text-xs">{tool.category}</Badge>
                    <Badge variant={tool.pricing === 'free' ? 'success' : 'warning'} size="sm" className="text-xs">
                      {tool.pricing}
                    </Badge>
                    {tool.is_open_source && (
                      <Badge variant="outline" size="sm" className="text-xs">Open Source</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{tool.stars}</span>
                    <span>⭐ {tool.rating}/5</span>
                  </div>

                  <div className="flex gap-2">
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full gap-1">
                        <ExternalLink className="w-3 h-3" /> Visit
                      </Button>
                    </a>
                    {tool.github_url && (
                      <a href={tool.github_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Code className="w-3 h-3" /> GitHub
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}