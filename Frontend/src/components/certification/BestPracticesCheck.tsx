import { CheckCircle, XCircle } from 'lucide-react';

interface BestPracticesCheckProps {
  checks: Array<{ name: string; passed: boolean }>;
}

export const BestPracticesCheck = ({ checks }: BestPracticesCheckProps) => {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
      <div className="space-y-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2">
            {check.passed ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">{check.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};