import { useState, useEffect, useCallback } from 'react';
import { jobService } from '../services/jobService';
import { Job, JobFilters } from '../types/job';

export const useJobs = (initialFilters?: Partial<JobFilters>) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Partial<JobFilters>>(initialFilters || {});
  const [stats, setStats] = useState({
    totalJobs: 0,
    remoteJobs: 0,
    savedJobs: 0,
    categories: 0,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = Object.keys(filters).length > 0
        ? await jobService.getFiltered(filters)
        : await jobService.getAll();
      setJobs(data);
      
      const statsData = await jobService.getStats();
      setStats(statsData);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Jobs fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const getJobById = useCallback(async (id: string) => {
    try {
      return await jobService.getById(id);
    } catch (err) {
      console.error('Failed to get job:', err);
      return null;
    }
  }, []);

  const toggleSave = useCallback(async (id: string) => {
    try {
      const saved = await jobService.toggleSave(id);
      setJobs(prev => prev.map(job =>
        job.id === id ? { ...job, saved } : job
      ));
      const statsData = await jobService.getStats();
      setStats(statsData);
      return saved;
    } catch (err) {
      console.error('Failed to toggle save:', err);
      return false;
    }
  }, []);

  const getSavedJobs = useCallback(async () => {
    try {
      return await jobService.getSaved();
    } catch (err) {
      console.error('Failed to get saved jobs:', err);
      return [];
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    jobs,
    loading,
    error,
    filters,
    stats,
    updateFilters,
    clearFilters,
    getJobById,
    toggleSave,
    getSavedJobs,
    refetch: fetchJobs,
  };
};