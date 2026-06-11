import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, Calendar, Edit3, Plus } from 'lucide-react';
import { Application } from '../../types/job';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { jobService } from '../../services/jobService';

export function ApplicationTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const statusColors: Record<string, string> = {
    saved: 'bg-gray-500',
    applied: 'bg-blue-500',
    interviewing: 'bg-yellow-500',
    offered: 'bg-purple-500',
    accepted: 'bg-green-500',
    rejected: 'bg-red-500',
  };

  const fetchApplications = async () => {
    try {
      const data = await jobService.getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: number, status: Application['status']) => {
    try {
      await jobService.updateApplicationStatus(appId, status);
      fetchApplications();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Application Tracker</h2>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Track New Application
        </Button>
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
      ) : applications.length === 0 ? (
        <Card variant="glass" className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No applications yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start applying to jobs to track them here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="glass" className="p-4 border-white/10">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold">{app.job_title}</h3>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                    {app.applied_at && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Applied: {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusColors[app.status]} text-white`}>
                      {app.status}
                    </Badge>
                    {app.ats_score && (
                      <Badge variant="warning" size="sm">ATS: {app.ats_score}%</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {(['applied', 'interviewing', 'offered', 'accepted', 'rejected'] as const).map(
                      (s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={app.status === s ? 'default' : 'ghost'}
                          className="text-xs"
                          onClick={() => handleUpdateStatus(app.id, s)}
                        >
                          {s}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                {app.notes && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    {app.notes}
                  </p>
                )}
                {app.interview_date && (
                  <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Interview: {new Date(app.interview_date).toLocaleDateString()}
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}