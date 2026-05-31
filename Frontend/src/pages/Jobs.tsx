import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Filter, X, Briefcase, Award } from 'lucide-react';
import { JobList } from '../components/jobs/JobList';
import { JobDetailCard } from '../components/jobs/JobDetailCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { useJobs } from '../hooks/useJobs';
import { Job, JobType, ExperienceLevel, JobCategory } from '../types/job';

const jobTypes: (JobType | 'All')[] = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const experienceLevels: (ExperienceLevel | 'All')[] = ['All', 'Entry Level', 'Mid Level', 'Senior', 'Lead', 'Principal'];
const categories: (JobCategory | 'All')[] = ['All', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Cloud', 'Security', 'Other'];

export default function Jobs() {
  const { jobs, loading, filters, updateFilters, clearFilters, toggleSave, stats } = useJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  const handleSearch = () => {
    updateFilters({ search: searchInput });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const activeFiltersCount = Object.keys(filters).filter(k => 
    k !== 'search' && filters[k as keyof typeof filters] && filters[k as keyof typeof filters] !== 'All'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Find Your Next Opportunity
        </h1>
        <p className="text-muted-foreground">
          Discover jobs, internships, and freelance work matching your skills
        </p>
      </div>

      <Card variant="glass" className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="primary" size="sm">{activeFiltersCount}</Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="w-3 h-3" />
                Clear all
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Job Type
                </label>
                <select
                  value={filters.type || 'All'}
                  onChange={(e) => updateFilters({ type: e.target.value as JobType | 'All' })}
                  className="w-full p-2 glass rounded-lg border border-white/10 text-sm bg-background"
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Experience
                </label>
                <select
                  value={filters.experience || 'All'}
                  onChange={(e) => updateFilters({ experience: e.target.value as ExperienceLevel | 'All' })}
                  className="w-full p-2 glass rounded-lg border border-white/10 text-sm bg-background"
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category || 'All'}
                  onChange={(e) => updateFilters({ category: e.target.value as JobCategory | 'All' })}
                  className="w-full p-2 glass rounded-lg border border-white/10 text-sm bg-background"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.remote || false}
                onChange={(e) => updateFilters({ remote: e.target.checked })}
                className="rounded border-white/20"
              />
              <span className="text-sm">Remote only</span>
            </label>
          </motion.div>
        )}
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card variant="glass" className="p-3 text-center">
          <p className="text-xl font-bold text-primary">{stats.totalJobs}+</p>
          <p className="text-xs text-muted-foreground">Active Jobs</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <p className="text-xl font-bold text-green-400">{stats.remoteJobs}</p>
          <p className="text-xs text-muted-foreground">Remote Jobs</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <p className="text-xl font-bold text-yellow-400">{stats.savedJobs}</p>
          <p className="text-xs text-muted-foreground">Saved Jobs</p>
        </Card>
        <Card variant="glass" className="p-3 text-center">
          <p className="text-xl font-bold text-purple-400">{stats.categories}</p>
          <p className="text-xs text-muted-foreground">Categories</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 max-h-[700px] overflow-y-auto pr-2">
          <JobList
            jobs={jobs}
            loading={loading}
            selectedJobId={selectedJob?.id}
            onToggleSave={toggleSave}
            onSelectJob={setSelectedJob}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedJob ? (
            <JobDetailCard job={selectedJob} onToggleSave={toggleSave} />
          ) : (
            <Card variant="glass" className="p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a job to view details</h3>
              <p className="text-muted-foreground">
                Click on any job listing to see the full description and apply
              </p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}