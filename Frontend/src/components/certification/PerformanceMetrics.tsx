import { Clock, Database } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: {
    timeComplexity: string;
    spaceComplexity: string;
  };
}

export const PerformanceMetrics = ({ metrics }: PerformanceMetricsProps) => {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Performance</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Time Complexity</p>
            <p className="font-mono text-lg">{metrics.timeComplexity}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Space Complexity</p>
            <p className="font-mono text-lg">{metrics.spaceComplexity}</p>
          </div>
        </div>
      </div>
    </div>
  );
};