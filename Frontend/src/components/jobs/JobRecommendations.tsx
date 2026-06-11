import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Job } from '../../types/job';
import { JobCard } from './JobCard';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { jobService } from '../../services/jobService';

export function JobRecommendations() {
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await jobService.getRecommendations();
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleToggleSave = async (id: number) => {
    console.log('Toggle save job:', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended Jobs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered recommendations based on your profile
          </p>
        </div>
        <Badge variant="success" size="sm">
          {recommendations.length} matches
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="glass" className="p-4 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <Card variant="glass" className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No recommendations yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your resume to get personalized job recommendations
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <JobCard job={job} onToggleSave={handleToggleSave} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}