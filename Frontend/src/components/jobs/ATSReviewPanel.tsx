import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { ATSResult } from '../../types/job';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { jobService } from '../../services/jobService';

export function ATSReviewPanel() {
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleATSReview = async () => {
    setLoading(true);
    try {
      const data = await jobService.reviewResume();
      setAtsResult(data);
    } catch (error) {
      console.error('ATS review failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!atsResult) {
    return (
      <Card variant="glass" className="p-6 border-white/10">
        <h3 className="text-lg font-semibold mb-3">ATS Resume Review</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get an AI-powered ATS score and actionable feedback for your resume.
        </p>
        <Button onClick={handleATSReview} disabled={loading} className="gap-2">
          <Target className="w-4 h-4" />
          {loading ? 'Analyzing...' : 'Analyze My Resume'}
        </Button>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card variant="glass" className="p-6 border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">ATS Resume Review</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleATSReview}
            disabled={loading}
            className="gap-2"
          >
            <RotateCcw className="w-3 h-3" />
            Re-analyze
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center text-2xl font-bold">
            {atsResult.score}
          </div>
          <div>
            <p className="font-semibold">ATS Score: {atsResult.score}/100</p>
            <p className="text-sm text-muted-foreground">{atsResult.overall_feedback}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {atsResult.strengths.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Improvements
            </h4>
            <ul className="space-y-1">
              {atsResult.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}