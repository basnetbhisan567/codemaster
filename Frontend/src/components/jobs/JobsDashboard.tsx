import { motion } from 'framer-motion';
import { Briefcase, Building2, Clock, Sparkles, Target, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useJobs } from '../../hooks/useJobs';

export function JobsDashboard() {
  const { stats, total, jobs, loading, error } = useJobs();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="glass" className="p-5 border-white/10 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/2 mb-2" />
            <div className="h-8 bg-white/10 rounded w-1/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="p-6 border-red-500/30">
        <p className="text-red-400">Error loading jobs: {error}</p>
      </Card>
    );
  }

  const cards = [
    {
      label: 'Total Jobs',
      value: total,
      icon: Briefcase,
      tone: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Remote Jobs',
      value: stats.remote,
      icon: Building2,
      tone: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Internships',
      value: stats.internships,
      icon: Target,
      tone: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Applied',
      value: stats.applied,
      icon: FileText,
      tone: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card variant="glass" className="p-5 border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${card.tone}`}>
                    {loading ? '...' : card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.tone}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="p-6 lg:col-span-2 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <p className="text-sm text-muted-foreground">
                Your next best steps for job search
              </p>
            </div>
            <Badge variant="success" size="sm">Active</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Use AI Job Assistant</span>
              </div>
              <Button size="sm" variant="ghost" className="gap-1">
                Open
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm">Review Resume & ATS Score</span>
              </div>
              <Button size="sm" variant="ghost" className="gap-1">
                Review
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Track Applications & Interviews</span>
              </div>
              <Button size="sm" variant="ghost" className="gap-1">
                Open
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-semibold">Recent Jobs</h2>
          </div>

          <div className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs loaded yet.</p>
            ) : (
              jobs.slice(0, 3).map((job) => (
                <div key={job.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-sm">
                      {job.company_logo || '🏢'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{job.company}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.remote && <Badge variant="success" size="sm">Remote</Badge>}
                        {job.salary && <Badge variant="info" size="sm">{job.salary}</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}