import { motion } from 'framer-motion';
import { AIToolsHighlight } from '../components/news/AIToolsHighlight';
import { Card } from '../components/ui/card';
import { Sparkles, ExternalLink, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AITools() {
  const aiTools = [
    { name: 'GitHub Copilot', description: 'AI pair programmer that suggests code completions', url: '#', category: 'Code', pricing: 'Freemium' as const, rating: 4.8 },
    { name: 'Cursor', description: 'AI-first code editor with powerful editing features', url: '#', category: 'Editor', pricing: 'Free' as const, rating: 4.9 },
    { name: 'v0 by Vercel', description: 'Generate UI components with AI prompts', url: '#', category: 'UI', pricing: 'Free' as const, rating: 4.7 },
    { name: 'Claude', description: 'Advanced AI assistant for complex reasoning', url: '#', category: 'Assistant', pricing: 'Freemium' as const, rating: 4.8 },
    { name: 'Tabnine', description: 'AI code completion for all major IDEs', url: '#', category: 'Code', pricing: 'Free' as const, rating: 4.6 },
    { name: 'Replit Ghostwriter', description: 'AI-powered coding in the browser', url: '#', category: 'IDE', pricing: 'Freemium' as const, rating: 4.5 },
    { name: 'Codeium', description: 'Free AI code assistant with autocomplete', url: '#', category: 'Code', pricing: 'Free' as const, rating: 4.7 },
    { name: 'Phind', description: 'AI search engine for developers', url: '#', category: 'Search', pricing: 'Free' as const, rating: 4.6 },
    { name: 'Warp', description: 'AI-powered terminal with smart completions', url: '#', category: 'Terminal', pricing: 'Free' as const, rating: 4.7 },
  ];

  const categories = ['All', 'Code', 'Editor', 'Assistant', 'UI', 'Search', 'Terminal', 'IDE'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">AI Tools for Developers</h1>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, i) => (
          <Button key={i} variant={i === 0 ? 'default' : 'outline'} size="sm" className="rounded-full">
            {cat}
          </Button>
        ))}
      </div>

      {/* Featured Tool */}
      <AIToolsHighlight tools={aiTools.slice(0, 4)} />

      {/* All Tools Grid */}
      <h2 className="text-xl font-semibold">All AI Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiTools.map((tool, i) => (
          <Card key={i} variant="interactive" className="p-5 group">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold group-hover:text-primary transition-colors">{tool.name}</h3>
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-1 mb-3">{tool.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">{tool.category}</span>
              <span className="text-xs px-2 py-1 glass rounded-full">{tool.pricing}</span>
              <span className="text-xs text-yellow-400 ml-auto flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-current" />
                {tool.rating}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}