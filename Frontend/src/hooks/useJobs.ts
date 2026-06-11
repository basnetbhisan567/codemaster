import { useCallback, useEffect, useState } from 'react';
import { jobService, type Job, type JobStats } from '../services/jobService';


export const useJobs = (search?: string, remote?: boolean, tag?: string) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    remote: 0,
    internships: 0,
    saved: 0,
    applied: 0,
  });


  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await jobService.getAll(search, remote, tag);
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load jobs');
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, remote, tag]);


  const fetchStats = useCallback(async () => {
    try {
      const data = await jobService.getStats();
      setStats(data);
    } catch {
      setStats({ total: 0, remote: 0, internships: 0, saved: 0, applied: 0 });
    }
  }, []);

  // NEW: Get single job by ID
  const getJobById = useCallback(async (id: string | number): Promise<Job | null> => {
    try {
      const data = await jobService.getById(Number(id));
      return data;
    } catch {
      return null;
    }
  }, []);

  // NEW: Toggle save job
  const toggleSave = useCallback(async (id: number) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      await jobService.saveJob(id);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, saved: !j.saved } : j))
      );
    }
  }, [jobs]);


  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [fetchJobs, fetchStats]);


  return {
    jobs,
    loading,
    error,
    total,
    stats,
    refetch: fetchJobs,
    refetchStats: fetchStats,
    getJobById,
    toggleSave,
  };
};