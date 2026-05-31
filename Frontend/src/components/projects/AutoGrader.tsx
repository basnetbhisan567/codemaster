import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

interface TestCase {
  name: string;
  passed: boolean;
  message?: string;
}

interface AutoGraderProps {
  testCases: TestCase[];
  isGrading: boolean;
  score?: number;
}

export const AutoGrader = ({ testCases, isGrading, score }: AutoGraderProps) => {
  const passedCount = testCases.filter(t => t.passed).length;
  const totalCount = testCases.length;
  const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  if (isGrading) {
    return (
      <div className="glass-card p-8 text-center">
        <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
        <h3 className="font-semibold mb-2">Grading in Progress...</h3>
        <p className="text-sm text-muted-foreground">Running test cases</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Test Results</h3>
        {score !== undefined && (
          <div className="text-2xl font-bold text-primary">{score}/100</div>
        )}
      </div>
      
      <ProgressBar value={passRate} showLabel />
      
      <div className="space-y-2 mt-4">
        {testCases.map((test, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20"
          >
            {test.passed ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-sm">{test.name}</p>
              {test.message && (
                <p className="text-xs text-muted-foreground mt-1">{test.message}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};