import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Briefcase, DollarSign, Globe } from 'lucide-react';
import { JobList } from './JobList';
import { Job } from '../../types/job';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useJobs } from '../../hooks/useJobs';

export function JobSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { jobs, loading, total, refetch } = useJobs(
    searchQuery || undefined,
    remoteOnly || undefined
  );

  const handleToggleSave = async (id: number) => {
    console.log('Toggle save job:', id);
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, company, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && refetch()}
            className="pl-10"
          />
        </div>
        <Button
          variant={remoteOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRemoteOnly(!remoteOnly)}
          className="gap-2"
        >
          <Globe className="w-4 h-4" />
          Remote Only
        </Button>
        <Button onClick={refetch} size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Search
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>{total} jobs found</p>
        {selectedJob && (
          <Badge variant="info">Selected: {selectedJob.title}</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JobList
            jobs={jobs}
            loading={loading}
            selectedJobId={selectedJob?.id}
            onToggleSave={handleToggleSave}
            onSelectJob={handleSelectJob}
          />
        </div>

        {selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card variant="glass" className="p-6 border-white/10">
              <h3 className="text-lg font-semibold mb-4">Job Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">{selectedJob.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">{selectedJob.location}</Badge>
                  {selectedJob.remote && <Badge variant="success">Remote</Badge>}
                  {selectedJob.salary && <Badge variant="warning">{selectedJob.salary}</Badge>}
                </div>
                {selectedJob.tags && selectedJob.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedJob.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" size="sm">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}