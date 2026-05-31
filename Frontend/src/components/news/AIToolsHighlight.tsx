import { Sparkles, ExternalLink } from 'lucide-react';

interface Tool {
  name: string;
  description: string;
  url?: string;
}

interface AIToolsHighlightProps {
  tools: Tool[];
}

export const AIToolsHighlight = ({ tools }: AIToolsHighlightProps) => (
  <div className="glass-card p-6 h-full">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <h3 className="font-semibold">Featured AI Tools</h3>
    </div>
    <div className="space-y-3">
      {tools.map((tool, i) => (
        <div key={i} className="p-3 glass rounded-lg hover:border-white/20 transition-all cursor-pointer group">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium group-hover:text-primary transition-colors">{tool.name}</p>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
        </div>
      ))}
    </div>
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-xs text-center text-muted-foreground">
        🔥 Trending: AI Code Assistants
      </p>
    </div>
  </div>
);