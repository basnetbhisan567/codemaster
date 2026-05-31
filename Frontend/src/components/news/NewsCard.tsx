import { ExternalLink, Clock } from 'lucide-react';

interface NewsCardProps {
  title: string;
  summary: string;
  source: string;
  url: string;
  readTime?: string;
}

export const NewsCard = ({ title, summary, source, url, readTime }: NewsCardProps) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="block p-3 glass rounded-lg hover:border-white/20 transition-all group">
    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{title}</h4>
    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{summary}</p>
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{source}</span>
        {readTime && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" /> {readTime}
          </span>
        )}
      </div>
      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </a>
);