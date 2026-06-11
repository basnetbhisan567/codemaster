import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock, DollarSign, Building2, Globe, Bookmark, ExternalLink, Zap } from 'lucide-react';
import { Job } from '../../types/job';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface JobDetailCardProps {
  job: Job;
  onToggleSave?: (id: number) => void;
}

export const JobDetailCard = ({ job, onToggleSave }: JobDetailCardProps) => {
  const timeAgo = (date?: string) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-3xl flex-shrink-0">
          {job.company_logo || '🏢'}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{job.title}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {job.company}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleSave?.(job.id)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  job.saved
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10'
                )}
              >
                <Bookmark className={cn('w-5 h-5', job.saved && 'fill-current')} />
              </button>

              <Button className="gap-2">
                Apply Now
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="info" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </Badge>
            {job.salary && (
              <Badge variant="warning" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {job.salary}
              </Badge>
            )}
            {job.remote && (
              <Badge variant="success" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Remote
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 p-4 glass rounded-lg text-sm">
        {timeAgo(job.posted_at) && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Posted {timeAgo(job.posted_at)}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Skills & Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, i) => (
              <Badge key={i} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{job.description}</p>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Requirements</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            {job.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Apply button */}
      <div className="pt-4 border-t border-white/10">
        <Button className="w-full gap-2" size="lg">
          Apply for this position
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};