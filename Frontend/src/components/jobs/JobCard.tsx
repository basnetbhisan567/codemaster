import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock, DollarSign, Building2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Job } from '../../types/job';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface JobCardProps {
  job: Job;
  onToggleSave?: (id: number) => void;
  isSelected?: boolean;
}

export const JobCard = ({ job, onToggleSave, isSelected }: JobCardProps) => {
  const timeAgo = (date?: string) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'glass-card p-4 cursor-pointer transition-all',
        isSelected && 'border-primary/50 shadow-lg shadow-primary/20'
      )}
      onClick={() => onToggleSave?.(job.id)}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0">
          {job.company_logo || '🏢'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/jobs/${job.id}`} className="flex-1">
              <h3 className="font-semibold truncate hover:text-primary transition-colors">
                {job.title}
              </h3>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave?.(job.id);
              }}
              className={cn(
                'p-1.5 rounded-lg transition-colors flex-shrink-0',
                job.saved
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10'
              )}
            >
              <Bookmark className={cn('w-4 h-4', job.saved && 'fill-current')} />
            </button>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {job.company}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="info" size="sm" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </Badge>
            {job.remote && <Badge variant="success" size="sm">🌍 Remote</Badge>}
            {job.salary && (
              <Badge variant="warning" size="sm" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {job.salary}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {job.tags?.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 glass rounded-full text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {job.tags && job.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 glass rounded-full text-muted-foreground">
                +{job.tags.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {timeAgo(job.posted_at) && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(job.posted_at)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};