import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { JobDetailCard } from '../components/jobs/JobDetailCard';
import { Button } from '../components/ui/Button';
import { useJobs } from '../hooks/useJobs';
import { Job } from '../types/job';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, toggleSave } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getJobById(id);
      setJob(data);
      setLoading(false);
    };
    fetchJob();
  }, [id, getJobById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Button variant="ghost" onClick={() => navigate('/jobs')} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Button>
      <JobDetailCard job={job} onToggleSave={toggleSave} />
    </motion.div>
  );
}