import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, DollarSign, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { jobService } from '../../services/jobService';
import { Job } from '../../types/job';

export const JobsWidget = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, remote: 0 });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobData = await jobService.getAll();
        const statData = await jobService.getStats();

        setJobs(jobData.jobs || []);
        setStats({
          total: statData.total || 0,
          remote: statData.remote || 0,
        });
      } catch {
        setJobs([]);
        setStats({ total: 0, remote: 0 });
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  const timeAgo = (date?: string) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Latest Job Opportunities</h2>
            <p className="text-sm text-slate-300">
              {stats.total} jobs available • {stats.remote} remote
            </p>
          </div>
        </div>
        <Link to="/jobs">
          <Button variant="outline" size="sm" className="gap-2">
            View All Jobs
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
              <div className="flex gap-2">
                <div className="h-5 bg-white/10 rounded w-16" />
                <div className="h-5 bg-white/10 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-6">
          No jobs available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/jobs/${job.id}`}>
                <Card variant="interactive" className="p-4 h-full group">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-2xl">{job.company_logo || '🏢'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{job.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="info" size="sm" className="text-xs">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {job.location}
                    </Badge>
                    {job.remote && (
                      <Badge variant="success" size="sm" className="text-xs">
                        Remote
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    {job.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(job.posted_at)}
                    </span>
                  </div>

                  {job.tags && job.tags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {job.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-1.5 py-0.5 glass rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};