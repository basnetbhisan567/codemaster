import { motion } from 'framer-motion';
import { JobCard } from './JobCard';
import { Job } from '../../types/job';
import { Search } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  selectedJobId?: number | null;
  onToggleSave?: (id: number) => void;
  onSelectJob?: (job: Job) => void;
}

export const JobList = ({ jobs, loading, selectedJobId, onToggleSave, onSelectJob }: JobListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 bg-white/10 rounded w-16" />
                  <div className="h-6 bg-white/10 rounded w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job, index) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onSelectJob?.(job)}
        >
          <JobCard
            job={job}
            onToggleSave={onToggleSave}
            isSelected={selectedJobId === job.id}
          />
        </motion.div>
      ))}
    </div>
  );
};